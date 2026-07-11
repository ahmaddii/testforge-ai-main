import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    console.log("GitHub Token inside GitHubService:", token ? `Token length: ${token.length}` : "UNDEFINED");
    this.octokit = new Octokit({ auth: token });
  }

  async getPullRequestFiles(owner: string, repo: string, pullNumber: number) {
    let data;
    try {
      const response = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber,
      });
      data = response.data;
    } catch (e: any) {
      if (e.status === 404) {
        throw new Error(`Could not find Pull Request #${pullNumber} in repository ${owner}/${repo}. Please check the repo name and PR number.`);
      }
      throw e;
    }
    
    // Fetch file contents for modified or added files
    const filesWithContent = await Promise.all(
      data.filter(file => file.status !== 'removed').map(async (file) => {
        const content = await this.getFileContent(owner, repo, file.filename, pullNumber);
        return {
          filename: file.filename,
          patch: file.patch,
          content,
          status: file.status,
        };
      })
    );
    
    return filesWithContent;
  }

  async getFileContent(owner: string, repo: string, path: string, pullNumber: number): Promise<string> {
    try {
      const { data: prData } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
      });

      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: prData.head.sha,
      });
      
      if ('content' in data && data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return '';
    } catch (e) {
      console.error(`Error fetching content for ${path}:`, e);
      return '';
    }
  }

  async postComment(owner: string, repo: string, pullNumber: number, body: string) {
    await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: pullNumber,
      body,
    });
  }
}
