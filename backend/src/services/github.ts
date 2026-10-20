
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

  private static getHeaders(withAuth = true) {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Speclane-AI-Assistant'
    };
    if (withAuth && process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN.trim() !== '') {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN.trim()}`;
    }
    return headers;
  }

  /**
   * Parses a GitHub URL to get owner and repo name
   */
  static parseUrl(url: string) {
    try {
      const cleanUrl = url.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\.git$/, '');
      const parts = cleanUrl.split('/').filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetches the file tree of a repository
   */
  static async getFileTree(owner: string, repo: string, branch?: string): Promise<any[]> {
    try {
      let targetBranch = branch;
      if (!targetBranch) {
        let repoResponse = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
          headers: this.getHeaders(true)
        });
        if (repoResponse.status === 401) {
          // Token expired or invalid, retry unauthenticated
          repoResponse = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
            headers: this.getHeaders(false)
          });
        }
        if (repoResponse.ok) {
          const repoData: any = await repoResponse.json();
          targetBranch = repoData.default_branch;
        }
      }
      targetBranch = targetBranch || 'main';

      let response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`, {
        headers: this.getHeaders(true)
      });
      if (response.status === 401) {
        response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`, {
          headers: this.getHeaders(false)
        });
      }
      if (!response.ok) {
        // Try fallback to 'master' if 'main' was assumed
        if (targetBranch === 'main') {
          response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/git/trees/master?recursive=1`, {
            headers: this.getHeaders(false)
          });
        }
      }
      if (!response.ok) return [];
      const data: any = await response.json();
      return (data.tree || []).map((item: any) => ({
        ...item,
        type: item.type === 'tree' ? 'dir' : (item.type === 'blob' ? 'file' : item.type)
      }));
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
      let response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
        headers: this.getHeaders(true)
      });
      if (response.status === 401) {
        response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
          headers: this.getHeaders(false)
        });
      }
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
