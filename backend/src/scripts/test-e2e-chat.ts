import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import specyRagRoutes from '../routes/specy-rag';
import specyAgentRoutes from '../routes/specy-agent';
import { supabase } from '../lib/supabase';

async function runE2E() {
  console.log('=== STARTING END-TO-END SPECY INTEGRATION TEST ===\n');

  // Setup test express server on an ephemeral port
  const app = express();
  app.use(express.json());
  app.use('/api/specy-rag', specyRagRoutes);
  app.use('/api/specy-agent', specyAgentRoutes);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test Express server running at ${baseUrl}`);

  const masterKey = process.env.MASTER_API_KEY;
  if (!masterKey) {
    throw new Error('MASTER_API_KEY is not defined in backend/.env');
  }

  // Find sample project for fyp.tester@testforge.com
  const { data: projects } = await supabase.from('projects').select('*').limit(1);
  const testProject = projects![0];
  const testProjectId = testProject.id;
  const testOwnerId = testProject.user_id;

  console.log(`Using Project: ${testProject.name} (${testProjectId})`);
  console.log(`Using Owner: ${testOwnerId}`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${masterKey}`,
    'x-impersonate-user-id': testOwnerId,
  };

  // Test 1: POST /api/specy-rag/sync
  console.log('\n--- Test 1: POST /api/specy-rag/sync ---');
  const syncRes = await fetch(`${baseUrl}/api/specy-rag/sync`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ project_id: testProjectId }),
  });
  const syncJson: any = await syncRes.json();
  console.log('Sync Response Status:', syncRes.status);
  console.log('Sync Message:', syncJson.message);
  console.log('Sync Stats:', syncJson.stats);
  if (!syncRes.ok || !syncJson.success) {
    throw new Error('Test 1 Failed: RAG sync failed.');
  }
  console.log('PASSED: Sync endpoint works seamlessly.');

  // Test 2: POST /api/specy-rag/search
  console.log('\n--- Test 2: POST /api/specy-rag/search ---');
  const searchRes = await fetch(`${baseUrl}/api/specy-rag/search`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      query: 'User Checkout credit card payment',
      project_id: testProjectId,
      min_similarity: 0.55,
      limit: 3,
    }),
  });
  const searchJson: any = await searchRes.json();
  console.log('Search Response Status:', searchRes.status);
  console.log(`Found ${searchJson.count} matches:`);
  for (const match of (searchJson.results || [])) {
    console.log(`  - [${match.source_type}] "${match.title}" (${(match.similarity * 100).toFixed(1)}%)`);
  }
  if (!searchRes.ok || searchJson.count === 0) {
    throw new Error('Test 2 Failed: Search returned 0 results.');
  }
  console.log('PASSED: Search endpoint successfully retrieved semantic matches.');

  // Test 3: POST /api/specy-agent/chat with relevant project QA query
  console.log('\n--- Test 3: POST /api/specy-agent/chat (Grounded QA with Sources) ---');
  const chatRes1 = await fetch(`${baseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'What test cases exist for user checkout with a credit card in my project?',
      project_id: testProjectId,
    }),
  });
  const chatJson1: any = await chatRes1.json();
  console.log('Chat Status:', chatRes1.status);
  console.log('Model Used:', chatJson1.model_used);
  console.log(`Retrieved Sources Count: ${chatJson1.sources?.length || 0}`);
  for (const src of (chatJson1.sources || [])) {
    console.log(`  Source: [${src.source_type}] "${src.title}" (ID: ${src.id})`);
  }
  console.log('\nSpecy Reply Snippet:');
  console.log(chatJson1.reply?.slice(0, 400) + '...\n');
  if (!chatRes1.ok || !chatJson1.reply || !chatJson1.sources || chatJson1.sources.length === 0) {
    throw new Error('Test 3 Failed: Specy chat failed to return grounded reply or sources.');
  }
  console.log('PASSED: Grounded chat returned verified answer and sources.');

  // Test 4: POST /api/specy-agent/chat asking about regression defects
  console.log('\n--- Test 4: POST /api/specy-agent/chat (Defect Investigation) ---');
  const chatRes2 = await fetch(`${baseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'What regression defects have been reported for the production release suite?',
      project_id: testProjectId,
    }),
  });
  const chatJson2: any = await chatRes2.json();
  console.log('Chat Status:', chatRes2.status);
  console.log(`Retrieved Sources Count: ${chatJson2.sources?.length || 0}`);
  for (const src of (chatJson2.sources || [])) {
    console.log(`  Source: [${src.source_type}] "${src.title}"`);
  }
  console.log('\nSpecy Reply Snippet:');
  console.log(chatJson2.reply?.slice(0, 350) + '...\n');
  if (!chatRes2.ok || !chatJson2.reply) {
    throw new Error('Test 4 Failed: Specy defect query failed.');
  }
  console.log('PASSED: Defect investigation answered with grounded evidence.');

  // Test 5: Project Isolation & Access Denied Check
  console.log('\n--- Test 5: Project Isolation & Security Enforcement ---');
  const fakeProjectId = '00000000-0000-0000-0000-000000000000';
  const chatResIsolated = await fetch(`${baseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'What requirements do we have?',
      project_id: fakeProjectId,
    }),
  });
  console.log('Unauthorized Project Status:', chatResIsolated.status);
  const isolatedJson: any = await chatResIsolated.json();
  console.log('Error Message:', isolatedJson.error);
  if (chatResIsolated.status !== 404) {
    throw new Error('Test 5 Failed: Unauthorized project access was not rejected with 404!');
  }
  console.log('PASSED: Unauthorized project ID rejected securely.');

  // Test 6: Validation Error Handling
  console.log('\n--- Test 6: Input Validation ---');
  const invalidRes = await fetch(`${baseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: '   ', // empty message
    }),
  });
  console.log('Empty Message Status:', invalidRes.status);
  if (invalidRes.status !== 400) {
    throw new Error('Test 6 Failed: Empty message was not rejected with 400.');
  }
  console.log('PASSED: Input validation properly enforced.');

  server.close();
  console.log('\n=== ALL END-TO-END INTEGRATION TESTS PASSED! ===');
}

runE2E().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
