import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import { supabase } from '../lib/supabase';
import {
  PlaywrightExecutionService,
  TestCaseExecutionInput,
  normalizeUrl,
  resolveTargetUrl,
} from '../services/playwright-runner';

let passedTests = 0;
let failedTests = 0;

function assertTest(name: string, condition: boolean, detail: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
    console.log(`     ↳ ${detail}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     ↳ ${detail}`);
    failedTests++;
  }
}

/**
 * Deterministic Mock Server for Navigation & Action Verification
 */
function createDeterministicMockServer(): Promise<{ server: http.Server; port: number; url: string }> {
  return new Promise((resolve) => {
    const app = express();
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // 1. Landing / Waitlist Home Page
    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Vehloom Mock Landing Page</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h1 id="landing-title">Vehloom Landing Page</h1>
          <form id="waitlist-form" action="/api/waitlist" method="POST">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Full Name" />
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Email Address" />
            <button type="submit" id="join-waitlist-btn">Join Waitlist</button>
          </form>
          <div id="subscriber-section" style="margin-top: 30px;">
            <h3>Subscribers</h3>
            <table id="subscriber-table" border="1">
              <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
              <tbody>
                <tr class="subscriber-item"><td>Alice Test</td><td>alice@test.io</td><td><button class="delete-btn">Delete</button></td></tr>
              </tbody>
            </table>
          </div>
          <div id="search-section" style="margin-top: 20px;">
            <input type="search" id="subscriber-search" name="search" placeholder="Search subscribers..." />
            <button id="filter-btn">Filter</button>
          </div>
        </body>
        </html>
      `);
    });

    // 2. Admin Login Page
    app.get('/admin/login', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Admin Login - Vehloom</title></head>
        <body>
          <h2>Admin Authentication</h2>
          <form id="admin-login-form">
            <input type="text" id="admin-email" name="email" placeholder="Admin Email" />
            <input type="password" id="admin-password" name="password" placeholder="Password" />
            <button type="submit" id="admin-submit-btn">Login</button>
          </form>
        </body>
        </html>
      `);
    });

    // 3. Admin Dashboard Page
    app.get('/admin/dashboard', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Admin Dashboard - Vehloom</title></head>
        <body>
          <h1>Waitlist Management Dashboard</h1>
          <table id="admin-table">
            <tbody><tr><td>Admin Record 1</td></tr></tbody>
          </table>
        </body>
        </html>
      `);
    });

    // 4. Slow Hanging Endpoint (to verify Navigation Timeout)
    app.get('/slow-hanging-endpoint', (req, res) => {
      // Deliberately delay response by 6000ms
      setTimeout(() => {
        if (!res.headersSent) {
          res.send('<h1>Eventually Loaded</h1>');
        }
      }, 6000);
    });

    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as any;
      const port = addr.port;
      const url = `http://127.0.0.1:${port}`;
      resolve({ server, port, url });
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('🧪 PLAYWRIGHT NAVIGATION ENGINE & ACTION CLASSIFICATION AUDIT');
  console.log('================================================================\n');

  const mock = await createDeterministicMockServer();
  console.log(`[Mock Server] Online at ${mock.url}\n`);

  try {
    // -------------------------------------------------------------------------
    // 1. Semantic QA Route Resolution
    // -------------------------------------------------------------------------
    console.log('--- 1. Semantic QA Route Resolution Verification ---');
    const base = 'https://vehloom.vercel.app';
    const r1 = resolveTargetUrl('Navigate to Admin Login page.', base);
    const r2 = resolveTargetUrl("Directly navigate to '/admin/dashboard'.", base);
    const r3 = resolveTargetUrl('Navigate to the Waitlist Management section on the Admin Dashboard.', base);
    const r4 = resolveTargetUrl('Navigate to the Vehloom landing page.', base);
    const r5 = resolveTargetUrl('Go to Vehloom landing page.', base);
    const r6 = resolveTargetUrl('Navigate to the Admin Login page (/admin/login).', base);

    assertTest(
      'Semantic Route: "Navigate to Admin Login page."',
      r1 === 'https://vehloom.vercel.app/admin/login',
      `Resolved to: ${r1}`
    );
    assertTest(
      'Explicit Route: "Directly navigate to \'/admin/dashboard\'."',
      r2 === 'https://vehloom.vercel.app/admin/dashboard',
      `Resolved to: ${r2}`
    );
    assertTest(
      'Semantic Route: Admin Dashboard Management',
      r3 === 'https://vehloom.vercel.app/admin/dashboard',
      `Resolved to: ${r3}`
    );
    assertTest(
      'Landing Route: "Navigate to the Vehloom landing page."',
      r4 === 'https://vehloom.vercel.app',
      `Resolved to: ${r4}`
    );
    assertTest(
      'Landing Route: "Go to Vehloom landing page."',
      r5 === 'https://vehloom.vercel.app',
      `Resolved to: ${r5}`
    );
    assertTest(
      'Explicit Path in parenthesis: "(/admin/login)"',
      r6 === 'https://vehloom.vercel.app/admin/login',
      `Resolved to: ${r6}`
    );

    // -------------------------------------------------------------------------
    // 2. URL Normalization
    // -------------------------------------------------------------------------
    console.log('\n--- 2. URL Normalization Verification ---');
    const norm1 = normalizeUrl('https://vehloom.vercel.app/');
    const norm2 = normalizeUrl('https://vehloom.vercel.app');
    const norm3 = normalizeUrl('vehloom.vercel.app');
    assertTest(
      'URL Normalization: trailing slash parity',
      norm1 === 'https://vehloom.vercel.app' && norm1 === norm2,
      `norm1: "${norm1}", norm2: "${norm2}"`
    );
    assertTest(
      'URL Normalization: protocol prefixing',
      norm3 === 'https://vehloom.vercel.app',
      `norm3: "${norm3}"`
    );

    // -------------------------------------------------------------------------
    // 3. Navigation Success & Redundant Same-URL Handling
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Navigation Success & Redundant Same-URL Handling ---');
    const tcNavSuccess: TestCaseExecutionInput = {
      id: 'tc-nav-success',
      title: 'Navigation to landing and redundant landing step',
      steps: `Navigate to the Vehloom landing page.\nGo to Vehloom landing page.`,
      expected: 'Page is loaded and verified without timeout',
    };
    const resNav = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcNavSuccess],
      timeoutPerTestMs: 10000,
      isReadOnly: false,
    });
    const sNav = resNav.results[tcNavSuccess.id];
    assertTest(
      'Navigation Success & Redundant Same-URL Step',
      sNav.status === 'Passed' && sNav.steps.length === 2 && sNav.steps.every(st => st.status === 'Passed'),
      `Status: ${sNav.status}, step 1: "${sNav.steps[0]?.observed_value}", step 2: "${sNav.steps[1]?.observed_value}"`
    );

    // -------------------------------------------------------------------------
    // 4. Navigation Timeout (Truthfully Reported as Failed)
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Navigation Timeout Handling (Reported as Failed) ---');
    const tcNavTimeout: TestCaseExecutionInput = {
      id: 'tc-nav-timeout',
      title: 'Navigation timeout on slow endpoint',
      steps: `Navigate to /slow-hanging-endpoint\nVerify #landing-title visible`,
      expected: 'Navigation fails gracefully with timeout captured',
    };
    const resTimeout = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcNavTimeout],
      timeoutPerTestMs: 2500, // Strict 2500ms timeout against 6000ms slow endpoint
      isReadOnly: false,
    });
    const sTimeout = resTimeout.results[tcNavTimeout.id];
    assertTest(
      'Navigation Timeout Truthfully Recorded as Failed (Never Passed!)',
      sTimeout.status === 'Failed' && sTimeout.steps[0]?.status === 'Failed',
      `Status: ${sTimeout.status}, step 1 error: "${sTimeout.steps[0]?.error}"`
    );
    assertTest(
      'Navigation Timeout Duration & Error Captured',
      Boolean(sTimeout.steps[0]?.error?.toLowerCase().includes('timeout') && sTimeout.steps[0]?.duration_ms >= 2000),
      `Duration: ${sTimeout.steps[0]?.duration_ms}ms, error: "${sTimeout.steps[0]?.error}"`
    );

    // -------------------------------------------------------------------------
    // 5. Unreachable Host (Truthfully Reported as Blocked)
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Unreachable Host Handling (Reported as Blocked) ---');
    const tcUnreachable: TestCaseExecutionInput = {
      id: 'tc-nav-unreachable',
      title: 'Unreachable host on dead port',
      steps: `Navigate to http://127.0.0.1:59911/\nVerify title`,
      expected: 'Execution blocked because host is unreachable',
    };
    const resUnreachable = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Dead Host',
      environmentUrl: 'http://127.0.0.1:59911/',
      testCases: [tcUnreachable],
      timeoutPerTestMs: 3000,
      isReadOnly: false,
    });
    const sUnreachable = resUnreachable.results[tcUnreachable.id];
    assertTest(
      'Unreachable Host Recorded as Blocked',
      sUnreachable.status === 'Blocked' && sUnreachable.steps[0]?.status === 'Blocked',
      `Status: ${sUnreachable.status}, actual: "${sUnreachable.actual}"`
    );

    // -------------------------------------------------------------------------
    // 6. Fresh Browser Window / Incognito Context Preparation
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Fresh Browser Window / Incognito Context Preparation ---');
    const tcIncognito: TestCaseExecutionInput = {
      id: 'tc-incognito',
      title: 'Verify incognito session preparation',
      steps: `Open a fresh browser window in Incognito mode.\nDirectly navigate to '/admin/dashboard'.`,
      expected: 'Fresh context ready and navigates to admin dashboard',
    };
    const resIncognito = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcIncognito],
      timeoutPerTestMs: 8000,
      isReadOnly: false,
    });
    const sIncognito = resIncognito.results[tcIncognito.id];
    assertTest(
      'Incognito Preparation Action Supported',
      sIncognito.steps[0]?.status === 'Passed' && sIncognito.steps[0]?.action_type === 'browser_context',
      `Step 1 action: ${sIncognito.steps[0]?.action_type}, observed: "${sIncognito.steps[0]?.observed_value}"`
    );

    // -------------------------------------------------------------------------
    // 7. Negative Testing: Leave Blank Action
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Negative Testing: Leave Blank Action ---');
    const tcLeaveBlank: TestCaseExecutionInput = {
      id: 'tc-leave-blank',
      title: 'Leave fields blank validation',
      steps: `Navigate to the Vehloom landing page.\nLeave the Name and Email fields blank.`,
      expected: 'Fields confirmed blank',
    };
    const resLeaveBlank = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcLeaveBlank],
      timeoutPerTestMs: 8000,
      isReadOnly: false,
    });
    const sLeaveBlank = resLeaveBlank.results[tcLeaveBlank.id];
    assertTest(
      'Leave Blank Action Supported and Verified',
      sLeaveBlank.status === 'Passed' && sLeaveBlank.steps[1]?.status === 'Passed' && sLeaveBlank.steps[1]?.action_type === 'input_clear',
      `Step 2 action: ${sLeaveBlank.steps[1]?.action_type}, observed: "${sLeaveBlank.steps[1]?.observed_value}"`
    );

    // -------------------------------------------------------------------------
    // 8. Search Field & Apply Filter Support
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Search Field & Apply Filter Support ---');
    const tcSearch: TestCaseExecutionInput = {
      id: 'tc-search-filter',
      title: 'Search subscribers by keyword',
      steps: `Navigate to the Vehloom landing page.\nEnter 'Xyz123NonExistent' in the search bar.\nApply filter.`,
      expected: 'Keyword entered in search field and filter applied',
    };
    const resSearch = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcSearch],
      timeoutPerTestMs: 8000,
      isReadOnly: false,
    });
    const sSearch = resSearch.results[tcSearch.id];
    assertTest(
      'Search Input Filled Correctly',
      sSearch.steps[1]?.status === 'Passed' && sSearch.steps[1]?.input_value === 'Xyz123NonExistent',
      `Step 2 observed: "${sSearch.steps[1]?.observed_value}"`
    );
    assertTest(
      'Apply Filter Dispatched Successfully',
      sSearch.steps[2]?.status === 'Passed' && (sSearch.steps[2]?.action_type === 'click' || sSearch.steps[2]?.action_type === 'keyboard_action'),
      `Step 3 action: ${sSearch.steps[2]?.action_type}, observed: "${sSearch.steps[2]?.observed_value}"`
    );

    // -------------------------------------------------------------------------
    // 9. Element Locating / Visual Observation
    // -------------------------------------------------------------------------
    console.log('\n--- 9. Element Locating / Visual Observation ---');
    const tcLocate: TestCaseExecutionInput = {
      id: 'tc-locate-observe',
      title: 'Locate form and observe subscriber list',
      steps: `Navigate to the Vehloom landing page.\nLocate the Waitlist sign-up form.\nObserve the displayed subscriber list.`,
      expected: 'Form and list presence verified',
    };
    const resLocate = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcLocate],
      timeoutPerTestMs: 8000,
      isReadOnly: false,
    });
    const sLocate = resLocate.results[tcLocate.id];
    assertTest(
      'Locate Form Verified',
      sLocate.steps[1]?.status === 'Passed' && sLocate.steps[1]?.action_type === 'locate',
      `Step 2: ${sLocate.steps[1]?.observed_value}`
    );
    assertTest(
      'Observe Subscriber List Verified',
      sLocate.steps[2]?.status === 'Passed' && sLocate.steps[2]?.action_type === 'locate',
      `Step 3: ${sLocate.steps[2]?.observed_value}`
    );

    // -------------------------------------------------------------------------
    // 10. Production Safety Guards (Strict Read-Only Enforcement)
    // -------------------------------------------------------------------------
    console.log('\n--- 10. Production Safety Guards (Strict Read-Only Enforcement) ---');
    const tcSafetySuite: TestCaseExecutionInput[] = [
      {
        id: 'tc-mut-1',
        title: 'Click Join Waitlist mutation',
        steps: `Click the 'Join Waitlist' button.`,
        expected: 'Blocked by policy',
      },
      {
        id: 'tc-mut-2',
        title: 'Click Delete mutation',
        steps: `Click 'Delete' or 'Remove'.`,
        expected: 'Blocked by policy',
      },
      {
        id: 'tc-mut-3',
        title: 'Admin login step on production',
        steps: `Log in as an Admin.`,
        expected: 'Blocked by policy',
      },
      {
        id: 'tc-mut-4',
        title: 'Admin credentials on production',
        steps: `Enter valid admin username/email and password.`,
        expected: 'Blocked by policy',
      },
      {
        id: 'tc-mut-5',
        title: 'SQL injection payload on production',
        steps: `Enter "' OR '1'='1" into the Email/Username field.`,
        expected: 'Blocked by policy',
      },
    ];
    const resSafety = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Vehloom Production',
      environmentUrl: mock.url,
      testCases: tcSafetySuite,
      timeoutPerTestMs: 8000,
      isReadOnly: true, // PRODUCTION READ-ONLY SAFETY ACTIVE
    });
    for (const tc of tcSafetySuite) {
      const r = resSafety.results[tc.id];
      assertTest(
        `Production Guard: ${tc.title}`,
        r.status === 'Blocked',
        `Blocked with reason: "${r.actual}"`
      );
    }

    // -------------------------------------------------------------------------
    // 11. Unsupported External Preconditions
    // -------------------------------------------------------------------------
    console.log('\n--- 11. Unsupported External Preconditions ---');
    const tcExternal: TestCaseExecutionInput = {
      id: 'tc-ext-smtp',
      title: 'Mock SMTP mail failure step',
      steps: `Simulate mail service interruption or mock SMTP failure.`,
      expected: 'Blocked as external precondition',
    };
    const resExternal = await PlaywrightExecutionService.runSuite({
      projectId: 'proj-mock',
      userId: 'user-mock',
      environmentName: 'Mock Staging',
      environmentUrl: mock.url,
      testCases: [tcExternal],
      timeoutPerTestMs: 8000,
      isReadOnly: false,
    });
    const sExt = resExternal.results[tcExternal.id];
    assertTest(
      'External SMTP Precondition Blocked',
      sExt.status === 'Blocked' && sExt.steps[0]?.action_type === 'unsupported_external',
      `Status: ${sExt.status}, error: "${sExt.steps[0]?.error}"`
    );

    // -------------------------------------------------------------------------
    // 12. Historical Run Records Immutability
    // -------------------------------------------------------------------------
    console.log('\n--- 12. Historical Run Records Immutability ---');
    const { data: run5840 } = await supabase
      .from('execution_runs')
      .select('id, passed, failed, duration, created_at')
      .eq('id', '5840e4bb-f64e-4f20-9b0c-e6885800d7bc')
      .single();

    assertTest(
      'Historical Run 5840e4bb... Preserved & Immutable',
      run5840?.id === '5840e4bb-f64e-4f20-9b0c-e6885800d7bc' && run5840?.passed === 14 && run5840?.failed === 0,
      `Run ID: ${run5840?.id}, Passed: ${run5840?.passed}, Failed: ${run5840?.failed}, Created: ${run5840?.created_at}`
    );

    const { data: runDe1a } = await supabase
      .from('execution_runs')
      .select('id, passed, failed, duration, created_at')
      .eq('id', 'de1ac78a-8394-4081-9d11-ae81b7930712')
      .single();

    assertTest(
      'Historical Run de1ac78a... Preserved & Immutable',
      runDe1a?.id === 'de1ac78a-8394-4081-9d11-ae81b7930712' && runDe1a?.passed === 0 && runDe1a?.failed === 5,
      `Run ID: ${runDe1a?.id}, Passed: ${runDe1a?.passed}, Failed: ${runDe1a?.failed}, Created: ${runDe1a?.created_at}`
    );

  } finally {
    mock.server.close();
    console.log('\n[Cleanup] Mock server closed cleanly.');
  }

  console.log('\n================================================================');
  console.log(`📊 NAVIGATION & ACTION AUDIT: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${passedTests + failedTests})`);
  console.log('================================================================\n');

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
