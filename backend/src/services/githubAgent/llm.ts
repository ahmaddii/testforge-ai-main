import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableGeminiError = (error: unknown): boolean => {
  const err = error as { status?: number; message?: string };
  const status = err?.status;
  const message = err?.message?.toLowerCase() || '';

  if (typeof status === 'number') {
    return status === 429 || status >= 500;
  }

  return (
    message.includes('service unavailable') ||
    message.includes('temporarily unavailable') ||
    message.includes('timeout') ||
    message.includes('rate limit')
  );
};

export class LLMService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  private async generateWithRetry(prompt: string): Promise<string> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        const isRetryable = isRetryableGeminiError(err);
        const isLastAttempt = attempt === MAX_RETRIES;

        console.error(`Gemini Generation Error (attempt ${attempt}/${MAX_RETRIES}):`, err);

        if (!isRetryable || isLastAttempt) {
          throw err;
        }

        const delayMs = BASE_RETRY_DELAY_MS * attempt;
        console.log(`Waiting ${delayMs}ms before retrying...`);
        await sleep(delayMs);
      }
    }
    throw new Error('Failed to generate content after max retries.');
  }

  async generateTestCases(changedFiles: any[], baseUrl: string, htmlContent: string = '', visibleText: string = ''): Promise<string> {
    const prompt = `You are an expert QA engineer. Review the following code changes and write Playwright test cases for the new features. Output only valid TypeScript Playwright test code.

CRITICAL INSTRUCTION: The web application is being served locally at ${baseUrl}. You MUST navigate to ${baseUrl} (or paths underneath it like ${baseUrl}/index.html) in your tests. DO NOT use placeholder URLs.
CRITICAL INSTRUCTION 2: Write SIMPLE, ROBUST tests. After navigating to the URL, wait for the page/network to be idle before interacting with anything (e.g., await page.waitForLoadState('networkidle')). Prefer checking for visible text or common HTML tags over guessing specific CSS selectors or IDs.
CRITICAL INSTRUCTION 3: Use ONLY valid Playwright matchers. DO NOT invent non-existent matchers like toHavePlaceholder(). Valid matchers include: toBeVisible(), toBeHidden(), toHaveText(), toContainText(), toHaveValue(), toHaveAttribute(), toBeEnabled(), toBeDisabled(), toBeChecked(). If checking placeholders, use toHaveAttribute('placeholder', 'value').

Here is the ACTUAL rendered HTML of the current page:
\`\`\`html
${htmlContent}
\`\`\`

Here is the actual visible text on the page:
\`\`\`
${visibleText}
\`\`\`

CRITICAL INSTRUCTION 4: You MUST only write tests for elements, text, and features that you can verify actually exist in this real content above. Do NOT invent, assume, or guess at features, buttons, forms, or components that are not explicitly present in the provided HTML/content, even if they seem like common patterns for this type of application. If the code diff mentions a feature that ISN'T found in the actual rendered HTML (e.g., a component was added in code but isn't visible on the page), skip writing a test for it and instead add a comment in the generated test file noting "Feature mentioned in code changes was not found in rendered page - skipping test, may require manual verification."

Changed Files:
${changedFiles.map((f: any) => `\n--- ${f.filename} ---\n${f.content}`).join('\n')}`;

    const text = await this.generateWithRetry(prompt);
    const codeMatch = text.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text;
  }

  async fixLocator(errorMessage: string, fileContent: string): Promise<string> {
    const prompt = `A Playwright test failed with the following error:
${errorMessage}

This might be due to a locator change (e.g., ID, class, or text changed). Look at the current test file content below and suggest a corrected version of the file that fixes the locator to match the new assumed structure (or find the closest match). Output only the corrected TypeScript file content.

Test File:
${fileContent}`;

    const text = await this.generateWithRetry(prompt);
    const codeMatch = text.match(/```(?:typescript|ts)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1] : text;
  }
}

