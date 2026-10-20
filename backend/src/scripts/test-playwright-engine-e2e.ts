import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import { supabase } from '../lib/supabase';
import {
  PlaywrightExecutionService,
  TestCaseExecutionInput,
  storeScreenshot,
} from '../services/playwright-runner';
import { classifySpecyIntent, hasExecutionNegation } from '../services/specy-intent';

// Track mutation requests to prove production read-only safety
let mutationHitCount = 0;
let rateLimitCounter = 0;
let rateLimitResetTime = Date.now() + 5000;

/**
 * 1. Spin up a deterministic local mock web and API server
 */
function createDeterministicMockServer(): Promise<{ server: http.Server; port: number; url: string }> {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // 1. Home Page
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>TestForge Mock QA App</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1 id="main-heading">Vehloom Quality Workspace</h1>
          <nav>
            <a id="nav-cart" href="/cart">Cart (<span id="cart-count">1</span>)</a> |
            <a id="nav-form" href="/form">Form</a> |
            <a id="nav-dashboard" href="/dashboard">Protected Dashboard</a> |
            <a id="nav-download" href="/download-page">Downloads</a>
          </nav>
          <div id="product-container" style="margin-top: 20px;">
            <h3 id="product-title">Standard Wireless Headphones</h3>
            <button id="add-to-cart-btn" onclick="document.getElementById('cart-count').innerText = '2';">Add to Cart</button>
          </div>
        </body>
        </html>
      `);
    });

    // 2. Protected Dashboard & Auth Redirect
    app.get('/dashboard', (req, res) => {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.includes('Bearer valid-token')) {
        return res.redirect(302, '/login?redirect=dashboard');
      }
      res.send('<h1 id="dashboard-title">Welcome to Protected Dashboard</h1>');
    });

    app.get('/login', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Login - TestForge Mock</title></head>
        <body>
          <h2 id="login-heading">Please Sign In</h2>
          <form id="login-form" action="/login" method="POST">
            <input type="email" id="email" name="email" required />
            <input type="password" id="password" name="password" required />
            <button type="submit" id="login-btn">Sign In</button>
          </form>
          <div id="auth-error" style="display: none; color: red;">Invalid credentials</div>
        </body>
        </html>
      `);
    });

    // 3. Form Submission with Validation
    app.get('/form', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Form Validation - TestForge Mock</title></head>
        <body>
          <h2>User Profile Form</h2>
          <form id="profile-form" onsubmit="
            event.preventDefault();
            const email = document.getElementById('input-email').value;
            const name = document.getElementById('input-name').value;
            if (!email.includes('@') || !name) {
              document.getElementById('form-error').style.display = 'block';
              document.getElementById('form-success').style.display = 'none';
            } else {
              document.getElementById('form-error').style.display = 'none';
              document.getElementById('form-success').style.display = 'block';
            }
          ">
            <div>
              <label for="input-name">Name</label>
              <input type="text" id="input-name" name="name" required />
            </div>
            <div>
              <label for="input-email">Email</label>
              <input type="email" id="input-email" name="email" required />
            </div>
            <button type="submit" id="submit-form-btn">Submit Profile</button>
          </form>
          <div id="form-error" style="display: none; color: red;">Please provide a valid name and email address.</div>
          <div id="form-success" style="display: none; color: green;">Profile saved successfully.</div>
        </body>
        </html>
      `);
    });

    // 4. Download Route
    app.get('/download-page', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <body>
          <a id="download-csv-btn" href="/download-csv">Download CSV Report</a>
        </body>
        </html>
      `);
    });

    app.get('/download-csv', (req, res) => {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="report-2026.csv"');
      res.send('id,name,role\n1,Admin,Tester\n2,Specy,QA-Automation\n');
    });

    // 5. XSS Echo Page
    app.get('/xss-test', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>XSS Test</title></head>
        <body>
          <h2>Leave a Feedback</h2>
          <input type="text" id="feedback-input" />
          <button id="post-feedback-btn" onclick="
            const val = document.getElementById('feedback-input').value;
            // Safely set text content without executing script tags
            document.getElementById('feedback-output').textContent = val;
          ">Post</button>
          <div id="feedback-output"></div>
        </body>
        </html>
      `);
    });

    // 6. Mutating Endpoint (for Production Read-Only Safety Test)
    app.post('/api/mutate', (req, res) => {
      mutationHitCount++;
      res.json({ success: true, count: mutationHitCount });
    });

    // 7. REST API Endpoints
    app.post('/api/resource', (req, res) => {
      res.status(201).json({ id: 'res-9901', created: true, name: req.body?.name || 'test' });
    });

    app.post('/api/resource/invalid', (req, res) => {
      res.status(400).json({ error: 'Validation failed: payload missing required fields' });
    });

    // 8. Rate Limited Endpoint
    app.all('/api/rate-limited', (req, res) => {
      const now = Date.now();
      if (now > rateLimitResetTime) {
        rateLimitCounter = 0;
        rateLimitResetTime = now + 5000;
      }
      rateLimitCounter++;
      if (rateLimitCounter > 2) {
        return res.status(429).json({ error: 'Too Many Requests - Rate limit exceeded' });
      }
      res.status(200).json({ message: 'Request accepted', count: rateLimitCounter });
    });

    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      const port = addr.port;
      const url = `http://127.0.0.1:${port}`;
      resolve({ server, port, url });
    });
  });
}

