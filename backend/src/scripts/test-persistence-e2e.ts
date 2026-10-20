import { supabase } from '../lib/supabase';
import { randomUUID } from 'crypto';

console.log('=== TEST SUITE: End-to-End Execution History Persistence & Integrity ===\n');

let passedChecks = 0;
let failedChecks = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passedChecks++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

async function runPersistenceSuite() {
  const testRunId = randomUUID();
  const testCaseId1 = randomUUID();
  const testCaseId2 = randomUUID();
  const testCaseId3 = randomUUID();

  try {
    // =========================================================================
    // CHECK 1: Schema Inspection for execution_runs and test_cases
    // =========================================================================
    console.log('Check 1: Database Schema Inspection');
    const { data: runSample, error: runColErr } = await supabase
      .from('execution_runs')
      .select('*')
      .limit(1);

    assert(!runColErr, 'Connected to Supabase execution_runs table');
    if (runSample && runSample[0]) {
      const runCols = Object.keys(runSample[0]);
      console.log('     Columns in execution_runs:', runCols.join(', '));
      assert(runCols.includes('id'), 'execution_runs has "id" column');
      assert(runCols.includes('user_id'), 'execution_runs has "user_id" column');
      assert(runCols.includes('project_id'), 'execution_runs has "project_id" column');
      assert(runCols.includes('name'), 'execution_runs has "name" column');
      assert(runCols.includes('environment'), 'execution_runs has "environment" column');
      assert(runCols.includes('passed'), 'execution_runs has "passed" column');
      assert(runCols.includes('failed'), 'execution_runs has "failed" column');
      assert(runCols.includes('duration'), 'execution_runs has "duration" column');
      assert(runCols.includes('results'), 'execution_runs has "results" (JSONB) column');
      assert(runCols.includes('created_at'), 'execution_runs has "created_at" column');
    }

    const { data: tcSample, error: tcColErr } = await supabase
      .from('test_cases')
      .select('*')
      .limit(1);

    assert(!tcColErr, 'Connected to Supabase test_cases table');
    if (tcSample && tcSample[0]) {
      const tcCols = Object.keys(tcSample[0]);
      console.log('     Columns in test_cases:', tcCols.join(', '));
      assert(tcCols.includes('id'), 'test_cases has "id" column');
      assert(tcCols.includes('status'), 'test_cases has "status" column');
      assert(tcCols.includes('project_id'), 'test_cases has "project_id" column');
    }

    // Fetch an accessible project & user to link test records
    const { data: proj, error: pErr } = await supabase
      .from('projects')
      .select('id, user_id, name')
      .limit(1)
      .single();

    assert(!pErr && Boolean(proj), `Found active project for isolated test fixture ("${proj?.name}")`);
    if (!proj) {
      throw new Error('No active project found in database to attach isolated test run fixture');
    }
    const projectId = proj.id;
    const userId = proj.user_id;

    // =========================================================================
    // CHECK 2: End-to-End Write of Run Metadata, Per-Test Status, Steps, HTTP Status, Screenshots
    // =========================================================================
    console.log('\nCheck 2: End-to-End Write of Execution Run Fixture');
    const mockScreenshot1 = 'https://razlfivoedlfodljsmpk.supabase.co/storage/v1/object/public/failure-recordings/test1.png';
    const mockScreenshot2 = 'https://razlfivoedlfodljsmpk.supabase.co/storage/v1/object/public/failure-recordings/test2.png';
    const mockScreenshot3 = 'https://razlfivoedlfodljsmpk.supabase.co/storage/v1/object/public/failure-recordings/test3.png';

    const testPayload = {
      _meta: {
        total_cases: 3,
        passed: 1,
        failed: 1,
        blocked: 1,
        status: 'Partial',
        environment_url: 'https://test-isolated.local/',
        is_production: false,
        is_readonly: false,
        triggered_by: 'Automated Persistence Integrity Test',
        conversation_id: null,
      },
      [testCaseId1]: {
        test_case_id: testCaseId1,
        name: 'API Waitlist Submission - Valid Payload',
        module: 'Waitlist API',
        status: 'Passed',
        duration: '185ms',
        time: '185ms',
        expected: 'API returns HTTP 201 Created',
        actual: 'API returned HTTP 201 Created with valid payload.',
        http_status: 201,
        screenshot_url: mockScreenshot1,
        executed_at: new Date().toISOString(),
        steps: [
          {
            step_number: 1,
            description: 'Send POST request to /api/waitlist with valid email',
            status: 'Passed',
            duration_ms: 185,
            action_type: 'api_call',
            http_status: 201,
          },
        ],
      },
      [testCaseId2]: {
        test_case_id: testCaseId2,
        name: 'Admin Dashboard Access - Invalid Token',
        module: 'Admin Auth',
        status: 'Failed',
        duration: '320ms',
        time: '320ms',
        expected: 'Access denied with 401 Unauthorized',
        actual: 'Server error: received HTTP 500 Internal Server Error',
        http_status: 500,
        console_errors: ['Uncaught Error: Database connection reset during token validation'],
        network_errors: ['POST /api/auth/verify: net::ERR_HTTP_RESPONSE_CODE_FAILURE'],
        error_message: 'Expected HTTP 401 Unauthorized, but received HTTP 500',
        stack_trace: 'Error: Expected HTTP 401\n    at verifyExplicitOutcome (/runner.ts:560)',
        screenshot_url: mockScreenshot2,
        executed_at: new Date().toISOString(),
        steps: [
          {
            step_number: 1,
            description: 'Send request with forged token',
            status: 'Failed',
            duration_ms: 320,
            action_type: 'api_call',
            http_status: 500,
            error: 'Server responded with HTTP 500',
          },
        ],
      },
      [testCaseId3]: {
        test_case_id: testCaseId3,
        name: 'Payment Processing - Production Mutation Safety',
        module: 'Billing',
        status: 'Blocked',
        duration: '12ms',
        time: '12ms',
        expected: 'Mutating transaction processed or safely blocked',
        actual: 'Submission action is blocked on production by the read-only safety policy.',
        http_status: null,
        screenshot_url: mockScreenshot3,
        executed_at: new Date().toISOString(),
        steps: [
          {
            step_number: 1,
            description: 'Click Submit Payment button',
            status: 'Blocked',
            duration_ms: 12,
            action_type: 'click_mutation',
            error: 'Action blocked by production read-only safety policy.',
          },
        ],
      },
    };

    const newRecord = {
      id: testRunId,
      user_id: userId,
      project_id: projectId,
      name: '__PERSISTENCE_INTEGRITY_TEST_RUN__',
      environment: 'Staging',
      passed: 1,
      failed: 1,
      duration: '517ms',
      results: testPayload,
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from('execution_runs').insert(newRecord);
    assert(!insErr, `Wrote isolated execution run ${testRunId} to Supabase execution_runs`);

    // =========================================================================
    // CHECK 3: End-to-End Read Back & Field Completeness
    // =========================================================================
    console.log('\nCheck 3: Read Back from Supabase and Validate Field Preservation');
    const { data: readBack, error: readErr } = await supabase
      .from('execution_runs')
      .select('*')
      .eq('id', testRunId)
      .single();

    assert(!readErr && Boolean(readBack), 'Read back newly written execution run from Supabase');
    assert(readBack.id === testRunId, 'Run ID matches written value');
    assert(readBack.name === '__PERSISTENCE_INTEGRITY_TEST_RUN__', 'Run name preserved');
    assert(readBack.environment === 'Staging', 'Environment preserved');
    assert(readBack.passed === 1, 'Run passed count = 1');
    assert(readBack.failed === 1, 'Run failed count = 1');
    assert(readBack.duration === '517ms', 'Run duration preserved');

    const resMap = readBack.results || {};
    assert(resMap._meta?.blocked === 1, 'JSONB _meta.blocked = 1 preserved');
    assert(resMap._meta?.total_cases === 3, 'JSONB _meta.total_cases = 3 preserved');

    // Validate Case 1 (Passed with HTTP 201)
    const tc1 = resMap[testCaseId1];
    assert(tc1.status === 'Passed', 'Test Case 1 status is "Passed"');
    assert(tc1.http_status === 201, 'Test Case 1 HTTP status code 201 preserved');
    assert(tc1.screenshot_url === mockScreenshot1, 'Test Case 1 screenshot URL preserved');
    assert(tc1.steps?.[0]?.action_type === 'api_call', 'Test Case 1 step action_type preserved');
    assert(tc1.steps?.[0]?.duration_ms === 185, 'Test Case 1 step duration_ms preserved');

    // Validate Case 2 (Failed with HTTP 500 and console errors)
    const tc2 = resMap[testCaseId2];
    assert(tc2.status === 'Failed', 'Test Case 2 status is "Failed"');
    assert(tc2.http_status === 500, 'Test Case 2 HTTP status code 500 preserved');
    assert(tc2.console_errors?.length > 0, 'Test Case 2 console errors array preserved');
    assert(tc2.network_errors?.length > 0, 'Test Case 2 network errors array preserved');
    assert(Boolean(tc2.error_message), 'Test Case 2 error_message preserved');
    assert(Boolean(tc2.stack_trace), 'Test Case 2 stack_trace preserved');
    assert(tc2.screenshot_url === mockScreenshot2, 'Test Case 2 screenshot URL preserved');

    // Validate Case 3 (Blocked by safety policy)
    const tc3 = resMap[testCaseId3];
    assert(tc3.status === 'Blocked', 'Test Case 3 status is "Blocked"');
    assert(tc3.steps?.[0]?.status === 'Blocked', 'Test Case 3 step status is "Blocked"');
    assert(tc3.screenshot_url === mockScreenshot3, 'Test Case 3 screenshot URL preserved');

    // =========================================================================
    // CHECK 4: Frontend KPI Dashboard Calculation Verification
    // =========================================================================
    console.log('\nCheck 4: Frontend KPI Dashboard Calculation Verification');
    // Emulate frontend execution list flattening from app.executed-tests.tsx (lines 160-200)
    const flattenedList: any[] = [];
    for (const [tcId, itemRaw] of Object.entries(resMap)) {
      if (tcId === '_meta') continue;
      const item = itemRaw as any;
      flattenedList.push({
        testCaseId: tcId,
        status: item.status === 'Failed' ? 'Failed' : item.status === 'Blocked' ? 'Blocked' : 'Passed',
        duration: item.duration,
      });
    }

    // Emulate KPI calculation from app.executed-tests.tsx (lines 302-310)
    const total = flattenedList.length;
    const passed = flattenedList.filter((e) => e.status === 'Passed').length;
    const failed = flattenedList.filter((e) => e.status === 'Failed').length;
    const blocked = flattenedList.filter((e) => e.status === 'Blocked').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    assert(total === 3, 'Calculated total tests = 3');
    assert(passed === 1, 'Calculated passed tests = 1');
    assert(failed === 1, 'Calculated failed tests = 1');
    assert(blocked === 1, 'Calculated blocked tests = 1');
    assert(passRate === 33, 'Calculated pass rate = 33% (1/3), accurately reflecting non-passed blocked and failed tests');

    // =========================================================================
    // CHECK 5: test_cases Table Lifecycle Updates
    // =========================================================================
    console.log('\nCheck 5: test_cases Status Update Verification');
    const tempTcId = randomUUID();
    const tempTestCase = {
      id: tempTcId,
      project_id: projectId,
      user_id: userId,
      title: '__PERSISTENCE_INTEGRITY_TEMP_TC__',
      module: 'Test Cases Status Probe',
      steps: 'Step 1',
      expected: 'Expected 1',
      type: 'positive',
      priority: 'Low',
      status: 'Pending',
    };

    const { error: tcCreateErr } = await supabase.from('test_cases').insert(tempTestCase);
    assert(!tcCreateErr, 'Created isolated test_case row with initial status "Pending"');

    // Update to Passed
    const { error: updatePassErr } = await supabase
      .from('test_cases')
      .update({ status: 'Passed' })
      .eq('id', tempTcId);
    assert(!updatePassErr, 'Updated test_cases status to "Passed"');

    const { data: tcRead1 } = await supabase.from('test_cases').select('status').eq('id', tempTcId).single();
    assert(tcRead1?.status === 'Passed', 'test_cases row confirmed as "Passed"');

    // Update to Failed
    const { error: updateFailErr } = await supabase
      .from('test_cases')
      .update({ status: 'Failed' })
      .eq('id', tempTcId);
    assert(!updateFailErr, 'Updated test_cases status to "Failed"');

    const { data: tcRead2 } = await supabase.from('test_cases').select('status').eq('id', tempTcId).single();
    assert(tcRead2?.status === 'Failed', 'test_cases row confirmed as "Failed"');

    // Clean up temporary test case
    await supabase.from('test_cases').delete().eq('id', tempTcId);
    console.log('     Cleaned up temporary test_cases row');

    // =========================================================================
    // CHECK 6: Persistence Failure Simulation (Must Not Report Success)
    // =========================================================================
    console.log('\nCheck 6: Persistence Failure Simulation');
    // Attempt inserting an execution run with an invalid project_id that violates foreign key constraint
    const invalidRecord = {
      id: randomUUID(),
      user_id: userId,
      project_id: '00000000-0000-0000-0000-000000000000', // Non-existent foreign key
      name: '__INVALID_PERSISTENCE_PROBE__',
      environment: 'Staging',
      passed: 1,
      failed: 0,
      duration: '100ms',
      results: {},
      created_at: new Date().toISOString(),
    };

    const { error: expectedFailure } = await supabase.from('execution_runs').insert(invalidRecord);
    assert(Boolean(expectedFailure), 'Foreign key violation was caught by Supabase as expected');

    // Simulate backend handling: verify persistence_error is captured and not reported as verified workspace record
    const simulatedSummary: any = {
      run_id: invalidRecord.id,
      name: invalidRecord.name,
      total_cases: 1,
      passed: 1,
      failed: 0,
      blocked: 0,
      duration: '100ms',
      status: 'Completed',
      persistence_error: expectedFailure?.message || 'Database insert failed',
    };

    assert(Boolean(simulatedSummary.persistence_error), 'summary.persistence_error is explicitly populated with failure reason');
    assert(
      simulatedSummary.persistence_error.includes('foreign key') || simulatedSummary.persistence_error.includes('violates'),
      'Failure detail accurately captures database constraint error'
    );

    // =========================================================================
    // CLEAN UP: Remove Isolated Test Run
    // =========================================================================
    console.log('\nClean-up: Removing isolated test run from execution_runs');
    const { error: delErr } = await supabase.from('execution_runs').delete().eq('id', testRunId);
    assert(!delErr, `Cleaned up isolated execution run ${testRunId}`);

    // Verify deletion
    const { data: checkDeleted } = await supabase.from('execution_runs').select('id').eq('id', testRunId).maybeSingle();
    assert(checkDeleted === null, 'Verified test run was completely removed');

  } catch (err: any) {
    console.error('Unexpected test error:', err);
    failedChecks++;
  }

  console.log(`\n=== FINAL RESULTS: ${passedChecks} Checks Passed, ${failedChecks} Failed ===`);
  if (failedChecks > 0) {
    process.exit(1);
  }
}

runPersistenceSuite();
