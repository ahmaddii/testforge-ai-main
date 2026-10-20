import { createHash } from 'crypto';
import { supabase } from '../lib/supabase';

const EMBED_URL =
  process.env.SPECY_AGENT_EMBED_URL || 'http://127.0.0.1:8000/embed';

export type SpecySourceType =
  | 'requirement'
  | 'test_case'
  | 'test_plan'
  | 'defect'
  | 'execution_run';

export interface SpecySourceMetadata {
  id: string;
  title: string;
  source_type: SpecySourceType;
  similarity: number;
  project_id: string | null;
  snippet?: string;
}

export interface SpecySyncStats {
  totalChecked: number;
  inserted: number;
  updated: number;
  deleted: number;
  unchanged: number;
  byType: Record<
    SpecySourceType,
    { checked: number; changed: number; deleted: number }
  >;
}

export interface RetrievedEvidenceResult {
  sources: SpecySourceMetadata[];
  contextText: string;
}

/**
 * Generate 768-dimensional embeddings via FastAPI /embed.
 * Batches requests to keep payloads manageable.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const sanitized = texts.map((t) => t.trim()).filter((t) => t.length > 0);
  if (sanitized.length === 0) return [];

  const results: number[][] = [];
  const BATCH_SIZE = 16;

  for (let start = 0; start < sanitized.length; start += BATCH_SIZE) {
    const batch = sanitized.slice(start, start + BATCH_SIZE);

    const response = await fetch(EMBED_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: batch }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(
        `Specy embedding service error (HTTP ${response.status})`,
      );
    }

    const payload = (await response.json()) as {
      embeddings?: number[][];
      dimensions?: number;
    };

    if (
      !Array.isArray(payload.embeddings) ||
      payload.embeddings.length !== batch.length ||
      payload.embeddings.some(
        (v) =>
          !Array.isArray(v) ||
          v.length !== 768 ||
          v.some((n) => typeof n !== 'number' || !Number.isFinite(n)),
      )
    ) {
      throw new Error('Invalid embedding vector structure returned by service.');
    }

    results.push(...payload.embeddings);
  }

  return results;
}

/**
 * Split text into semantic chunks with context headers.
 */
export function chunkDocument(
  title: string,
  sourceType: SpecySourceType,
  sourceId: string,
  content: string,
): string[] {
  const trimmed = content.trim();
  const MAX_CHUNK_CHARS = 1100;
  const CHUNK_OVERLAP = 150;

  if (trimmed.length <= MAX_CHUNK_CHARS) {
    return [trimmed];
  }

  const chunks: string[] = [];
  let startIndex = 0;
  const totalLength = trimmed.length;

  while (startIndex < totalLength) {
    let endIndex = Math.min(startIndex + MAX_CHUNK_CHARS, totalLength);

    if (endIndex < totalLength) {
      // Seek a newline or punctuation boundary within the last 150 characters
      const slice = trimmed.slice(endIndex - 120, endIndex);
      const boundaryRel = slice.lastIndexOf('\n');
      if (boundaryRel !== -1 && boundaryRel > 20) {
        endIndex = endIndex - 120 + boundaryRel + 1;
      } else {
        const periodRel = slice.lastIndexOf('. ');
        if (periodRel !== -1 && periodRel > 20) {
          endIndex = endIndex - 120 + periodRel + 2;
        }
      }
    }

    const chunkBody = trimmed.slice(startIndex, endIndex).trim();
    if (chunkBody.length > 0) {
      chunks.push(chunkBody);
    }

    if (endIndex >= totalLength) {
      break;
    }

    startIndex = Math.max(endIndex - CHUNK_OVERLAP, startIndex + 1);
  }

  // Prepend contextual identity headers to each chunk
  return chunks.map((chunk, idx) => {
    if (chunks.length === 1) return chunk;
    return `[${sourceType.toUpperCase()}: ${title} | ID: ${sourceId} | Part ${idx + 1}/${chunks.length}]\n${chunk}`;
  });
}

