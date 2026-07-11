import { GitHubService } from './github';
import { LLMService } from './llm';
import { PlaywrightRunner, TestResult } from './runner';
import fs from 'fs/promises';
import path from 'path';
import { exec, spawn, ChildProcess } from 'child_process';
import util from 'util';
import os from 'os';
import express from 'express';
import { Server } from 'http';
import { chromium } from 'playwright';

const execAsync = util.promisify(exec);

export class GitHubAgent {
  private github: GitHubService;
  private llm: LLMService;
  private githubToken: string;

  constructor(githubToken: string, geminiKey: string, _projectRoot?: string) {
    this.githubToken = githubToken;
    this.github = new GitHubService(githubToken);
    this.llm = new LLMService(geminiKey);
  }

  async processPullRequest(owner: string, repo: string, pullNumber: number) {
    console.log(`Processing PR #${pullNumber} for ${owner}/${repo}`);
    
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tempCloneDir = path.join(os.tmpdir(), `testforge-clone-${uniqueId}`);
    const testRunDir = path.join(process.cwd(), 'src', 'temp_tests', `run-${uniqueId}`);
    const runner = new PlaywrightRunner(testRunDir);
    
    let staticServer: Server | null = null;
    let devServerProcess: ChildProcess | null = null;
    let appUrl = '';

    try {
      await fs.mkdir(tempCloneDir, { recursive: true });
      await fs.mkdir(testRunDir, { recursive: true });

      // 1. Get changed files
      const changedFiles = await this.github.getPullRequestFiles(owner, repo, pullNumber);
      if (changedFiles.length === 0) {
        console.log('No files changed.');
        return { passedCount: 0, autoFixedCount: 0, realBugsCount: 0 };
      }

      // 2. Clone repo fresh into the temp folder
      console.log(`Cloning repository into ${tempCloneDir}...`);
      const cloneUrl = `https://${this.githubToken}@github.com/${owner}/${repo}.git`;
      await execAsync(`git clone ${cloneUrl} .`, { cwd: tempCloneDir });

      // Checkout PR code locally
      await execAsync(`git fetch origin pull/${pullNumber}/head:pr-${pullNumber}`, { cwd: tempCloneDir });
      await execAsync(`git checkout pr-${pullNumber}`, { cwd: tempCloneDir });

      // 3. Detect Project Type and Serve
      const packageJsonPath = path.join(tempCloneDir, 'package.json');
      let hasPackageJson = false;
      let packageJson: any = {};
      try {
        const fileData = await fs.readFile(packageJsonPath, 'utf8');
        packageJson = JSON.parse(fileData);
        hasPackageJson = true;
      } catch (e) {}

      if (hasPackageJson) {
        console.log('Detected package.json, running npm install...');
        try {
          const installOutput = await execAsync('npm install --legacy-peer-deps', { cwd: tempCloneDir });
          console.log('--- NPM INSTALL STDOUT ---\n', installOutput.stdout);
          if (installOutput.stderr) console.log('--- NPM INSTALL STDERR ---\n', installOutput.stderr);
        } catch (err: any) {
          console.error(`npm install failed with exit code ${err.code || 'unknown'}`);
          console.log('--- NPM INSTALL STDOUT ---\n', err.stdout);
          console.log('--- NPM INSTALL STDERR ---\n', err.stderr);
          await this.github.postComment(owner, repo, pullNumber, `### 🤖 TestForge AI Agent Report\n\n🚨 **Error:** Could not install dependencies (exit code ${err.code || 'unknown'}).\n\`\`\`\n${(err.stderr || err.message).substring(0, 1000)}\n\`\`\``);
          return { passedCount: 0, autoFixedCount: 0, realBugsCount: 0 };
        }

        let served = false;
        const isNextJs = !!(packageJson.dependencies?.next || packageJson.devDependencies?.next);

        // 1. Static build logic
        if (packageJson.scripts?.build) {
          console.log('Detected build script, running npm run build...');
          try {
            const buildOutput = await execAsync('npm run build', { cwd: tempCloneDir });
            console.log('--- NPM BUILD STDOUT ---\n', buildOutput.stdout);
            if (buildOutput.stderr) console.log('--- NPM BUILD STDERR ---\n', buildOutput.stderr);
          } catch (err: any) {
            console.error(`Build command failed with exit code ${err.code || 'unknown'}`);
            console.log('--- NPM BUILD STDOUT ---\n', err.stdout);
            console.log('--- NPM BUILD STDERR ---\n', err.stderr);
            await this.github.postComment(owner, repo, pullNumber, `### 🤖 TestForge AI Agent Report\n\n🚨 **Error:** Build failed (exit code ${err.code || 'unknown'}).\n\`\`\`\n${(err.stderr || err.message).substring(0, 1000)}\n\`\`\``);
            return { passedCount: 0, autoFixedCount: 0, realBugsCount: 0 };
          }

          if (isNextJs) {
            console.log('Detected Next.js project. Skipping static folder search to use dynamic server.');
          } else {
            console.log('Searching for build output folder...');
            const dirsToCheck: string[] = [];
            for (const base of ['dist', 'build', 'out', '.output/public', 'public']) {
              const basePath = path.join(tempCloneDir, base);
              if (await fs.stat(basePath).catch(() => false)) {
                dirsToCheck.push(basePath);
                // For Angular, check 1 level deep, and 1 level deep + /browser
                if (base === 'dist') {
                  try {
                    const subdirs = await fs.readdir(basePath, { withFileTypes: true });
                    for (const sub of subdirs) {
                      if (sub.isDirectory()) {
                        dirsToCheck.push(path.join(basePath, sub.name));
                        dirsToCheck.push(path.join(basePath, sub.name, 'browser'));
                      }
                    }
                  } catch (e) {}
                }
              }
            }

            let serveDir: string | null = null;
            for (const dirPath of dirsToCheck) {
              const indexExists = await fs.stat(path.join(dirPath, 'index.html')).catch(() => false);
              const relPath = path.relative(tempCloneDir, dirPath);
              console.log(`- /${relPath} exists. index.html present: ${!!indexExists}`);
              if (indexExists) {
                serveDir = dirPath;
                console.log(`Build output found in /${relPath}, serving statically.`);
                break;
              }
            }

            if (serveDir) {
              const app = express();
              app.use(express.static(serveDir));
              app.get('*', (req, res) => res.sendFile(path.join(serveDir!, 'index.html')));
              const port = Math.floor(Math.random() * 10000) + 10000;
              appUrl = `http://127.0.0.1:${port}`;
              staticServer = app.listen(port, () => console.log(`Static server running at ${appUrl}`));
              served = true;
            } else {
              console.log('No static index.html found. Falling back to dynamic server mode...');
            }
          }
        }

        // 2 & 3. Start/Preview/Dev script logic
        if (!served) {
          let runCmd = packageJson.scripts?.start ? 'npm start' : 
                       packageJson.scripts?.preview ? 'npm run preview' : 
                       packageJson.scripts?.dev ? 'npm run dev' : null;

          if (isNextJs && packageJson.scripts?.build && !runCmd) {
             runCmd = 'npx next start';
          }

          if (runCmd) {
            const dynamicPort = Math.floor(Math.random() * 5000) + 4000;
            console.log(`Found script, running dynamic server: ${runCmd} (on PORT ${dynamicPort})`);
            const cmdParts = runCmd.split(' ');
            devServerProcess = spawn(cmdParts[0], cmdParts.slice(1), { 
              cwd: tempCloneDir, 
              shell: true,
              env: { ...process.env, PORT: dynamicPort.toString() }
            });
            
            const urlFromDev: string | null = await new Promise((resolve) => {
              let resolved = false;
              let timeout = setTimeout(() => {
                if (!resolved) {
                   console.error('Dynamic server timeout reached (90s)');
                   resolve(null);
                }
              }, 90000);

              let elapsed = 0;
              const interval = setInterval(() => {
                if (resolved) {
                  clearInterval(interval);
                  return;
                }
                elapsed += 5;
                console.log(`Still waiting for dynamic server to start... (${elapsed}s elapsed)`);
              }, 5000);

              const checkOutput = (data: Buffer) => {
                const out = data.toString();
                process.stdout.write(`[Dynamic Server] ${out}`); // Print real-time output
                
                if (resolved) return;
                const match = out.match(/http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/);
                if (match) {
                  resolved = true;
                  clearTimeout(timeout);
                  clearInterval(interval);
                  resolve(`http://127.0.0.1:${match[1]}`);
                }
              };
              devServerProcess!.stdout?.on('data', checkOutput);
              devServerProcess!.stderr?.on('data', checkOutput);
              devServerProcess!.on('exit', () => {
                if (!resolved) {
                  clearInterval(interval);
                  resolve(null);
                }
              });
            });

            if (urlFromDev) {
              appUrl = urlFromDev;
              console.log(`Dynamic server ready at ${appUrl}`);
              served = true;
            } else {
              console.error('Dynamic server failed to expose a port or timed out.');
            }
          }
        }

        // 5. Hard failure
        if (!served) {
           console.error('Could not determine how to serve this project.');
           await this.github.postComment(owner, repo, pullNumber, `### 🤖 TestForge AI Agent Report\n\n🚨 **Error:** Could not determine how to run or serve this project. No static build found, and no start/preview/dev scripts were successful.`);
           return { passedCount: 0, autoFixedCount: 0, realBugsCount: 0 };
        }

      } else {
        // 4. No package.json logic
        console.log('No package.json found, serving raw static files');
        const app = express();
        app.use(express.static(tempCloneDir));
        const port = Math.floor(Math.random() * 10000) + 10000;
        appUrl = `http://127.0.0.1:${port}`;
        staticServer = app.listen(port, () => console.log(`Static server running at ${appUrl}`));
      }

      // DEBUG BUG 2: Take a screenshot and dump HTML to see what's actually serving
      console.log(`[DEBUG] Loading ${appUrl} to capture screenshot and HTML...`);
      let htmlContent = '';
      let visibleText = '';
      try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        await page.screenshot({ path: path.join(process.cwd(), 'debug-screenshot.png') });
        htmlContent = await page.content();
        visibleText = await page.locator('body').innerText().catch(() => '');
        console.log('--- DEBUG HTML DUMP ---');
        console.log(htmlContent.substring(0, 1000) + '... (truncated for console)');
        console.log('-----------------------');
        await browser.close();
      } catch (e) {
        console.error('[DEBUG] Failed to load appUrl for debugging:', e);
      }

      // 4. Generate new tests with LLM
      console.log('Generating new test cases...');
      const newTestCode = await this.llm.generateTestCases(changedFiles, appUrl, htmlContent, visibleText);
      if (newTestCode && newTestCode.trim().length > 0) {
        const testPath = path.join(testRunDir, `pr-${pullNumber}.spec.ts`);
        await fs.writeFile(testPath, newTestCode);
        console.log(`Wrote new tests to ${testPath}`);
      } else {
        console.log('LLM did not return any test code. Proceeding with existing tests if any.');
      }

      // 5. Run all tests in the sandbox
      console.log(`Running tests in sandbox: ${testRunDir}`);
      let results = await runner.runTests();
      
      console.log('RAW PLAYWRIGHT RESULTS:', JSON.stringify(results, null, 2));
      
      // 6. Handle failures
      let autoFixedCount = 0;
      const realBugs: TestResult[] = [];
      
      for (const result of results) {
        if (!result.passed && result.error) {
          if (result.isLocatorError) {
            console.log(`Attempting to auto-fix locator error in ${result.file}`);
            try {
              // BUG 1 FIX: use path.basename to avoid duplicate run-xxx folders
              const filePath = path.join(testRunDir, path.basename(result.file));
              const fileContent = await fs.readFile(filePath, 'utf-8');
              const fixedContent = await this.llm.fixLocator(result.error, fileContent);
              if (fixedContent && fixedContent !== fileContent) {
                await fs.writeFile(filePath, fixedContent);
                autoFixedCount++;
                console.log(`Auto-fixed ${result.file}`);
              }
            } catch (e) {
              console.error(`Failed to auto-fix ${result.file}`, e);
            }
          } else {
            realBugs.push(result);
          }
        }
      }

      // Re-run if we fixed anything to confirm
      if (autoFixedCount > 0) {
        console.log('Re-running tests after auto-fix...');
        results = await runner.runTests();
        console.log('RAW PLAYWRIGHT RESULTS (AFTER AUTO-FIX):', JSON.stringify(results, null, 2));
        realBugs.length = 0; // Clear previous bugs
        for (const result of results) {
          if (!result.passed && result.error) {
             realBugs.push(result);
          }
        }
      }

      // 7. Post summary comment
      const passedCount = results.filter(r => r.passed).length;
      let commentBody = `### 🤖 TestForge AI Agent Report\n\n`;
      commentBody += `✅ **Tests Passed:** ${passedCount}\n`;
      commentBody += `🔧 **Tests Auto-fixed:** ${autoFixedCount}\n`;
      
      if (realBugs.length > 0) {
        commentBody += `\n🚨 **Real Bugs Found:** ${realBugs.length}\n`;
        for (const bug of realBugs) {
          commentBody += `\n**File:** \`${bug.file}\`\n**Error:**\n\`\`\`\n${bug.error?.substring(0, 500)}...\n\`\`\`\n`;
        }
      } else {
        commentBody += `\n🎉 No real bugs found!`;
      }

      console.log('Posting comment to PR...');
      await this.github.postComment(owner, repo, pullNumber, commentBody);
      
      return {
        passedCount,
        autoFixedCount,
        realBugsCount: realBugs.length
      };

    } catch (e: any) {
      console.error('Agent process failed unexpectedly:', e);
      // Try to gracefully notify about the unhandled crash
      try {
        await this.github.postComment(owner, repo, pullNumber, `### 🤖 TestForge AI Agent Report\n\n🚨 **System Error:** The agent encountered an unexpected crash.\n\`\`\`\n${e.message}\n\`\`\``);
      } catch (err) {
         console.error('Failed to post crash comment:', err);
      }
      return { passedCount: 0, autoFixedCount: 0, realBugsCount: 0 };
    } finally {
      // 8. Cleanup everything safely
      if (staticServer) {
        staticServer.close();
        console.log('Static server shut down.');
      }
      if (devServerProcess) {
        devServerProcess.kill();
        console.log('Dev server process killed.');
      }
      console.log(`Cleaning up ${tempCloneDir} and ${testRunDir}`);
      try {
        await fs.rm(tempCloneDir, { recursive: true, force: true }).catch(() => {});
        await fs.rm(testRunDir, { recursive: true, force: true }).catch(() => {});
      } catch (e) {
        console.error('Failed to cleanup directories', e);
      }
    }
  }
}
