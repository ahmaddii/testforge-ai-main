
export interface RepoFile {
  path: string;
  type: 'file' | 'dir';
  content?: string;
}

/**
 * Service to interact with GitHub API
 */
export class GitHubService {
  private static baseUrl = 'https://api.github.com';
  private static token = process.env.GITHUB_TOKEN;

  private static getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Speclane-AI-Assistant'
    };
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    return headers;
  }

  /**
   * Parses a GitHub URL to get owner and repo name
   */
  static parseUrl(url: string) {
    try {
      const parts = url.replace('https://github.com/', '').split('/');
      return { owner: parts[0], repo: parts[1].replace('.git', '') };
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetches the file tree of a repository
   */
  static async getFileTree(owner: string, repo: string, branch = 'main'): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return [];
      const data: any = await response.json();
      return data.tree || [];
    } catch (e) {
      console.error('GitHub API Error:', e);
      return [];
    }
  }

  /**
   * Fetches the content of a specific file
   */
  static async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: this.getHeaders()
      });
      if (!response.ok) return null;
      const data: any = await response.json();
      if (data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return data.content || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetches core project files to provide context for AI
   */
  static async getProjectContext(owner: string, repo: string): Promise<string> {
    const tree = await this.getFileTree(owner, repo);
    if (!tree || tree.length === 0) return "";

    // Prioritize high-value files for context
    const priorityFiles = tree.filter(f => {
      const p = f.path.toLowerCase();
      return (
        p === 'package.json' || 
        p === 'readme.md' || 
        p.includes('src/app') || 
        p.endsWith('.tsx') || 
        p.endsWith('.jsx') ||
        p.endsWith('.ts')
      );
    }).slice(0, 10); // Take top 10 files to avoid context bloating

    let context = '';
    for (const file of priorityFiles) {
      if (file.type === 'blob') {
        const content = await this.getFileContent(owner, repo, file.path);
        if (content) {
          context += `\n--- File: ${file.path} ---\n${content}\n`;
        }
      }
    }

    return context;
  }
}