// -------------------------------------------------------------
// Formatters for each entity using real Supabase schemas
// -------------------------------------------------------------

function formatRequirement(record: Record<string, any>): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const title = record.title || 'Untitled Requirement';
  const content = [
    `[Requirement] ${title}`,
    `ID: ${record.id}`,
    `Priority: ${record.priority || 'Not specified'}`,
    `Status: ${record.status || 'Not specified'}`,
    `Description:`,
    record.description || 'No description provided.',
  ].join('\n');

  return {
    title,
    content,
    metadata: {
      source_type: 'requirement',
      priority: record.priority,
      status: record.status,
    },
  };
}

function formatTestCase(record: Record<string, any>): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const title = record.title || 'Untitled Test Case';
  const steps = typeof record.steps === 'string' ? record.steps : 'No steps specified.';
  const expected = record.expected || 'No expected result specified.';
  const content = [
    `[Test Case] ${title}`,
    `ID: ${record.id}`,
    `Module: ${record.module || 'General'}`,
    `Type: ${record.type || 'positive'}`,
    `Priority: ${record.priority || 'Medium'}`,
    `Status: ${record.status || 'Pending'}`,
    `Steps:`,
    steps,
    `Expected Result:`,
    expected,
  ].join('\n');

  return {
    title,
    content,
    metadata: {
      source_type: 'test_case',
      module: record.module,
      type: record.type,
      priority: record.priority,
      status: record.status,
    },
  };
}

function formatTestPlan(record: Record<string, any>): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const title = record.name || 'Untitled Test Plan';
  const content = [
    `[Test Plan] ${title}`,
    `ID: ${record.id}`,
    `Sprint: ${record.sprint || 'Not specified'}`,
    `Status: ${record.status || 'Planned'}`,
    `Schedule: ${record.start_date || 'N/A'} to ${record.end_date || 'N/A'}`,
    `Metrics: Total Cases: ${record.total_cases ?? 0}, Passed: ${record.passed ?? 0}, Failed: ${record.failed ?? 0}, Untested: ${record.untested ?? 0}`,
  ].join('\n');

  return {
    title,
    content,
    metadata: {
      source_type: 'test_plan',
      sprint: record.sprint,
      status: record.status,
      total_cases: record.total_cases,
      passed: record.passed,
      failed: record.failed,
      untested: record.untested,
    },
  };
}

function formatDefect(record: Record<string, any>): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const title = record.title || 'Untitled Defect';
  let description = record.description || 'No description provided.';
  let reqId: string | null = null;
  const reqMatch = description.match(/<!--REQ:(.*?)-->/);
  if (reqMatch) {
    reqId = reqMatch[1];
    description = description.replace(reqMatch[0], '').trim();
  }

  const content = [
    `[Defect] ${title}`,
    `ID: ${record.id}`,
    `Severity: ${record.severity || 'Major'}`,
    `Status: ${record.status || 'Open'}`,
    `Associated Test Case ID: ${record.test_case_id || 'None'}`,
    reqId ? `Linked Requirement ID: ${reqId}` : null,
    `Description:`,
    description,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title,
    content,
    metadata: {
      source_type: 'defect',
      severity: record.severity,
      status: record.status,
      test_case_id: record.test_case_id,
      requirement_id: reqId,
    },
  };
}

function formatExecutionRun(record: Record<string, any>): {
  title: string;
  content: string;
  metadata: Record<string, any>;
} {
  const title = record.name || 'Untitled Execution Run';
  const results = record.results && typeof record.results === 'object' ? record.results : {};
  const resultEntries = Object.entries(results).filter(
    ([key, value]) => key !== '_meta' && Boolean(value && typeof value === 'object'),
  );

  const scenarioLines: string[] = [];
  for (const [key, val] of resultEntries.slice(0, 40)) {
    if (val && typeof val === 'object') {
      const v = val as any;
      scenarioLines.push(
        `- ${v.name || key}: Status: ${v.status || 'Unknown'}, Time: ${v.time || 'N/A'}, Module: ${v.module || 'N/A'}`,
      );
    }
  }

  const content = [
    `[Execution Run] ${title}`,
    `ID: ${record.id}`,
    `Environment: ${record.environment || 'Not specified'}`,
    `Duration: ${record.duration || 'Not specified'}`,
    `Summary: Passed: ${record.passed ?? 0}, Failed: ${record.failed ?? 0}, Total Recorded: ${resultEntries.length}`,
    scenarioLines.length > 0 ? `Test Scenarios:\n${scenarioLines.join('\n')}` : 'No detailed test scenario entries recorded.',
  ].join('\n');

  return {
    title,
    content,
    metadata: {
      source_type: 'execution_run',
      environment: record.environment,
      passed: record.passed,
      failed: record.failed,
      duration: record.duration,
    },
  };
}

