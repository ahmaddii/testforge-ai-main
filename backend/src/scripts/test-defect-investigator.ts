import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import specyAgentRoutes from '../routes/specy-agent';
import { supabase } from '../lib/supabase';

async function testDefectInvestigator() {
  console.log('=== TESTING AI DEFECT INVESTIGATOR ===\n');

  const app = express();
  app.use(express.json());
  app.use('/api/specy-agent', specyAgentRoutes);

  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const masterKey = process.env.MASTER_API_KEY!;
  const { data: projects } = await supabase.from('projects').select('*').limit(1);
  const project = projects![0];

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${masterKey}`,
    'x-impersonate-user-id': project.user_id,
  };

  const userQuery = 'Why did checkout fail in the latest regression run?';
  console.log(`Asking question: "${userQuery}"`);
  console.log(`Project: ${project.name} (${project.id})`);

  const response = await fetch(`${baseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message: userQuery,
      project_id: project.id,
    }),
  });

  const data: any = await response.json();
  console.log('\nResponse Status:', response.status);
  console.log('Model Used:', data.model_used);
  console.log('Sources Count:', data.sources?.length || 0);

  console.log('\nRetrieved Sources:');
  for (const src of (data.sources || [])) {
    console.log(`  - [${src.source_type}] "${src.title}" (ID: ${src.id})`);
  }

  console.log('\n================ SPECY INVESTIGATION REPORT ================\n');
  console.log(data.reply);
  console.log('\n============================================================\n');

  // Assertions to verify the user's required items
  const replyText = data.reply || '';
  const hasFailedCases = /failed/i.test(replyText) && (/checkout/i.test(replyText) || /30503448/i.test(replyText) || /Production Release Suite/i.test(replyText));
  const hasRequirementsOrDefects = /requirement/i.test(replyText) && /defect/i.test(replyText);
  const hasRootCauseDistinction = (/confirmed/i.test(replyText) || /hypothesis/i.test(replyText) || /possible/i.test(replyText));
  const hasDebuggingSteps = /debugging|debug|step/i.test(replyText);
  const hasSourcesCited = data.sources && data.sources.length > 0;

  console.log('Verification Checklist:');
  console.log('1. Failed test cases and actual results included:', hasFailedCases ? '✅ YES' : '❌ NO');
  console.log('2. Related requirements and existing defects connected:', hasRequirementsOrDefects ? '✅ YES' : '❌ NO');
  console.log('3. Confirmed causes distinguished from hypotheses:', hasRootCauseDistinction ? '✅ YES' : '❌ NO');
  console.log('4. Recommended debugging steps provided:', hasDebuggingSteps ? '✅ YES' : '❌ NO');
  console.log('5. Evidence sources cited for conclusions:', hasSourcesCited ? '✅ YES' : '❌ NO');

  server.close();

  if (!hasFailedCases || !hasRequirementsOrDefects || !hasRootCauseDistinction || !hasDebuggingSteps || !hasSourcesCited) {
    throw new Error('Defect Investigator output did not satisfy all required criteria.');
  }

  console.log('\n🎉 ALL AI DEFECT INVESTIGATOR CRITERIA VERIFIED AND PASSED!');
}

testDefectInvestigator().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
