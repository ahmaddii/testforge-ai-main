import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = util.promisify(exec);

export interface TestResult {
  passed: boolean;
  file: string;
  error?: string;
  isLocatorError?: boolean;
}

export class PlaywrightRunner {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async runTests(): Promise<TestResult[]> {
    const reportPath = path.join(this.projectRoot, 'playwright-report.json');
    try {
      // Run playwright from the backend root, but specifically target the dynamic testRunDir
      const configPath = path.join(process.cwd(), 'playwright.config.ts');
      await execAsync(`npx playwright test ${this.projectRoot} --config=${configPath} --reporter=json`, {
        cwd: process.cwd(),
        env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath }
      });
      // If it passes, execAsync returns
      return this.parseReport(reportPath);
    } catch (e: any) {
      // If tests fail, execAsync throws
      return this.parseReport(reportPath);
    }
  }

  private async parseReport(reportPath: string): Promise<TestResult[]> {
    try {
      const reportData = await fs.readFile(reportPath, 'utf-8');
      
      // Temporarily log the ENTIRE raw playwright-report.json file content
      console.log('--- RAW PLAYWRIGHT REPORT FILE ---');
      console.log(reportData);
      console.log('----------------------------------');

      const report = JSON.parse(reportData);
      const results: TestResult[] = [];
      
      const extractSpecs = (suite: any) => {
        if (suite.specs) {
          for (const spec of suite.specs) {
            for (const test of spec.tests || []) {
              for (const result of test.results || []) {
                const passed = result.status === 'expected' || result.status === 'passed';
                let error = '';
                let isLocatorError = false;
                
                if (!passed && result.error) {
                  error = result.error.message || result.error.stack || 'Unknown error';
                  // Very naive check for locator errors
                  isLocatorError = error.includes('locator') || error.includes('Timeout') || error.includes('waiting for selector');
                }
                
                results.push({
                  passed,
                  file: spec.file || suite.file || 'unknown.spec.ts',
                  error: passed ? undefined : error,
                  isLocatorError,
                });
              }
            }
          }
        }
        if (suite.suites) {
          for (const subSuite of suite.suites) {
            extractSpecs(subSuite);
          }
        }
      };

      for (const suite of report.suites || []) {
        extractSpecs(suite);
      }
      
      return results;
    } catch (e) {
      console.error(`Error parsing Playwright report at ${reportPath}`, e);
      return [];
    }
  }
}