// -------------------------------------------------------------
// Synchronization Core
// -------------------------------------------------------------

interface PreparedItem {
  sourceType: SpecySourceType;
  record: Record<string, any>;
  title: string;
  content: string;
  hash: string;
  metadata: Record<string, any>;
  chunks: string[];
}

async function syncWorkspaceRAGFull(options: {
  ownerIds: string[];
  projectId?: string | null;
}): Promise<SpecySyncStats> {
  const { ownerIds, projectId } = options;

  if (!ownerIds || ownerIds.length === 0) {
    return {
      totalChecked: 0,
      inserted: 0,
      updated: 0,
      deleted: 0,
      unchanged: 0,
      byType: {
        requirement: { checked: 0, changed: 0, deleted: 0 },
        test_case: { checked: 0, changed: 0, deleted: 0 },
        test_plan: { checked: 0, changed: 0, deleted: 0 },
        defect: { checked: 0, changed: 0, deleted: 0 },
        execution_run: { checked: 0, changed: 0, deleted: 0 },
      },
    };
  }

  // 1. Fetch current live records from all 5 tables
  const fetchTable = async (table: string) => {
    const pageSize = 500;
    const records: Record<string, any>[] = [];
    for (let offset = 0; ; offset += pageSize) {
      let query = supabase
        .from(table)
        .select('*')
        .in('user_id', ownerIds)
        .order('id', { ascending: true })
        .range(offset, offset + pageSize - 1);
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query;
      if (error) {
        throw new Error(`Failed to load ${table} for RAG sync: ${error.message}`);
      }
      const page = (data || []) as Record<string, any>[];
      records.push(...page);
      if (page.length < pageSize) return records;
    }
  };

  const [reqs, cases, plans, defects, runs] = await Promise.all([
    fetchTable('requirements'),
    fetchTable('test_cases'),
    fetchTable('test_plans'),
    fetchTable('defects'),
    fetchTable('execution_runs'),
  ]);

  // 2. Fetch all existing indexed specy_documents in this scope
  const existingDocs: Array<{
    id: string;
    owner_id: string;
    project_id: string | null;
    source_type: SpecySourceType;
    source_id: string;
    content_hash: string;
  }> = [];
  const docPageSize = 500;
  for (let offset = 0; ; offset += docPageSize) {
    let existingDocsQuery = supabase
      .from('specy_documents')
      .select('id, owner_id, project_id, source_type, source_id, content_hash')
      .in('owner_id', ownerIds)
      .order('id', { ascending: true })
      .range(offset, offset + docPageSize - 1);
    if (projectId) existingDocsQuery = existingDocsQuery.eq('project_id', projectId);
    const { data, error } = await existingDocsQuery;
    if (error) throw new Error(`Failed to load indexed documents: ${error.message}`);
    const page = data || [];
    existingDocs.push(...page);
    if (page.length < docPageSize) break;
  }
  const existingByKey = new Map<string, (typeof existingDocs)[0]>();
  for (const doc of existingDocs) {
    existingByKey.set(`${doc.source_type}:${doc.source_id}`, doc);
  }

  const stats: SpecySyncStats = {
    totalChecked: 0,
    inserted: 0,
    updated: 0,
    deleted: 0,
    unchanged: 0,
    byType: {
      requirement: { checked: 0, changed: 0, deleted: 0 },
      test_case: { checked: 0, changed: 0, deleted: 0 },
      test_plan: { checked: 0, changed: 0, deleted: 0 },
      defect: { checked: 0, changed: 0, deleted: 0 },
      execution_run: { checked: 0, changed: 0, deleted: 0 },
    },
  };

  // 3. Process each table, identifying additions, modifications, and deletions
  const entitySets: Array<{
    type: SpecySourceType;
    records: Record<string, any>[];
    formatter: (r: Record<string, any>) => {
      title: string;
      content: string;
      metadata: Record<string, any>;
    };
  }> = [
    { type: 'requirement', records: reqs, formatter: formatRequirement },
    { type: 'test_case', records: cases, formatter: formatTestCase },
    { type: 'test_plan', records: plans, formatter: formatTestPlan },
    { type: 'defect', records: defects, formatter: formatDefect },
    { type: 'execution_run', records: runs, formatter: formatExecutionRun },
  ];

  const itemsToEmbed: PreparedItem[] = [];
  const docIdsToDelete: string[] = [];

  for (const { type, records, formatter } of entitySets) {
    stats.byType[type].checked = records.length;
    stats.totalChecked += records.length;

    const liveIdSet = new Set<string>();

    for (const record of records) {
      liveIdSet.add(record.id);

      const formatted = formatter(record);
      const hash = createHash('sha256').update(formatted.content).digest('hex');
      const existing = existingByKey.get(`${type}:${record.id}`);

      if (existing && existing.content_hash === hash) {
        stats.unchanged++;
        continue;
      }

      const chunks = chunkDocument(formatted.title, type, record.id, formatted.content);
      itemsToEmbed.push({
        sourceType: type,
        record,
        title: formatted.title,
        content: formatted.content,
        hash,
        metadata: formatted.metadata,
        chunks,
      });

      stats.byType[type].changed++;
      if (existing) {
        stats.updated++;
      } else {
        stats.inserted++;
      }
    }

    // Check for deletions in this category
    for (const doc of existingDocs) {
      if (doc.source_type === type && !liveIdSet.has(doc.source_id)) {
        docIdsToDelete.push(doc.id);
        stats.byType[type].deleted++;
        stats.deleted++;
      }
    }
  }

  // 4. Handle Deletions: purge orphaned documents and chunks
  if (docIdsToDelete.length > 0) {
    // Delete chunks first to guarantee no orphans
    const { error: chunkDelErr } = await supabase
      .from('specy_document_chunks')
      .delete()
      .in('document_id', docIdsToDelete);

    if (chunkDelErr) throw new Error(`Failed to delete stale RAG chunks: ${chunkDelErr.message}`);

    const { error: docDelErr } = await supabase
      .from('specy_documents')
      .delete()
      .in('id', docIdsToDelete);

    if (docDelErr) throw new Error(`Failed to delete stale RAG documents: ${docDelErr.message}`);

    console.log(`[Specy RAG] Purged ${docIdsToDelete.length} deleted records from index.`);
  }

  if (itemsToEmbed.length === 0) {
    return stats;
  }

  console.log(
    `[Specy RAG] Synchronizing ${itemsToEmbed.length} new/updated documents into vector store...`,
  );

  // 5. Embed all chunks and insert atomically per document
  // Flatten all chunks to embed in efficient batches
  const allChunkTexts: string[] = [];
  const chunkMapping: Array<{ itemIndex: number; chunkIndex: number }> = [];

  for (let i = 0; i < itemsToEmbed.length; i++) {
    for (let c = 0; c < itemsToEmbed[i].chunks.length; c++) {
      allChunkTexts.push(itemsToEmbed[i].chunks[c]);
      chunkMapping.push({ itemIndex: i, chunkIndex: c });
    }
  }

  const vectors = await embedTexts(allChunkTexts);

  // Group vectors back by item
  const itemVectors: number[][][] = itemsToEmbed.map(() => []);
  for (let idx = 0; idx < chunkMapping.length; idx++) {
    const { itemIndex } = chunkMapping[idx];
    itemVectors[itemIndex].push(vectors[idx]);
  }

  // 6. Upsert specy_documents and replace specy_document_chunks
  for (let i = 0; i < itemsToEmbed.length; i++) {
    const item = itemsToEmbed[i];
    const { record, sourceType, title, hash, metadata, chunks } = item;
    const itemVecs = itemVectors[i];

    const ownerId = record.user_id || record.owner_id;
    const docProjectId = record.project_id || projectId || null;

    const { data: document, error: upsertError } = await supabase
      .from('specy_documents')
      .upsert(
        {
          owner_id: ownerId,
          project_id: docProjectId,
          source_type: sourceType,
          source_id: record.id,
          title,
          content_hash: hash,
          metadata,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id,source_type,source_id' },
      )
      .select('id')
      .single();

    if (upsertError || !document) {
      throw new Error(
        `[Specy RAG] Failed to upsert document ${sourceType}:${record.id}: ${upsertError?.message || 'No document returned'}`,
      );
    }

    // Remove old chunks to prevent stale or duplicate vectors
    const { error: oldChunksError } = await supabase
      .from('specy_document_chunks')
      .delete()
      .eq('document_id', document.id);
    if (oldChunksError) {
      throw new Error(`Failed to replace RAG chunks for ${sourceType}:${record.id}: ${oldChunksError.message}`);
    }

    // Insert new chunks
    const chunkRows = chunks.map((chunkText, cIdx) => ({
      document_id: document.id,
      owner_id: ownerId,
      project_id: docProjectId,
      chunk_index: cIdx,
      content: chunkText,
      embedding: JSON.stringify(itemVecs[cIdx]),
      metadata: {
        ...metadata,
        source_id: record.id,
        source_type: sourceType,
      },
    }));

    const { error: insertChunkErr } = await supabase
      .from('specy_document_chunks')
      .insert(chunkRows);

    if (insertChunkErr) {
      await supabase
        .from('specy_documents')
        .update({ content_hash: null })
        .eq('id', document.id);
      throw new Error(`Failed to index chunks for ${sourceType}:${record.id}: ${insertChunkErr.message}`);
    }
  }

  console.log(
    `[Specy RAG] Index sync complete. Inserted: ${stats.inserted}, Updated: ${stats.updated}, Deleted: ${stats.deleted}, Unchanged: ${stats.unchanged}.`,
  );

  return stats;
}

type RAGScope = { ownerIds: string[]; projectId: string | null; lastSyncedAt: number; syncing?: Promise<void> };
const ragScopes = new Map<string, RAGScope>();
const ragRefreshTimers = new Map<string, ReturnType<typeof setTimeout>>();
const RAG_FRESHNESS_MS = 30_000;
const LIVE_TABLES = ['requirements', 'test_cases', 'test_plans', 'defects', 'execution_runs'] as const;
let realtimeInitialized = false;

function getScopeKey(ownerIds: string[], projectId?: string | null): string {
  return `${[...new Set(ownerIds)].sort().join(',')}:${projectId || '*'}`;
}

/** Full sync for the explicit "sync knowledge base" action. */
export async function syncWorkspaceRAG(options: {
  ownerIds: string[];
  projectId?: string | null;
}): Promise<SpecySyncStats> {
  const key = getScopeKey(options.ownerIds, options.projectId);
  const scope: RAGScope = ragScopes.get(key) || {
    ownerIds: [...new Set(options.ownerIds)],
    projectId: options.projectId || null,
    lastSyncedAt: 0,
  };
  const stats = await syncWorkspaceRAGFull(options);
  scope.lastSyncedAt = Date.now();
  ragScopes.set(key, scope);
  return stats;
}

/** Keep routine chats quick; real-time changes force an immediate refresh. */
export async function ensureWorkspaceRAGFresh(options: {
  ownerIds: string[];
  projectId?: string | null;
}): Promise<void> {
  if (!options.ownerIds.length) return;
  const key = getScopeKey(options.ownerIds, options.projectId);
  let scope = ragScopes.get(key);
  if (!scope) {
    scope = { ownerIds: [...new Set(options.ownerIds)], projectId: options.projectId || null, lastSyncedAt: 0 };
    ragScopes.set(key, scope);
  }
  if (scope.syncing) return scope.syncing;
  if (Date.now() - scope.lastSyncedAt < RAG_FRESHNESS_MS) return;

  scope.syncing = syncWorkspaceRAGFull(options)
    .then(() => { scope!.lastSyncedAt = Date.now(); })
    .finally(() => { scope!.syncing = undefined; });
  return scope.syncing;
}

/** Subscribe to QA table changes and refresh registered workspace indexes. */
export function initializeSpecyRAGRealtime(): void {
  if (realtimeInitialized) return;
  realtimeInitialized = true;

  let channel = supabase.channel('specy-rag-live-workspace-sync');
  for (const table of LIVE_TABLES) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload: any) => {
      const changedRecord = payload.new || payload.old || {};
      const ownerId = changedRecord.user_id || changedRecord.owner_id;
      const projectId = changedRecord.project_id;
      const affected = [...ragScopes.entries()].filter(([, scope]) =>
        (!ownerId || scope.ownerIds.includes(ownerId)) &&
        (!projectId || !scope.projectId || scope.projectId === projectId),
      );

      for (const [key, scope] of affected) {
        scope.lastSyncedAt = 0;
        const existingTimer = ragRefreshTimers.get(key);
        if (existingTimer) clearTimeout(existingTimer);
        ragRefreshTimers.set(key, setTimeout(() => {
          ragRefreshTimers.delete(key);
          void ensureWorkspaceRAGFresh(scope).catch((error) => {
            console.error(`[Specy RAG] Live refresh failed for ${key}:`, error);
          });
        }, 350));
      }
    });
  }

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') console.log('[Specy RAG] Listening for live workspace changes.');
    else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      console.warn(`[Specy RAG] Live database subscription status: ${status}. On-demand freshness checks remain enabled.`);
    }
  });
}

