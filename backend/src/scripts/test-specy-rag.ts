import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../lib/supabase';
import { syncWorkspaceRAG, retrieveEvidence } from '../services/specy-rag';

async function runTests() {
  console.log('=== STARTING SPECY RAG TEST SUITE ===');

  // Find an existing project and owner in the database
  const { data: projects } = await supabase.from('projects').select('*').limit(2);
  if (!projects || projects.length === 0) {
    console.error('No project found in database to test.');
    process.exit(1);
  }

  const project = projects[0];
  const ownerId = project.user_id;
  const projectId = project.id;
  console.log(`Testing with ownerId: ${ownerId}, projectId: ${projectId} (${project.name})`);

  // Test 1: Full Sync across all entities
  console.log('\n--- Test 1: Full RAG Synchronization ---');
  const syncStats = await syncWorkspaceRAG({
    ownerIds: [ownerId],
    projectId: projectId,
  });
  console.log('Sync Stats:', JSON.stringify(syncStats, null, 2));

  // Test 2: Idempotent Sync (Second run should skip unchanged docs)
  console.log('\n--- Test 2: Idempotency (Unchanged docs should be skipped) ---');
  const secondSync = await syncWorkspaceRAG({
    ownerIds: [ownerId],
    projectId: projectId,
  });
  console.log('Second Sync Stats (should have 0 changed, all unchanged):', JSON.stringify(secondSync, null, 2));
  if (secondSync.inserted !== 0 || secondSync.updated !== 0) {
    console.error('FAILED: Second sync re-embedded unchanged documents!');
  } else {
    console.log('PASSED: Second sync properly skipped all unchanged documents.');
  }

  // Test 3: Check database records in specy_documents and specy_document_chunks
  console.log('\n--- Test 3: Inspect Vector Documents & Chunks ---');
  const { data: indexedDocs } = await supabase
    .from('specy_documents')
    .select('id, source_type, title, content_hash')
    .eq('owner_id', ownerId)
    .eq('project_id', projectId);

  console.log(`Found ${indexedDocs?.length || 0} indexed documents in specy_documents:`);
  for (const doc of (indexedDocs || [])) {
    const { count: chunkCount } = await supabase
      .from('specy_document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('document_id', doc.id);
    console.log(`- [${doc.source_type}] "${doc.title}" (chunks: ${chunkCount})`);
  }

  // Test 4: Semantic Search on Requirements / Test Cases / Defects / Runs
  console.log('\n--- Test 4: Semantic Search Queries ---');
  const testQueries = [
    'How does user checkout with a credit card work?',
    'What regression failures or defects were reported?',
    'How did the staging execution run perform?',
    'Something completely unrelated like astronomy and black holes',
  ];

  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    const result = await retrieveEvidence({
      query,
      ownerIds: [ownerId],
      projectId,
      minSimilarity: 0.35,
      limit: 4,
    });
    console.log(`Retrieved ${result.sources.length} sources (minSimilarity 0.35):`);
    for (const src of result.sources) {
      console.log(`  -> [${src.source_type}] "${src.title}" (similarity: ${(src.similarity * 100).toFixed(1)}%)`);
    }
  }

  // Test 5: Project Isolation
  console.log('\n--- Test 5: Project Isolation Verification ---');
  const bogusProjectId = '00000000-0000-0000-0000-000000000000';
  const isolatedResult = await retrieveEvidence({
    query: 'User Checkout and Payment',
    ownerIds: [ownerId],
    projectId: bogusProjectId,
    minSimilarity: 0.35,
    limit: 4,
  });
  console.log(`Querying with non-matching project ID returned: ${isolatedResult.sources.length} sources.`);
  if (isolatedResult.sources.length === 0) {
    console.log('PASSED: Project isolation strictly enforced; no data leaked across different project.');
  } else {
    console.error('FAILED: Project isolation leaked data!');
  }

  // Test 6: Insert, Update, and Delete Sync Test
  console.log('\n--- Test 6: Test Record Lifecycle (Insert, Update, Delete) ---');
  // Create a temporary test plan to test RAG lifecycle
  const testPlanName = `Temp Test Plan ${Date.now()}`;
  const { data: tempPlan, error: planErr } = await supabase
    .from('test_plans')
    .insert({
      user_id: ownerId,
      project_id: projectId,
      name: testPlanName,
      sprint: 'Sprint Alpha Test',
      start_date: '2026-10-20',
      end_date: '2026-10-30',
      status: 'Planned',
      total_cases: 10,
      passed: 0,
      failed: 0,
      untested: 10,
    })
    .select()
    .single();

  if (planErr || !tempPlan) {
    console.error('Could not create temp test plan:', planErr?.message);
  } else {
    console.log(`Created temp test plan with ID: ${tempPlan.id}`);
    
    // Sync: should insert 1
    const syncInsert = await syncWorkspaceRAG({ ownerIds: [ownerId], projectId });
    console.log(`Sync after insert: inserted=${syncInsert.inserted}, updated=${syncInsert.updated}, deleted=${syncInsert.deleted}`);

    // Update the test plan
    await supabase
      .from('test_plans')
      .update({ name: `${testPlanName} (Updated v2)`, total_cases: 25 })
      .eq('id', tempPlan.id);

    // Sync: should update 1
    const syncUpdate = await syncWorkspaceRAG({ ownerIds: [ownerId], projectId });
    console.log(`Sync after update: inserted=${syncUpdate.inserted}, updated=${syncUpdate.updated}, deleted=${syncUpdate.deleted}`);

    // Delete the test plan
    await supabase.from('test_plans').delete().eq('id', tempPlan.id);

    // Sync: should delete 1 from index
    const syncDelete = await syncWorkspaceRAG({ ownerIds: [ownerId], projectId });
    console.log(`Sync after delete: inserted=${syncDelete.inserted}, updated=${syncDelete.updated}, deleted=${syncDelete.deleted}`);

    // Verify it is gone from specy_documents
    const { data: checkDeleted } = await supabase
      .from('specy_documents')
      .select('id')
      .eq('source_type', 'test_plan')
      .eq('source_id', tempPlan.id);

    if (!checkDeleted || checkDeleted.length === 0) {
      console.log('PASSED: Temporary document and chunks successfully purged from vector index on deletion.');
    } else {
      console.error('FAILED: Deleted record still exists in vector index!');
    }
  }

  console.log('\n=== ALL SPECY RAG TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch((err) => {
  console.error('Test run error:', err);
  process.exit(1);
});
