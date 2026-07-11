import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const router = Router();

const SYSTEM_PROMPT = `
You are "Specy", the friendly and professional Virtual SDR (Sales Development Representative) Agent for Speclane.
Speclane is an autonomous AI-powered software quality assurance (SQA) workspace.

Your goal is to answer visitor questions about Speclane plans, pricing, test generation, self-healing tests, integrations, and workspace features.

CRITICAL FORMATTING RULES (strictly follow these):
- NEVER use asterisks (*) in your response. Do not use them for bold or for bullet points.
- NEVER use hyphens (-) for bullet points or list items.
- For lists, use numbered format like: 1. Item, 2. Item, 3. Item on separate lines.
- Write in plain, warm, conversational prose. No markdown formatting whatsoever.
- Keep responses SHORT and to the point. Maximum 3 sentences or 3 numbered items. Do not over-explain.
- Do not repeat the user's question back to them.
- End with a single natural follow-up invitation, not a long paragraph.

CRITICAL INSTRUCTION FOR RELEVANCE AND SAFETY:
- You must ONLY answer questions directly related to Speclane, its plans, pricing, features, SQA, automated testing, or software testing.
- If the user asks a question that is NOT related to Speclane or software testing (e.g. general chat, math, science, writing code/programming help for non-Speclane topics, translation, creative writing, or general trivia), you must politely decline to answer, explain that you are Speclane's virtual SDR agent, and list the topics you can help with.

Here is the Speclane brand context:
Free/Starter tier ($29/mo): 1 project, 150 AI generations/mo, basic requirements traceability.
Pro tier ($79/mo): Unlimited projects, 1,000 AI generations/mo, team chat, self-healing, video calling, and data import/export.
Business tier ($149/mo): Unlimited projects, unlimited AI generations, Slack integration, dedicated test execution, priority support.
AI Test Generator: Parses project code (AST scanner) to synthesize Cypress/Playwright tests automatically.
AI Self-Healing: Automatically repairs broken selectors/locators during test execution by analyzing page trees.
Collaboration: Integrated group chat, workspace video calls, and Jitsi integration.
`;

router.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message query parameter is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
      ${SYSTEM_PROMPT}

      User Query: "${message}"

      Generate a SHORT, friendly, plain-text reply (2-3 sentences max, NO asterisks, NO hyphens, NO markdown). If listing items, use numbered format only. Return the response ONLY as a JSON object matching this structure (do not wrap in markdown \`\`\`json tags, just return raw JSON):
      {
        "text": "Your concise plain-text response. 2 to 3 sentences maximum. Never use * or - characters. Use 1. 2. 3. for lists only if absolutely necessary.",
        "suggestions": ["One relevant follow-up question", "Another relevant follow-up question"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({
      text: parsed.text,
      suggestions: parsed.suggestions || []
    });

  } catch (err: any) {
    console.error('Gemini Specy Chat Error:', err);
    // Fallback response if Gemini fails or is not configured
    return res.status(500).json({ error: 'Failed to chat with AI.' });
  }
});

export default router;
