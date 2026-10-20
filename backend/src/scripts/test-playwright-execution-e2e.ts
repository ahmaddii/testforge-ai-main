import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import specyAgentRoutes from '../routes/specy-agent';
import executionRunRoutes from '../routes/execution-runs';
import { supabase } from '../lib/supabase';
import { PlaywrightExecutionService } from '../services/playwright-runner';

/**
 * 1. Spin up a controlled staging application server
 */
function createControlledStagingServer(): Promise<{ server: http.Server; port: number; url: string }> {
  return new Promise((resolve) => {
    const app = express();

    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Vehloom Shop - Staging Environment</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h1>Vehloom Shop Staging</h1>
          <nav>
            <a href="/">Home</a> |
            <a href="/cart">Cart (<span id="cart-count">1</span>)</a> |
            <a href="/checkout">Checkout</a>
          </nav>
          <div id="product-list" style="margin-top: 20px;">
            <div class="product-item">
              <h3>Standard Wireless Headphones</h3>
              <p>Price: $99.00</p>
              <button id="add-to-cart-btn" onclick="document.getElementById('cart-count').innerText = '2';">Add to Cart</button>
            </div>
          </div>
          <div style="margin-top: 24px;">
            <a id="checkout-link" href="/checkout" style="display: inline-block; padding: 10px 18px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px;">Proceed to Checkout</a>
          </div>
        </body>
        </html>
      `);
    });

    app.get('/checkout', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Checkout - Vehloom Shop</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h2>Secure Checkout</h2>
          <form id="checkout-form" onsubmit="event.preventDefault(); document.getElementById('order-confirmation').style.display = 'block';">
            <div>
              <label for="name">Full Name</label><br/>
              <input type="text" id="name" name="name" required value="John Doe" />
            </div>
            <div style="margin-top: 10px;">
              <label for="email">Email Address</label><br/>
              <input type="email" id="email" name="email" required value="john@example.com" />
            </div>
            <div style="margin-top: 10px;">
              <label for="card">Credit Card Number</label><br/>
              <input type="text" id="card" name="card" required value="4242424242424242" />
            </div>
            <div style="margin-top: 16px;">
              <button type="submit" id="submit-payment-btn" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer;">Submit Payment</button>
            </div>
          </form>
          <div id="order-confirmation" class="success" role="status" style="display: none; margin-top: 20px; padding: 14px; background: #dcfce7; color: #166534; border: 1px solid #86efac; border-radius: 6px;">
            <h3>Order Confirmation #94021</h3>
            <p>Thank you! Your payment was processed successfully.</p>
          </div>
        </body>
        </html>
      `);
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
 * 2. Main End-to-End Verification Flow
 */
async function runVerification() {
  console.log('================================================================');
  console.log('🧪 TESTFORGE AI: PLAYWRIGHT CHAT EXECUTION & EXECUTED TESTS VERIFICATION');
  console.log('================================================================\n');

  // Step A: Start controlled staging server
  console.log('1. Starting Controlled Staging Application...');
  const staging = await createControlledStagingServer();
  console.log(`   ✓ Staging application online at: ${staging.url}`);

  // Step B: Set up test API server
  console.log('\n2. Initializing Speclane Backend API Server...');
  const apiApp = express();
  apiApp.use(express.json());
  apiApp.use('/api/specy-agent', specyAgentRoutes);
  apiApp.use('/api/execution-runs', executionRunRoutes);

  const apiServer: http.Server = await new Promise((resolve) => {
    const s = apiApp.listen(0, '127.0.0.1', () => resolve(s));
  });
  const apiPort = (apiServer.address() as any).port;
  const apiBaseUrl = `http://127.0.0.1:${apiPort}`;
  console.log(`   ✓ Speclane Backend online at: ${apiBaseUrl}`);

  const masterKey = process.env.MASTER_API_KEY;
  if (!masterKey) {
    throw new Error('MASTER_API_KEY is not defined in backend/.env');
  }

  // Step C: Fetch target project and user
  console.log('\n3. Inspecting Workspace Database Records...');
  const { data: projects } = await supabase.from('projects').select('*').limit(1);
  if (!projects || projects.length === 0) {
    throw new Error('No projects found in database.');
  }
  const testProject = projects[0];
  const testProjectId = testProject.id;
  const testOwnerId = testProject.user_id;

  console.log(`   ✓ Selected Project: "${testProject.name}" (ID: ${testProjectId})`);
  console.log(`   ✓ Authorized Owner ID: ${testOwnerId}`);

  // Configure staging environment to point to our controlled staging app
  console.log('\n4. Configuring Project Staging Environment URL...');
  const { data: existingEnvs } = await supabase
    .from('environments')
    .select('*')
    .eq('project_id', testProjectId)
    .eq('type', 'Staging');

  let activeEnvId: string;
  if (existingEnvs && existingEnvs.length > 0) {
    activeEnvId = existingEnvs[0].id;
    await supabase
      .from('environments')
      .update({ url: staging.url, status: 'Healthy', name: 'Controlled Staging Cluster' })
      .eq('id', activeEnvId);
    console.log(`   ✓ Updated existing staging environment (${activeEnvId}) URL to ${staging.url}`);
  } else {
    const { data: createdEnv } = await supabase
      .from('environments')
      .insert({
        project_id: testProjectId,
        user_id: testOwnerId,
        name: 'Controlled Staging Cluster',
        type: 'Staging',
        url: staging.url,
        status: 'Healthy',
      })
      .select()
      .single();
    activeEnvId = createdEnv!.id;
    console.log(`   ✓ Created new staging environment (${activeEnvId}) URL to ${staging.url}`);
  }

  // Ensure test cases are in 'Pending' status for verification
  console.log('\n5. Setting Up Pending Test Cases for Execution...');
  await supabase
    .from('test_cases')
    .update({ status: 'Pending' })
    .eq('project_id', testProjectId);

  const { data: pendingCases } = await supabase
    .from('test_cases')
    .select('id, title, status, steps, expected')
    .eq('project_id', testProjectId)
    .eq('status', 'Pending');

  console.log(`   ✓ Found ${pendingCases?.length || 0} pending test cases ready for execution.`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${masterKey}`,
    'x-impersonate-user-id': testOwnerId,
  };

  // Step D: Trigger Execution via Specy Chat Request
  console.log('\n6. Executing Tests via Specy Chat Request...');
  const chatPrompt = 'Run all pending test cases for the current project';
  console.log(`   💬 User Prompt: "${chatPrompt}"`);

  const chatResponse = await fetch(`${apiBaseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: chatPrompt,
      project_id: testProjectId,
    }),
  });

  const chatResult: any = await chatResponse.json();
  console.log(`   ✓ HTTP Response Status: ${chatResponse.status}`);
  console.log(`   ✓ Specy Agent Mode: ${chatResult.mode}`);

  if (!chatResponse.ok || !chatResult.reply) {
    console.error('Chat execution error:', chatResult);
    throw new Error('Chat-triggered execution failed.');
  }

  const executionRun = chatResult.execution_run;
  if (!executionRun) {
    throw new Error('Chat response did not include execution_run payload.');
  }

  console.log('\n   📊 Execution Run Summary:');
  console.log(`      - Run ID: ${executionRun.run_id}`);
  console.log(`      - Total Cases Executed: ${executionRun.total_cases}`);
  console.log(`      - Passed: ${executionRun.passed}`);
  console.log(`      - Failed: ${executionRun.failed}`);
  console.log(`      - Blocked: ${executionRun.blocked}`);
  console.log(`      - Total Duration: ${executionRun.duration}`);

  const hasExecutedTestsLink = chatResult.reply.includes('/app/executed-tests');
  console.log(`   ✓ Chat contains link to Executed Tests page: ${hasExecutedTestsLink}`);
  if (!hasExecutedTestsLink) {
    throw new Error('Specy chat reply must contain link to /app/executed-tests.');
  }

  // Step E: Verify Persisted Database Records in execution_runs
  console.log('\n7. Verifying Persisted Data in execution_runs Table...');
  const { data: dbRun, error: dbErr } = await supabase
    .from('execution_runs')
    .select('*')
    .eq('id', executionRun.run_id)
    .single();

  if (dbErr || !dbRun) {
    throw new Error(`Execution run ${executionRun.run_id} was not found in Supabase database.`);
  }

  console.log(`   ✓ Successfully queried execution_run from database:`);
  console.log(`      - DB Name: ${dbRun.name}`);
  console.log(`      - DB Environment: ${dbRun.environment}`);
  console.log(`      - DB Passed: ${dbRun.passed}, Failed: ${dbRun.failed}`);
  console.log(`      - DB Results Entries: ${Object.keys(dbRun.results || {}).length}`);

  // Step F: Verify Evidence Screenshot Storage & Accessibility
  console.log('\n8. Verifying Screenshot Evidence Storage & Accessibility...');
  const runResults = dbRun.results || {};
  let foundScreenshotCount = 0;
  let sampleScreenshotUrl: string | null = null;

  for (const [key, val] of Object.entries(runResults)) {
    if (key === '_meta') continue;
    const tcItem = val as any;
    if (tcItem.screenshot_url) {
      foundScreenshotCount++;
      if (!sampleScreenshotUrl) sampleScreenshotUrl = tcItem.screenshot_url;
    }
  }

  console.log(`   ✓ Screenshots captured and archived: ${foundScreenshotCount}`);
  if (sampleScreenshotUrl) {
    console.log(`   ✓ Sample Screenshot URL: ${sampleScreenshotUrl}`);
    // If it's a relative URL to evidence endpoint, test fetch
    if (sampleScreenshotUrl.startsWith('/api/')) {
      const shotRes = await fetch(`${apiBaseUrl}${sampleScreenshotUrl}`);
      console.log(`   ✓ Screenshot endpoint HTTP status: ${shotRes.status} (Content-Type: ${shotRes.headers.get('content-type')})`);
      if (!shotRes.ok) throw new Error('Failed to retrieve screenshot from evidence route.');
    } else {
      const shotRes = await fetch(sampleScreenshotUrl);
      console.log(`   ✓ Remote Supabase Storage HTTP status: ${shotRes.status}`);
    }
  }

  // Step G: Verify Executed Tests API Querying (/api/execution-runs)
  console.log('\n9. Verifying Executed Tests Page API Endpoints...');
  const listRes = await fetch(`${apiBaseUrl}/api/execution-runs?projectId=${testProjectId}`, {
    headers: authHeaders,
  });
  const listJson: any = await listRes.json();
  console.log(`   ✓ GET /api/execution-runs returned ${listJson.length} suite records.`);
  const foundInList = listJson.some((r: any) => r.id === executionRun.run_id);
  console.log(`   ✓ Current run is present in execution history table data: ${foundInList}`);

  const getByIdRes = await fetch(`${apiBaseUrl}/api/execution-runs/${executionRun.run_id}`, {
    headers: authHeaders,
  });
  const getByIdJson: any = await getByIdRes.json();
  console.log(`   ✓ GET /api/execution-runs/:id returned details (status: ${getByIdRes.status})`);
  if (!getByIdRes.ok || getByIdJson.id !== executionRun.run_id) {
    throw new Error('GET /api/execution-runs/:id failed.');
  }

  // Step H: Verify Project Isolation & Access Denied Security
  console.log('\n10. Verifying Project Isolation and Security Enforcement...');
  const fakeProjectId = '00000000-0000-0000-0000-000000000000';
  const deniedRes = await fetch(`${apiBaseUrl}/api/specy-agent/chat`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      message: 'Run all pending test cases for the current project',
      project_id: fakeProjectId,
    }),
  });
  console.log(`   ✓ Unauthorized project request status: ${deniedRes.status} (Expected: 404)`);
  if (deniedRes.status !== 404) {
    throw new Error('Project isolation check failed; expected 404 for unauthorized project.');
  }

  // Clean up
  console.log('\n11. Cleaning up test servers...');
  staging.server.close();
  apiServer.close();

  console.log('\n================================================================');
  console.log('🎉 ALL PLAYWRIGHT EXECUTION & EXECUTED TESTS VERIFICATIONS PASSED!');
  console.log('================================================================\n');
}

runVerification().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
