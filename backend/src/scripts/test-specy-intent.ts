import { classifySpecyIntent } from '../services/specy-intent';

console.log('=== TEST SUITE: Specy Intent Classification & Negation ===\n');

const testCases = [
  {
    input: 'Audit the existing Vehloom execution records. Do not execute tests',
    expectedIntent: 'audit_inspection',
    desc: 'Audit request with explicit negation "Do not execute tests"',
  },
  {
    input: 'Audit the last run without executing anything.',
    expectedIntent: 'audit_inspection',
    desc: 'Audit request with "without executing anything"',
  },
  {
    input: 'Do not execute tests; inspect the saved evidence.',
    expectedIntent: 'audit_inspection',
    desc: 'Direct negation "Do not execute tests; inspect the saved evidence"',
  },
  {
    input: 'Show me the previous execution history.',
    expectedIntent: 'execution_history',
    desc: 'Execution history request',
  },
  {
    input: 'What tests failed in the last run, and why?',
    expectedIntent: 'defect_investigation',
    desc: 'Defect investigation request',
  },
  {
    input: 'Why did this test fail?',
    expectedIntent: 'defect_investigation',
    desc: 'Single test failure inquiry',
  },
  {
    input: 'Analyze this repository and identify the main features.',
    expectedIntent: 'repository_analysis',
    desc: 'Repository analysis request',
  },
  {
    input: 'Create a requirement for password reset.',
    expectedIntent: 'requirement_creation',
    desc: 'Requirement creation request with title extraction',
  },
  {
    input: 'Generate test cases for this requirement.',
    expectedIntent: 'test_generation',
    desc: 'Test generation request',
  },
  {
    input: 'Run only the login tests against the configured staging environment.',
    expectedIntent: 'test_execution',
    desc: 'Affirmative execution with keyword filter "login"',
  },
  {
    input: 'Run all pending test cases for the current project against https://vehloom.vercel.app/',
    expectedIntent: 'test_execution',
    desc: 'Affirmative execution with target URL',
  },
  {
    input: 'What projects are currently active in my workspace?',
    expectedIntent: 'workspace_query',
    desc: 'General workspace inquiry',
  },
];

let passed = 0;
let failed = 0;

for (const t of testCases) {
  const result = classifySpecyIntent(t.input);
  const ok = result.intent === t.expectedIntent;
  if (ok) {
    passed++;
    console.log(`✓ PASS: "${t.input.slice(0, 50)}..." -> [${result.intent}] (${t.desc})`);
    if (result.filterKeyword) console.log(`   └ Filter Keyword: "${result.filterKeyword}"`);
    if (result.explicitUrl) console.log(`   └ Explicit URL: "${result.explicitUrl}"`);
    if (result.requirementTitle) console.log(`   └ Requirement Title: "${result.requirementTitle}"`);
  } else {
    failed++;
    console.error(`✗ FAIL: "${t.input}" -> Expected [${t.expectedIntent}], got [${result.intent}]`);
  }
}

console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
if (failed > 0) process.exit(1);