// -------------------------------------------------------------
// AI Defect Investigator Relational Graph Assembly
// -------------------------------------------------------------

export async function assembleDefectInvestigationGraph(options: {
  ownerIds: string[];
  projectId?: string | null;
}): Promise<{ graphText: string; sources: SpecySourceMetadata[] }> {
  const { ownerIds, projectId } = options;

  let runsQuery = supabase
    .from('execution_runs')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false })
    .limit(8);

  if (projectId) {
    runsQuery = runsQuery.eq('project_id', projectId);
  }

  const { data: runsData } = await runsQuery;
  const runs = runsData || [];
  const failedRuns = runs.filter((r) => Number(r.failed) > 0);
  const baselineRuns = runs.filter(
    (r) => Number(r.failed) === 0 && Number(r.passed) > 0,
  );

  if (failedRuns.length === 0) {
    return { graphText: '', sources: [] };
  }

  const targetRun = failedRuns[0];
  const results =
    targetRun.results && typeof targetRun.results === 'object'
      ? targetRun.results
      : {};

  const failedScenarios: Array<{
    id: string;
    name: string;
    module: string;
    time?: string;
    status: string;
  }> = [];

  for (const [key, val] of Object.entries(results)) {
    if (val && typeof val === 'object') {
      const item = val as any;
      if (item.status === 'Failed') {
        failedScenarios.push({
          id: key,
          name: item.name || key,
          module: item.module || 'General',
          time: item.time,
          status: 'Failed',
        });
      }
    }
  }

  // Fetch defects for this project scope
  let defectsQuery = supabase
    .from('defects')
    .select('*')
    .in('user_id', ownerIds)
    .order('created_at', { ascending: false })
    .limit(10);

  if (projectId) {
    defectsQuery = defectsQuery.eq('project_id', projectId);
  }

  const { data: defectsData } = await defectsQuery;
  const defects = defectsData || [];

  // Fetch requirements for this project scope
  let reqsQuery = supabase
    .from('requirements')
    .select('*')
    .in('user_id', ownerIds)
    .limit(10);

  if (projectId) {
    reqsQuery = reqsQuery.eq('project_id', projectId);
  }

  const { data: reqsData } = await reqsQuery;
  const requirements = reqsData || [];

  const graphSections: string[] = [];
  graphSections.push('=== CONNECTED DEFECT INVESTIGATION GRAPH ===');
  graphSections.push(
    `TARGET FAILED EXECUTION RUN:\n` +
      `- Run Name: "${targetRun.name}"\n` +
      `- Run ID: ${targetRun.id}\n` +
      `- Environment: "${targetRun.environment}"\n` +
      `- Execution Timestamp: ${targetRun.created_at}\n` +
      `- Outcome: ${targetRun.passed} Passed, ${targetRun.failed} Failed (Duration: ${targetRun.duration})`,
  );

  if (baselineRuns.length > 0) {
    const base = baselineRuns[0];
    graphSections.push(
      `BASELINE PASSING COMPARISON RUN:\n` +
        `- Run Name: "${base.name}" (ID: ${base.id})\n` +
        `- Environment: "${base.environment}"\n` +
        `- Outcome: ${base.passed} Passed, ${base.failed} Failed\n` +
        `- Diagnostic Insight: All ${base.passed} scenarios passed in this baseline environment before failing in the target environment.`,
    );
  }

  if (failedScenarios.length > 0) {
    graphSections.push(
      `FAILED TEST SCENARIOS (${failedScenarios.length} Total):\n` +
        failedScenarios
          .map(
            (s, idx) =>
              `  ${idx + 1}. [Test Case ID: ${s.id}] "${s.name}" (Module: ${s.module}, Time: ${s.time || 'N/A'})`,
          )
          .join('\n'),
    );
  }

  if (defects.length > 0) {
    graphSections.push(
      `EXISTING DEFECT TICKETS & REGRESSION REPORTS (${defects.length}):\n` +
        defects
          .map(
            (d) =>
              `- [Defect ID: ${d.id}] "${d.title}" (Severity: ${d.severity}, Status: ${d.status})\n  Description:\n${d.description}`,
          )
          .join('\n\n'),
    );
  }

  if (requirements.length > 0) {
    graphSections.push(
      `GOVERNING PROJECT REQUIREMENTS (${requirements.length}):\n` +
        requirements
          .map(
            (r) =>
              `- [Requirement ID: ${r.id}] "${r.title}" (Priority: ${r.priority}, Status: ${r.status})\n  Description: ${r.description}`,
          )
          .join('\n\n'),
    );
  }
  graphSections.push('=== END OF DEFECT INVESTIGATION GRAPH ===');

  const sources: SpecySourceMetadata[] = [
    {
      id: targetRun.id,
      title: targetRun.name,
      source_type: 'execution_run',
      similarity: 0.96,
      project_id: targetRun.project_id,
      snippet: `Failed Execution Run on ${targetRun.environment}: ${targetRun.failed} failed tests.`,
    },
  ];

  for (const d of defects.slice(0, 2)) {
    sources.push({
      id: d.id,
      title: d.title,
      source_type: 'defect',
      similarity: 0.93,
      project_id: d.project_id,
      snippet: d.description?.slice(0, 240),
    });
  }

  for (const r of requirements.slice(0, 2)) {
    sources.push({
      id: r.id,
      title: r.title,
      source_type: 'requirement',
      similarity: 0.89,
      project_id: r.project_id,
      snippet: r.description?.slice(0, 240),
    });
  }

  for (const s of failedScenarios.slice(0, 3)) {
    sources.push({
      id: s.id,
      title: s.name,
      source_type: 'test_case',
      similarity: 0.86,
      project_id: targetRun.project_id,
      snippet: `Failed scenario in module ${s.module}`,
    });
  }

  return { graphText: graphSections.join('\n\n'), sources };
}