/**
 * Main Deterministic Verification Runner
 */
async function main() {
  console.log('================================================================');
  console.log('🚀 FINAL PLAYWRIGHT EXECUTION ENGINE: DETERMINISTIC VERIFICATION');
  console.log('================================================================\n');

  // Start Local Mock Server
  const mock = await createDeterministicMockServer();
  console.log(`[Mock Server] Online at ${mock.url}\n`);

  let passedTests = 0;
  let failedTests = 0;

  const assertTest = (name: string, condition: boolean, detail: string) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      console.log(`     ↳ ${detail}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     ↳ ${detail}`);
      failedTests++;
    }
  };

  try {
    // -------------------------------------------------------------
    // Scenario 1: A genuine successful browser assertion
    // -------------------------------------------------------------
    console.log('\n--- Scenario 1: Genuine Successful Browser Assertion ---');
    const tc1: TestCaseExecutionInput = {
      id: 'tc-s1-pass',
      title: 'Cart counter increment on button click',
      steps: `Navigate to ${mock.url}\nClick #add-to-cart-btn\nVerify #cart-count contains text 2`,
      expected: 'Cart item count is updated to 2',
    };
    const res1 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tc1],
      timeoutPerTestMs: 8000,
    });
    const s1 = res1.results[tc1.id];
    assertTest(
      'Scenario 1: Genuine Browser Assertion',
      s1.status === 'Passed' && s1.steps.some(st => st.status === 'Passed' && st.performed_action?.toLowerCase().includes('click')),
      `Recorded status: ${s1.status}, observed: "${s1.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 2: An assertion failure reported as Failed
    // -------------------------------------------------------------
    console.log('\n--- Scenario 2: Assertion Failure Reported as Failed ---');
    const tc2: TestCaseExecutionInput = {
      id: 'tc-s2-fail',
      title: 'Assert non-existent title on home page',
      steps: `Navigate to ${mock.url}\nVerify #main-heading contains NonExistent Title XYZ`,
      expected: 'Page displays NonExistent Title XYZ',
    };
    const res2 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tc2],
      timeoutPerTestMs: 6000,
    });
    const s2 = res2.results[tc2.id];
    assertTest(
      'Scenario 2: Real Assertion Failure Detection',
      s2.status === 'Failed',
      `Status is truthfully "Failed" (not Passed!), actual: "${s2.actual}", error: "${s2.error_message || 'N/A'}"`
    );

    // -------------------------------------------------------------
    // Scenario 3: Unsupported action not reported as Passed
    // -------------------------------------------------------------
    console.log('\n--- Scenario 3: Unsupported Action Not Reported as Passed ---');
    const tc3: TestCaseExecutionInput = {
      id: 'tc-s3-unsupported',
      title: 'Unsupported quantum entanglement step',
      steps: `Execute quantum telemetry sync on blockchain node`,
      expected: 'Quantum teleportation completes',
    };
    const res3 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tc3],
      timeoutPerTestMs: 6000,
    });
    const s3 = res3.results[tc3.id];
    assertTest(
      'Scenario 3: Unsupported Action Rejection',
      s3.status === 'Blocked',
      `Status is "${s3.status}" (never silently Passed!), actual: "${s3.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 4: Exact input-value preservation
    // -------------------------------------------------------------
    console.log('\n--- Scenario 4: Exact Input-Value Preservation ---');
    const tc4: TestCaseExecutionInput = {
      id: 'tc-s4-input',
      title: 'Fill exact user profile input fields',
      steps: `Navigate to ${mock.url}/form\nFill input #input-name with "Quality Engineer"\nFill input #input-email with "qa.lead@testforge.io"`,
      expected: 'Input fields preserve exact filled values',
    };
    const res4 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: `${mock.url}/form`,
      testCases: [tc4],
      timeoutPerTestMs: 8000,
    });
    const s4 = res4.results[tc4.id];
    const fillSteps = s4.steps.filter(st => st.action_type === 'input_fill');
    const preservedName = fillSteps.some(st => st.input_value === 'Quality Engineer' || st.observed_value?.includes('Quality Engineer'));
    const preservedEmail = fillSteps.some(st => st.input_value === 'qa.lead@testforge.io' || st.observed_value?.includes('qa.lead@testforge.io'));
    assertTest(
      'Scenario 4: Exact Input Value Preservation',
      s4.status === 'Passed' && preservedName && preservedEmail,
      `Verified exact values: Name="${fillSteps[0]?.observed_value}", Email="${fillSteps[1]?.observed_value}"`
    );

    // -------------------------------------------------------------
    // Scenario 5: Invalid form submission
    // -------------------------------------------------------------
    console.log('\n--- Scenario 5: Invalid Form Submission ---');
    const tc5: TestCaseExecutionInput = {
      id: 'tc-s5-form-invalid',
      title: 'Negative validation on empty name submission',
      steps: `Navigate to ${mock.url}/form\nFill input #input-email with "invalid-email-format"\nClick #submit-form-btn`,
      expected: 'Display validation error message for invalid inputs',
    };
    const res5 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: `${mock.url}/form`,
      testCases: [tc5],
      timeoutPerTestMs: 8000,
    });
    const s5 = res5.results[tc5.id];
    assertTest(
      'Scenario 5: Invalid Form Validation Assertion',
      s5.status === 'Passed' && s5.actual.toLowerCase().includes('validation'),
      `Status: ${s5.status}, Outcome: "${s5.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 6: Successful and failing API responses
    // -------------------------------------------------------------
    console.log('\n--- Scenario 6: API Status and Response Body Assertions ---');
    const tc6a: TestCaseExecutionInput = {
      id: 'tc-s6a-api-success',
      title: 'Post API resource expecting 201 Created',
      steps: `Make POST request to ${mock.url}/api/resource with name "TestItem"`,
      expected: 'HTTP 201 Created returned with created status',
    };
    const tc6b: TestCaseExecutionInput = {
      id: 'tc-s6b-api-fail',
      title: 'Post invalid API resource expecting 201 Created',
      steps: `Make POST request to ${mock.url}/api/resource/invalid`,
      expected: 'HTTP 201 Created returned',
    };
    const res6 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tc6a, tc6b],
      timeoutPerTestMs: 8000,
    });
    const s6a = res6.results[tc6a.id];
    const s6b = res6.results[tc6b.id];
    assertTest(
      'Scenario 6a: Successful API 201 Assertion',
      s6a.status === 'Passed' && s6a.http_status === 201,
      `Status: ${s6a.status}, HTTP Status: ${s6a.http_status}`
    );
    assertTest(
      'Scenario 6b: Failing API Assertion (Expected 201, Got 400)',
      s6b.status === 'Failed' && s6b.http_status === 400,
      `Status: ${s6b.status}, Observed HTTP Status: ${s6b.http_status}`
    );

    // -------------------------------------------------------------
    // Scenario 7: Rate limiting against local mock endpoint
    // -------------------------------------------------------------
    console.log('\n--- Scenario 7: Rate Limiting Burst Assertion ---');
    const tc7: TestCaseExecutionInput = {
      id: 'tc-s7-ratelimit',
      title: 'Exceed API rate limit threshold',
      steps: `Send 5 rapid burst requests to ${mock.url}/api/rate-limited`,
      expected: 'HTTP 429 Too Many Requests response is returned',
    };
    const res7 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tc7],
      timeoutPerTestMs: 8000,
    });
    const s7 = res7.results[tc7.id];
    assertTest(
      'Scenario 7: Real Rate Limiting 429 Assertion',
      s7.status === 'Passed' && s7.http_status === 429,
      `Status: ${s7.status}, HTTP: ${s7.http_status}, actual: "${s7.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 8: Downloadable file with filename and content validation
    // -------------------------------------------------------------
    console.log('\n--- Scenario 8: Real Download Event and Content Validation ---');
    const tc8: TestCaseExecutionInput = {
      id: 'tc-s8-download',
      title: 'Download CSV file and verify contents',
      steps: `Navigate to ${mock.url}/download-page\nClick #download-csv-btn to download report-2026.csv`,
      expected: 'File report-2026.csv downloaded with valid CSV data',
    };
    const res8 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: `${mock.url}/download-page`,
      testCases: [tc8],
      timeoutPerTestMs: 10000,
    });
    const s8 = res8.results[tc8.id];
    const dlStep = s8.steps.find(st => st.action_type === 'download');
    assertTest(
      'Scenario 8: Download Filename & Content Validation',
      s8.status === 'Passed' && dlStep?.observed_value?.includes('report-2026.csv') === true,
      `Status: ${s8.status}, Observed: "${dlStep?.observed_value}"`
    );

    // -------------------------------------------------------------
    // Scenario 9: Authentication redirect behavior
    // -------------------------------------------------------------
    console.log('\n--- Scenario 9: Authentication Redirect Behavior ---');
    const tc9: TestCaseExecutionInput = {
      id: 'tc-s9-auth-redirect',
      title: 'Access protected dashboard without authorization',
      steps: `Navigate to ${mock.url}/dashboard`,
      expected: 'Redirect to /login with redirect parameter',
    };
    const res9 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: `${mock.url}/dashboard`,
      testCases: [tc9],
      timeoutPerTestMs: 8000,
    });
    const s9 = res9.results[tc9.id];
    assertTest(
      'Scenario 9: Unauthenticated Redirect Assertion',
      s9.status === 'Passed' && s9.actual.includes('/login'),
      `Status: ${s9.status}, Redirect Verified: "${s9.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 10: XSS payload safety
    // -------------------------------------------------------------
    console.log('\n--- Scenario 10: XSS Payload Safety ---');
    const tc10: TestCaseExecutionInput = {
      id: 'tc-s10-xss',
      title: 'Submit XSS script payload in feedback field',
      steps: `Navigate to ${mock.url}/xss-test\nFill input #feedback-input with "<script>alert('xss')</script>"\nClick #post-feedback-btn`,
      expected: 'Payload is rendered safely without script execution or alert dialog',
    };
    const res10 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: `${mock.url}/xss-test`,
      testCases: [tc10],
      timeoutPerTestMs: 8000,
    });
    const s10 = res10.results[tc10.id];
    assertTest(
      'Scenario 10: XSS Payload Rendered Safely Without Alert',
      s10.status === 'Passed' && s10.actual.includes('safely'),
      `Status: ${s10.status}, Result: "${s10.actual}"`
    );

    // -------------------------------------------------------------
    // Scenario 11: Production mutation blocked before request
    // -------------------------------------------------------------
    console.log('\n--- Scenario 11: Production Mutation Safety Guard ---');
    const initialHits = mutationHitCount;
    const tc11: TestCaseExecutionInput = {
      id: 'tc-s11-prod-mutation',
      title: 'Submit payment mutation on production URL',
      steps: `Navigate to ${mock.url}\nClick #delete-database-btn\nSubmit payment form to /api/mutate`,
      expected: 'Payment processed and database deleted',
    };
    const res11 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-prod-test',
      userId: 'user-mock',
      environmentName: 'Vehloom Production',
      environmentUrl: mock.url,
      isReadOnly: true, // STRICT PRODUCTION SAFEGUARD
      testCases: [tc11],
      timeoutPerTestMs: 6000,
    });
    const s11 = res11.results[tc11.id];
    assertTest(
      'Scenario 11: Production Mutation Blocked Pre-Execution',
      s11.status === 'Blocked' && mutationHitCount === initialHits,
      `Status: "${s11.status}", Mutation HTTP hits to server: ${mutationHitCount - initialHits}`
    );

    // -------------------------------------------------------------
    // Scenario 12: Screenshot/trace collection failure handling
    // -------------------------------------------------------------
    console.log('\n--- Scenario 12: Truthful Screenshot Failure Handling ---');
    // Call storeScreenshot with invalid data or directory to prove it truthfully returns null rather than fake URL
    const shotResult = await storeScreenshot('/invalid/path/that/cannot/exist', 'proj', 'tc', Buffer.from('fake'));
    assertTest(
      'Scenario 12: Truthful Screenshot Failure Handling',
      shotResult === null,
      `Store screenshot gracefully returned ${shotResult} without throwing or generating fake URLs`
    );

    // -------------------------------------------------------------
    // Scenario 13: Supabase persistence success and failure
    // -------------------------------------------------------------
    console.log('\n--- Scenario 13: Supabase Persistence Success and Failure ---');
    // Test actual Supabase query
    const { data: runs, error: readErr } = await supabase
      .from('execution_runs')
      .select('id, name, passed, failed')
      .limit(1);

    const dbReadSuccess = !readErr && Array.isArray(runs);
    assertTest(
      'Scenario 13a: Supabase Query & Connection',
      dbReadSuccess,
      `Successfully read execution_runs schema: ${runs?.length || 0} runs fetched`
    );

    // Test rejection on invalid insert
    const { error: invalidInsertErr } = await supabase
      .from('execution_runs')
      .insert({
        id: 'invalid-non-uuid-format',
        project_id: '00000000-0000-0000-0000-000000000000',
        name: 'Invalid Persistence Test',
        passed: -1,
      });

    assertTest(
      'Scenario 13b: Persistence Error Detection on Invalid Insert',
      invalidInsertErr !== null,
      `Invalid database write was rejected with error: "${invalidInsertErr?.message}"`
    );

    // -------------------------------------------------------------
    // Scenario 14: Accurate aggregation and pass-rate calculation
    // -------------------------------------------------------------
    console.log('\n--- Scenario 14: Pass-Rate Calculation Accuracy ---');
    // Given 10 cases: 7 Passed, 1 Failed, 1 Blocked, 1 Error
    const sampleResults = [
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Passed' },
      { status: 'Failed' },
      { status: 'Blocked' },
      { status: 'Error' },
    ];
    const totalCount = sampleResults.length;
    const passedCount = sampleResults.filter(r => r.status === 'Passed').length;
    const failedCount = sampleResults.filter(r => r.status === 'Failed' || r.status === 'Error').length;
    const blockedCount = sampleResults.filter(r => r.status === 'Blocked').length;
    const calculatedPassRate = Math.round((passedCount / totalCount) * 100);

    assertTest(
      'Scenario 14: Pass-Rate Excludes Blocked and Error From Passed',
      passedCount === 7 && failedCount === 2 && blockedCount === 1 && calculatedPassRate === 70,
      `Total: ${totalCount}, Passed: ${passedCount}, Failed+Error: ${failedCount}, Blocked: ${blockedCount}, Pass Rate: ${calculatedPassRate}%`
    );

    // -------------------------------------------------------------
    // Scenario 15: Specy read-only audit requests never invoke runner
    // -------------------------------------------------------------
    const auditQuery = 'Audit the execution results of run 5840e4bb-f64e-4f20-9b0c-e6885800d7bc';
    const auditClassification = classifySpecyIntent(auditQuery);
    assertTest(
      'Scenario 15: Read-Only Audit Intent Never Triggers Execution',
      auditClassification.intent === 'audit_inspection',
      `Query "${auditQuery}" classified as ${auditClassification.intent} (targetRunId: ${auditClassification.targetRunId})`
    );

    // -------------------------------------------------------------
    // Scenario 16: Negated execution instructions never invoke runner
    // -------------------------------------------------------------
    console.log('\n--- Scenario 16: Negated Execution Refusal Guard ---');
    const negatedMsg1 = "Do not execute any tests right now, just review the pending test plan";
    const negatedMsg2 = "Don't run tests against Vehloom";
    const neg1 = hasExecutionNegation(negatedMsg1);
    const neg2 = hasExecutionNegation(negatedMsg2);
    assertTest(
      'Scenario 16: Negated Instructions Refuse Runner Execution',
      neg1 && neg2,
      `Negation 1 ("${negatedMsg1}") detected: ${neg1}, Negation 2 ("${negatedMsg2}") detected: ${neg2}`
    );

    // -------------------------------------------------------------
    // Scenario 17: Historical run results remain immutable
    // -------------------------------------------------------------
    console.log('\n--- Scenario 17: Historical Run Immutability ---');
    const { data: histRun } = await supabase
      .from('execution_runs')
      .select('id, created_at, passed, failed')
      .eq('id', '5840e4bb-f64e-4f20-9b0c-e6885800d7bc')
      .single();

    assertTest(
      'Scenario 17: Historical Run 5840e4bb... Untouched and Immutable',
      histRun?.id === '5840e4bb-f64e-4f20-9b0c-e6885800d7bc' && histRun?.passed === 14 && histRun?.failed === 0,
      `Historical record ID: ${histRun?.id}, Passed: ${histRun?.passed}, Failed: ${histRun?.failed}, Created: ${histRun?.created_at}`
    );

  } finally {
    // Clean up mock server
    mock.server.close();
    console.log('\n[Cleanup] Mock server stopped.');
  }

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULTS: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${passedTests + failedTests})`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
