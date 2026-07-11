import { GitHubAgent } from '../services/githubAgent';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const agent = new GitHubAgent(
        process.env.GITHUB_TOKEN!,
        process.env.GEMINI_API_KEY!,
        "/home/malikahmadrasheed/Documents/GitHub/test-repo"
    );

    await agent.processPullRequest("ahmaddii", "test-repo", 1);

}

main();