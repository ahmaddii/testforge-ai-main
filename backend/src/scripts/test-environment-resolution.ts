import dotenv from 'dotenv';
dotenv.config();

import { resolveProjectEnvironment, extractUrlFromText } from '../routes/execution-runs';

async function runTests() {
  console.log('=== TEST SUITE: Environment Resolution & Vehloom Protection ===\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Known Vehloom project and owner from the active workspace
  const vehloomProjectId = '7947c368-0514-4487-a350-a34d5e85e157';
  const vehloomProjectName = 'Vehloom';
  const vehloomRepoUrl = 'https://github.com/ahmaddii/Vehloom---WaitList-Web-Application-with-Admin-Access';
  const ownerId = '89d607ca-1ed2-4803-9776-f9eb3d3fcc07';

  // Test 1: extractUrlFromText helper
  console.log('Test 1: URL extraction from arbitrary chat text');
  const extracted1 = extractUrlFromText('Run all pending test cases for Vehloom against https://vehloom.vercel.app/');
  assert(extracted1 === 'https://vehloom.vercel.app/', 'Extracts clean URL from message');
  const extracted2 = extractUrlFromText('Please test http://127.0.0.1:41999/cart now.');
  assert(extracted2 === 'http://127.0.0.1:41999/cart', 'Extracts and trims trailing period');
  const extracted3 = extractUrlFromText('Run all pending test cases for the current project');
  assert(extracted3 === null, 'Returns null when no URL is present in message');

  // Test 2: Explicit Vehloom URL in chat message MUST NOT be replaced by staging.speclane.com
  console.log('\nTest 2: Explicit Vehloom URL in chat message');
  try {
    const res = await resolveProjectEnvironment({
      projectId: vehloomProjectId,
      projectName: vehloomProjectName,
      projectRepoUrl: vehloomRepoUrl,
      userId: ownerId,
      ownerIds: [ownerId],
      message: 'Run all pending test cases for Vehloom against https://vehloom.vercel.app/',
    });

    assert(res.environmentUrl === 'https://vehloom.vercel.app/', `Resolved URL is exactly https://vehloom.vercel.app/ (got: ${res.environmentUrl})`);
    assert(res.environmentUrl !== 'https://staging.speclane.com', 'Resolved URL is NOT staging.speclane.com');
    assert(res.isReadOnly === true, 'Production environment enforces isReadOnly: true for safety');
    assert(res.resolutionSource === 'explicit_message', 'Resolution source is marked explicit_message');
  } catch (err: any) {
    assert(false, `Unexpected error in Test 2: ${err.message}`);
  }

  // Test 3: Implicit resolution for Vehloom project using registered environment records
  console.log('\nTest 3: Implicit resolution for Vehloom using registered environment records');
  try {
    const res = await resolveProjectEnvironment({
      projectId: vehloomProjectId,
      projectName: vehloomProjectName,
      projectRepoUrl: vehloomRepoUrl,
      userId: ownerId,
      ownerIds: [ownerId],
      message: 'Run all pending test cases for the current project',
    });

    assert(res.environmentUrl === 'https://vehloom.vercel.app/', `Resolved registered environment URL: ${res.environmentUrl}`);
    assert(res.environmentUrl !== 'https://staging.speclane.com', 'Resolved URL is NOT staging.speclane.com');
    assert(res.isReadOnly === true, 'Production environment "Base" is marked read-only');
    assert(res.resolutionSource === 'workspace_environment', 'Resolution source matches workspace_environment');
  } catch (err: any) {
    assert(false, `Unexpected error in Test 3: ${err.message}`);
  }

  // Test 4: Rejection of alien / unrelated domains in chat message
  console.log('\nTest 4: Rejection of conflicting / unrelated domain in chat message');
  try {
    await resolveProjectEnvironment({
      projectId: vehloomProjectId,
      projectName: vehloomProjectName,
      projectRepoUrl: vehloomRepoUrl,
      userId: ownerId,
      ownerIds: [ownerId],
      message: 'Run all pending test cases against https://unrelated-phishing-domain.com/',
    });
    assert(false, 'Should have rejected unrelated domain');
  } catch (err: any) {
    assert(
      err.message.includes('does not match project "Vehloom"'),
      `Correctly rejected with message: "${err.message}"`
    );
  }

  // Test 5: Rejection when project has no environment and no URL provided
  console.log('\nTest 5: Clear error when no environment is configured (NO silent fallback)');
  try {
    await resolveProjectEnvironment({
      projectId: '00000000-0000-0000-0000-000000000000',
      projectName: 'Empty Unconfigured Project',
      userId: '00000000-0000-0000-0000-000000000000',
      ownerIds: ['00000000-0000-0000-0000-000000000000'],
      message: 'Run all pending test cases',
    });
    assert(false, 'Should have thrown missing environment error');
  } catch (err: any) {
    assert(
      err.message.includes('No target environment URL is configured'),
      `Threw clear actionable error instead of silent fallback: "${err.message}"`
    );
  }

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
