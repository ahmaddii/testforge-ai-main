import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PlaywrightFailureInfo {
  testTitle: string;
  errorMessage: string;
  failedSelector: string;
  htmlSnapshot: string;
  screenshotUrl?: string;
  traceUrl?: string;
}

export interface SelfHealingSuggestion {
  broken_selector: string;
  healed_selector: string;
  test_case_title: string;
  confidence: number;
  dom_diff_snippet: string;
  error_message?: string;
  screenshot_url?: string;
  trace_url?: string;
}

export class PlaywrightHealingService {
  /**
   * Analyze Playwright failure using Gemini AI to find the best replacement selector
   */
  static async analyzeFailure(failure: PlaywrightFailureInfo): Promise<SelfHealingSuggestion | null> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Fallback to simpler model if needed, but 2.5-flash is preferred
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `
          You are Speclane's Playwright Self-Healing AI.
          A Playwright test has failed because a selector was not found in the DOM.
          
          Test Title: ${failure.testTitle}
          Error Message: ${failure.errorMessage}
          Broken Selector: ${failure.failedSelector}
          
          HTML DOM Snapshot at time of failure:
          \`\`\`html
          ${failure.htmlSnapshot.substring(0, 10000)}
          \`\`\`

          Analyze the DOM snapshot. Find an element that is likely the intended target of the broken selector.
          It might have changed its class, ID, name, text content, or moved.
          
          Generate the best replacement Playwright selector.
          
          Return EXACTLY a JSON object with this structure:
          {
            "broken_selector": "${failure.failedSelector}",
            "healed_selector": "string (the new Playwright selector)",
            "test_case_title": "${failure.testTitle}",
            "confidence": number between 1 and 100,
            "dom_diff_snippet": "string (formatted diff showing the structural change)"
          }
          If you absolutely cannot determine a new selector from the DOM, return null instead of the JSON object.
          Do not include any markdown formatting outside the JSON object.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        if (cleanJson === "null") {
          return null;
        }

        const parsed: SelfHealingSuggestion = JSON.parse(cleanJson);
        
        parsed.error_message = failure.errorMessage;
        parsed.screenshot_url = failure.screenshotUrl;
        parsed.trace_url = failure.traceUrl;
        
        return parsed;
      } catch (err) {
        console.error("Gemini AI Playwright analysis error:", err);
      }
    }

    // Fallback: DOM-only analysis (without AI, returning Unknown as requested)
    return {
      broken_selector: failure.failedSelector,
      healed_selector: "Unknown",
      test_case_title: failure.testTitle,
      confidence: 0,
      dom_diff_snippet: "Unable to determine change without AI analysis.",
      error_message: failure.errorMessage,
      screenshot_url: failure.screenshotUrl,
      trace_url: failure.traceUrl
    };
  }
}