// -------------------------------------------------------------
// Semantic Retrieval & Investigation Integration
// -------------------------------------------------------------

export async function retrieveEvidence(options: {
  query: string;
  ownerIds: string[];
  projectId?: string | null;
  minSimilarity?: number;
  limit?: number;
}): Promise<RetrievedEvidenceResult> {
  const {
    query,
    ownerIds,
    projectId,
    minSimilarity = 0.55,
    limit = 6,
  } = options;

  const trimmedQuery = query.trim();
  if (!trimmedQuery || ownerIds.length === 0) {
    return { sources: [], contextText: '' };
  }

  const isInvestigationQuery =
    /\b(investigat|why did|fail|failure|defect|regression|broken|error|crash|bug|run|diff)\b/i.test(
      trimmedQuery,
    );

  // If this is an investigation inquiry, assemble relational defect graph
  let defectGraphText = '';
  let defectGraphSources: SpecySourceMetadata[] = [];

  if (isInvestigationQuery) {
    try {
      const defectGraph = await assembleDefectInvestigationGraph({
        ownerIds,
        projectId,
      });
      defectGraphText = defectGraph.graphText;
      defectGraphSources = defectGraph.sources;
    } catch (graphErr) {
      console.warn('[Specy RAG] Could not assemble defect graph:', graphErr);
    }
  }

  const [queryEmbedding] = await embedTexts([trimmedQuery]);
  if (!queryEmbedding) {
    return {
      sources: defectGraphSources,
      contextText: defectGraphText,
    };
  }

  const { data, error } = await supabase.rpc('match_specy_chunks', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_count: Math.max(limit * 3, 15),
    filter_owner_ids: ownerIds,
    filter_project_id: projectId || null,
  });

  if (error) {
    console.error('[Specy RAG] match_specy_chunks RPC failed:', error.message);
    if (defectGraphText) {
      return { sources: defectGraphSources, contextText: defectGraphText };
    }
    throw new Error(`Vector match failed: ${error.message}`);
  }

  const rawMatches = (data || []) as Array<{
    chunk_id?: string;
    document_id: string;
    owner_id: string;
    project_id: string | null;
    source_type: SpecySourceType;
    source_id: string;
    title: string;
    content: string;
    similarity: number;
    metadata?: Record<string, any>;
  }>;

  const relevantMatches = rawMatches.filter(
    (m) => typeof m.similarity === 'number' && m.similarity >= minSimilarity,
  );

  const seenSources = new Set<string>();
  const combinedSources: SpecySourceMetadata[] = [];

  // Prepend defect graph sources if available
  for (const src of defectGraphSources) {
    if (!seenSources.has(src.id)) {
      seenSources.add(src.id);
      combinedSources.push(src);
    }
  }

  const selectedVectorMatches: typeof relevantMatches = [];
  for (const match of relevantMatches) {
    if (!seenSources.has(match.source_id)) {
      seenSources.add(match.source_id);
      selectedVectorMatches.push(match);
      if (combinedSources.length + selectedVectorMatches.length >= limit + 4) {
        break;
      }
    }
  }

  for (const m of selectedVectorMatches) {
    combinedSources.push({
      id: m.source_id,
      title: m.title || 'Untitled',
      source_type: m.source_type,
      similarity: Number(m.similarity),
      project_id: m.project_id,
      snippet: m.content.slice(0, 240),
    });
  }

  const vectorPassagesText = selectedVectorMatches
    .map((match, idx) =>
      [
        `Evidence [${idx + 1}]:`,
        `Record Type: ${match.source_type}`,
        `Record Title: ${match.title}`,
        `Record ID: ${match.source_id}`,
        `Project ID: ${match.project_id || 'Global/Workspace'}`,
        `Relevance Score: ${Number(match.similarity).toFixed(3)}`,
        `Content:`,
        match.content,
      ].join('\n'),
    )
    .join('\n\n---\n\n');

  const combinedContextText = [defectGraphText, vectorPassagesText]
    .filter(Boolean)
    .join('\n\n---\n\n');

  return { sources: combinedSources, contextText: combinedContextText };
}

