import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
  try {
    // Note: listModels is on the genAI object in newer versions, 
    // but in 0.11.0 it might be different. 
    // Actually, let's just try to call a few common ones and see which one doesn't 404.
    const models = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro'];

    console.log('Testing models...');
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent('test');
        console.log(`✅ ${m} is WORKING`);
      } catch (e: any) {
        console.log(`❌ ${m} failed: ${e.message}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
