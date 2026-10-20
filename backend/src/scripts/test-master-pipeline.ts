import http from 'http';
import { AddressInfo } from 'net';
import { PlaywrightExecutionService, TestCaseExecutionInput } from '../services/playwright-runner';
import { classifySpecyIntent } from '../services/specy-intent';

console.log('=== TEST SUITE: Master Pipeline End-to-End Verification ===\n');

/**
 * 1. Spin up a deterministic local mock HTTP server
 */
function createMockServer(): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve) => {
    let requestTimestamps: number[] = [];

    const server = http.createServer((req, res) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      // Rate limit check for /api/waitlist
      if (url.pathname === '/api/waitlist') {
        const now = Date.now();
        requestTimestamps.push(now);
        // keep requests within last 5 seconds
        requestTimestamps = requestTimestamps.filter((t) => now - t <= 5000);

        if (requestTimestamps.length > 10) {
          res.writeHead(429, { 'Content-Type': 'application/json', 'Retry-After': '5' });
          res.end(JSON.stringify({ error: 'Too Many Requests', limit: 10 }));
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            let data: any = {};
            try {
              data = JSON.parse(body || '{}');
            } catch (_) {}

            if (!data.email || typeof data.email !== 'string' || !data.email.trim()) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: "Missing required 'email' field" }));
              return;
            }

            if (data.email === 'already_registered@testforge.local') {
              res.writeHead(409, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Email already registered on waitlist' }));
              return;
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ id: 'user_' + Date.now(), email: data.email, status: 'pending' }));
          });
          return;
        }
      }

      // CSV Export
      if (url.pathname === '/api/export-csv') {
        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="waitlist_export.csv"',
        });
        res.end('id,email,status,created_at\n1,test@testforge.local,pending,2026-10-20\n');
        return;
      }

      // Protected Admin Dashboard
      if (url.pathname === '/admin/dashboard') {
        const cookie = req.headers.cookie || '';
        if (!cookie.includes('auth=true')) {
          res.writeHead(302, { Location: '/admin/login' });
          res.end();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<!DOCTYPE html><html><body><h1>Admin Dashboard</h1><p>Waitlist analytics and users</p></body></html>');
        return;
      }

      // Admin Login
      if (url.pathname === '/admin/login') {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<!DOCTYPE html><html><body><h1>Admin Login</h1><div role="alert" class="error">Invalid credentials</div></body></html>`);
          });
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><body>
          <h1>Admin Login</h1>
          <form method="POST" action="/admin/login">
            <input type="email" name="email" id="email" />
            <input type="password" name="password" id="password" />
            <button type="submit">Login</button>
          </form>
        </body></html>`);
        return;
      }

      // Main Homepage
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><title>TestForge Mock App</title></head><body>
        <h1>Welcome to Vehloom Waitlist</h1>
        <form id="waitlist-form">
          <input type="email" id="email" name="email" placeholder="Enter your email" required />
          <button type="submit" id="join-btn">Join Waitlist</button>
        </form>
        <a href="/api/export-csv" id="export-link" download="waitlist_export.csv">Export to CSV</a>
        <a href="/admin/dashboard" id="admin-link">Admin Dashboard</a>
        <div id="notice-area"></div>
        <script>
          document.getElementById('waitlist-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var val = document.getElementById('email').value;
            var area = document.getElementById('notice-area');
            if (val === 'invalid-email-address') {
              area.innerHTML = '<div role="alert" class="error">Please enter a valid email address</div>';
            } else if (val === 'already_registered@testforge.local') {
              area.innerHTML = '<div role="alert" class="error">This email is already registered</div>';
            } else {
              area.innerHTML = '<div role="status" class="success">Success confirmation banner is displayed</div>';
            }
          });
        </script>
      </body></html>`);
    });

    server.listen(0, '127.0.0.1', () => {
      const port = (server.address() as AddressInfo).port;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function runTests() {
  const { server, baseUrl } = await createMockServer();
  let passedAssertions = 0;
  let failedAssertions = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      passedAssertions++;
      console.log(`  ✓ PASS: ${msg}`);
    } else {
      failedAssertions++;
      console.error(`  ✗ FAIL: ${msg}`);
    }
  }

  try {
    console.log(`Local mock server listening at ${baseUrl}\n`);

    // =========================================================================
    // Test 1: Real Navigation and Explicit Assertion
    // =========================================================================
    console.log('Test 1: Real Navigation and Explicit Assertion');
    const res1 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_nav_1',
          project_id: 'proj_mock_1',
          title: 'Verify navigation to homepage',
          module: 'Homepage',
          steps: '1. Navigate to the homepage.\n2. Verify page header.',
          expected: 'Welcome to Vehloom Waitlist',
        },
      ],
    });
    assert(res1.results['tc_nav_1'].status === 'Passed', 'Homepage navigation test passed');
    assert(res1.passed === 1 && res1.failed === 0, 'Suite summary reflects 1 passed, 0 failed');

    // =========================================================================
    // Test 2: Assertion Failure Results in 'Failed' (NO Default BodyText Pass)
    // =========================================================================
    console.log('\nTest 2: Assertion Failure results in "Failed" (No Fake Pass)');
    const res2 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_fail_1',
          project_id: 'proj_mock_1',
          title: 'Verify nonexistent banner',
          module: 'Homepage',
          steps: '1. Navigate to the homepage.',
          expected: 'Nonexistent Special Gold Banner 123456789',
        },
      ],
    });
    assert(res2.results['tc_fail_1'].status === 'Failed', 'Test correctly failed when assertion criteria did not match');
    assert(res2.failed === 1 && res2.passed === 0, 'Suite summary reflects 1 failed, 0 passed');

    // =========================================================================
    // Test 3: Unsupported Action Results in 'Blocked'
    // =========================================================================
    console.log('\nTest 3: Unsupported Action results in "Blocked"');
    const res3 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_block_1',
          project_id: 'proj_mock_1',
          title: 'Direct database wipe',
          module: 'Database',
          steps: '1. Ensure waitlist database table is completely empty.\n2. Click "Export to CSV".',
          expected: 'System generates a CSV file with header row only',
        },
      ],
    });
    assert(res3.results['tc_block_1'].status === 'Blocked', 'Direct DB wipe precondition is marked Blocked');
    assert(res3.blocked === 1, 'Suite blocked count is 1');

    // =========================================================================
    // Test 4: Exact Input Preservation (Invalid Email, 254-char, XSS)
    // =========================================================================
    console.log('\nTest 4: Exact Input Preservation (Invalid Email, XSS, 254-char)');
    const res4 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_invalid_email',
          project_id: 'proj_mock_1',
          title: 'Invalid email submission',
          module: 'Waitlist',
          steps: '1. Enter \'invalid-email-address\' into the waitlist email input field.\n2. Click \'Join Waitlist\'.',
          expected: 'Validation error appears stating Please enter a valid email address',
        },
        {
          id: 'tc_xss',
          project_id: 'proj_mock_1',
          title: 'XSS script injection',
          module: 'Security',
          steps: '1. Enter \'<script>alert("XSS")</script>@example.com\' into the email input field.\n2. Click \'Join Waitlist\'.',
          expected: 'Payload is sanitized and no JavaScript script execution occurs',
        },
      ],
    });
    assert(res4.results['tc_invalid_email'].status === 'Passed', 'Invalid email entered exact value and caught validation error');
    assert(res4.results['tc_xss'].status === 'Passed', 'XSS payload entered exact script tag without executing dialog alert');

    // =========================================================================
    // Test 5: API Requests with Actual Status & Body Assertions (201 & 400)
    // =========================================================================
    console.log('\nTest 5: API Requests with Actual Status Assertions (201 & 400)');
    const res5 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_api_valid',
          project_id: 'proj_mock_1',
          title: 'POST /api/waitlist with valid payload',
          module: 'Waitlist API',
          steps: '1. Send a POST request to /api/waitlist with valid payload.\n2. Inspect response.',
          expected: 'API returns HTTP 201 Created with JSON payload',
        },
        {
          id: 'tc_api_missing',
          project_id: 'proj_mock_1',
          title: 'POST /api/waitlist with missing required body payload',
          module: 'Waitlist API',
          steps: '1. Send a POST request to /api/waitlist with empty body {}.\n2. Inspect response.',
          expected: 'API returns HTTP 400 Bad Request with explicit error message regarding missing email field',
        },
      ],
    });
    assert(res5.results['tc_api_valid'].status === 'Passed', 'POST /api/waitlist returned HTTP 201 Created');
    assert(res5.results['tc_api_valid'].http_status === 201, 'Recorded http_status is 201');
    assert(res5.results['tc_api_missing'].status === 'Passed', 'POST /api/waitlist with empty body returned HTTP 400 Bad Request');
    assert(res5.results['tc_api_missing'].http_status === 400, 'Recorded http_status is 400');

    // =========================================================================
    // Test 6: Rate Limiting Burst Test Against Local Server
    // =========================================================================
    console.log('\nTest 6: Rate Limiting Burst Test Against Local Server');
    const res6 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_rate_limit',
          project_id: 'proj_mock_1',
          title: 'Rate limit rapid consecutive submissions from same IP',
          module: 'Security & Rate Limiting',
          steps: '1. Send 15 consecutive POST requests to /api/waitlist within 5 seconds from the same IP address.',
          expected: 'Requests exceeding threshold receive HTTP 429 Too Many Requests response code.',
        },
      ],
    });
    assert(res6.results['tc_rate_limit'].status === 'Passed', 'Rate limit loop sent 15 requests and verified HTTP 429');
    assert(res6.results['tc_rate_limit'].http_status === 429, 'Last HTTP status captured was 429');

    // =========================================================================
    // Test 7: CSV Download Generation & Content Verification
    // =========================================================================
    console.log('\nTest 7: CSV Download Generation and Verification');
    const res7 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_csv_download',
          project_id: 'proj_mock_1',
          title: 'Export waitlist to CSV format',
          module: 'Data Export',
          steps: '1. Click \'Export to CSV\' button.',
          expected: 'A .csv file is generated and downloaded successfully.',
        },
      ],
    });
    assert(res7.results['tc_csv_download'].status === 'Passed', 'CSV download event was captured and verified');

    // =========================================================================
    // Test 8: Unauthenticated Redirection Assertion
    // =========================================================================
    console.log('\nTest 8: Unauthenticated Redirection Assertion');
    const res8 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Local Mock',
      environmentUrl: baseUrl,
      testCases: [
        {
          id: 'tc_unauth_redirect',
          project_id: 'proj_mock_1',
          title: 'Access Admin Dashboard without authentication',
          module: 'Admin Auth',
          steps: '1. Directly navigate to URL /admin/dashboard.',
          expected: 'Access is denied; system redirects user to the admin login page.',
        },
      ],
    });
    assert(res8.results['tc_unauth_redirect'].status === 'Passed', 'Redirect from /admin/dashboard to /admin/login confirmed');

    // =========================================================================
    // Test 9: Production Read-Only Safety Guard
    // =========================================================================
    console.log('\nTest 9: Production Read-Only Safety Guard');
    const res9 = await PlaywrightExecutionService.runSuite({
      projectId: 'proj_mock_1',
      userId: 'user_mock_1',
      environmentName: 'Production Safe',
      environmentUrl: baseUrl,
      isReadOnly: true, // Simulation of production environment
      testCases: [
        {
          id: 'tc_prod_submit_blocked',
          project_id: 'proj_mock_1',
          title: 'Submit waitlist on production',
          module: 'Waitlist',
          steps: '1. Enter \'test@example.com\' into the email input field.\n2. Click \'Join Waitlist\'.',
          expected: 'Success confirmation banner is displayed',
        },
        {
          id: 'tc_prod_stress_blocked',
          project_id: 'proj_mock_1',
          title: 'Rate limit stress test on production',
          module: 'Security',
          steps: '1. Send 15 consecutive POST requests to /api/waitlist within 5 seconds.',
          expected: 'HTTP 429 Too Many Requests',
        },
      ],
    });
    assert(res9.results['tc_prod_submit_blocked'].status === 'Blocked', 'Mutating button click is blocked on production');
    assert(res9.results['tc_prod_stress_blocked'].status === 'Blocked', 'Aggressive API stress test is blocked on production');
    assert(res9.blocked === 2, 'Total blocked count on production suite is 2');

    // =========================================================================
    // Test 10: Intent Classification & Negation Handling
    // =========================================================================
    console.log('\nTest 10: Intent Classification & Negation Handling');
    const c1 = classifySpecyIntent('Audit the existing Vehloom execution records. Do not execute tests');
    assert(c1.intent === 'audit_inspection', 'Audit with "Do not execute tests" -> audit_inspection');

    const c2 = classifySpecyIntent('Do not execute tests; inspect the saved evidence.');
    assert(c2.intent === 'audit_inspection', 'Negation with inspect saved evidence -> audit_inspection');

    const c3 = classifySpecyIntent('Show me the previous execution history.');
    assert(c3.intent === 'execution_history', 'Show previous history -> execution_history');

    const c4 = classifySpecyIntent('What tests failed in the last run, and why?');
    assert(c4.intent === 'defect_investigation', 'What tests failed and why -> defect_investigation');

    const c5 = classifySpecyIntent('Run only the login tests against the configured staging environment.');
    assert(c5.intent === 'test_execution', 'Run only login tests -> test_execution');
    assert(c5.filterKeyword === 'login', 'Filter keyword extracted is "login"');

    const c6 = classifySpecyIntent('Create a requirement for password reset.');
    assert(c6.intent === 'requirement_creation', 'Create a requirement -> requirement_creation');
    assert(c6.requirementTitle === 'password reset', 'Requirement title is "password reset"');

  } finally {
    server.close();
  }

  console.log(`\n=== FINAL RESULTS: ${passedAssertions} Passed, ${failedAssertions} Failed ===`);
  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runTests();
