import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

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

export const generateTestCases = async (requirements: any[], projectInfo: any, codeContext = "") => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
    You are an expert SQA Engineer. 
    Project: ${projectInfo.name}
    Description: ${projectInfo.description || 'N/A'}
    Repo URL: ${projectInfo.repo_url}

    CORE PROJECT CONTEXT (Actual Source Code):
    ${codeContext || 'No source code provided. Generate based on requirements only.'}

    Based on the following requirements (if any) and the provided source code context, generate a comprehensive set of test cases (Positive, Negative, and Edge cases).
    
    Requirements:
    ${requirements.length > 0 
      ? requirements.map(r => `- ${r.title}: ${r.description} (Priority: ${r.priority})`).join('\n')
      : 'No specific requirements provided. Analyze the provided source code context to discover features, logic, and potential failure points, then generate appropriate test cases automatically.'}

    CRITICAL: If requirements were provided, the "module" field MUST match the title of the requirement it belongs to.
    If NO requirements were provided, use the relevant feature or module name (e.g., "Auth", "Database", "UI", "API") as the "module".

    Return the result ONLY as a JSON array of objects with the following structure:
    [
      {
        "module": "string (Requirement title or discovered module name)",
        "title": "string (short summary of the test)",
        "steps": "string (step by step instructions)",
        "expected": "string (expected outcome)",
        "type": "positive" | "negative" | "edge",
        "priority": "Low" | "Medium" | "High"
      }
    ]

    STRICT SCHEMA RULES:
    1. "type" field MUST be strictly lowercase: "positive", "negative", or "edge". NEVER put "High", "Medium", or "Low" in "type"!
    2. "priority" field MUST be strictly: "Low", "Medium", or "High".
    Do not include any other text or markdown formatting in your response.
  `;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Attempt to parse JSON. Sometimes LLMs wrap it in ```json ... ```
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          let t = typeof item.type === 'string' ? item.type.toLowerCase().trim() : 'positive';
          if (!['positive', 'negative', 'edge'].includes(t)) {
            t = t.includes('neg') ? 'negative' : (t.includes('edge') ? 'edge' : 'positive');
          }
          let p = typeof item.priority === 'string' ? item.priority.trim() : 'High';
          const pLower = p.toLowerCase();
          if (pLower === 'low') p = 'Low';
          else if (pLower === 'medium' || pLower === 'med') p = 'Medium';
          else p = 'High';

          return {
            ...item,
            type: t,
            priority: p,
          };
        });
      }
      return parsed;
    } catch (err) {
      const isRetryable = isRetryableGeminiError(err);
      const isLastAttempt = attempt === MAX_RETRIES;

      console.error(`Gemini Generation Error (attempt ${attempt}/${MAX_RETRIES}):`, err);

      if (!isRetryable || isLastAttempt) {
        throw new Error('Failed to generate test cases via AI.');
      }

      const delayMs = BASE_RETRY_DELAY_MS * attempt;
      await sleep(delayMs);
    }
  }

  throw new Error('Failed to generate test cases via AI.');
};
