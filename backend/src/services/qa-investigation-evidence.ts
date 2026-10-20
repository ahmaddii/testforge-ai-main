import fs from 'fs';
import path from 'path';
import { inflateRawSync } from 'zlib';

const EVIDENCE_DIR = path.resolve(__dirname, '../../data/evidence');

export interface ArtifactInspection {
  state: 'inspected' | 'unavailable' | 'not_recorded';
  kind: 'screenshot' | 'trace';
  detail: string;
  mimeType?: string;
  base64?: string;
  traceSummary?: Record<string, unknown>;
}

function extractTraceSummary(zip: Buffer): Record<string, unknown> {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error('Trace ZIP directory is missing.');
  const entries = zip.readUInt16LE(eocd + 10);
  let cursor = zip.readUInt32LE(eocd + 16);
  let traceText = '';
  for (let i = 0; i < entries; i++) {
    if (zip.readUInt32LE(cursor) !== 0x02014b50) throw new Error('Trace ZIP directory is invalid.');
    const method = zip.readUInt16LE(cursor + 10);
    const compressedSize = zip.readUInt32LE(cursor + 20);
    const nameLength = zip.readUInt16LE(cursor + 28);
    const extraLength = zip.readUInt16LE(cursor + 30);
    const commentLength = zip.readUInt16LE(cursor + 32);
    const localOffset = zip.readUInt32LE(cursor + 42);
    const name = zip.toString('utf8', cursor + 46, cursor + 46 + nameLength);
    if (name === 'trace.trace' && compressedSize < 4_000_000) {
      const localNameLength = zip.readUInt16LE(localOffset + 26);
      const localExtraLength = zip.readUInt16LE(localOffset + 28);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = zip.subarray(dataStart, dataStart + compressedSize);
      traceText = (method === 0 ? compressed : method === 8 ? inflateRawSync(compressed) : Buffer.alloc(0)).toString('utf8');
      break;
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (!traceText) throw new Error('Trace archive has no readable trace.trace event log.');
  const events = traceText.split(/\r?\n/).filter(Boolean).slice(0, 10000).map((line) => JSON.parse(line));
  const actions = events.filter((event) => event.type === 'action').slice(-80).map((event) => ({
    name: event.metadata?.apiName || event.apiName || event.type,
    selector: event.metadata?.params?.selector || event.params?.selector,
    error: event.metadata?.error?.message || event.error?.message,
    startTime: event.startTime,
  }));
  const resources = events.filter((event) => event.type === 'resource').slice(-80).map((event) => ({
    url: event.url,
    method: event.request?.method,
    status: event.response?.status,
    contentType: event.response?.content?.mimeType,
  }));
  return { event_count: events.length, actions, resources };
}

function safeLocalEvidencePath(url: string, runId: string): string | null {
  const prefix = `/api/execution-runs/evidence/${encodeURIComponent(runId)}/`;
  if (!url.startsWith(prefix)) return null;
  const filename = decodeURIComponent(url.slice(prefix.length));
  if (!filename || path.basename(filename) !== filename) return null;
  const target = path.resolve(EVIDENCE_DIR, runId, filename);
  return target.startsWith(`${path.resolve(EVIDENCE_DIR, runId)}${path.sep}`) ? target : null;
}

export async function inspectSavedArtifact(params: {
  url?: string | null;
  runId: string;
  kind: 'screenshot' | 'trace';
  maxBytes?: number;
}): Promise<ArtifactInspection> {
  const { url, runId, kind } = params;
  if (!url) return { state: 'not_recorded', kind, detail: `${kind} was not recorded for this test.` };

  const maxBytes = params.maxBytes ?? (kind === 'screenshot' ? 2_000_000 : 12_000_000);
  try {
    let bytes: Buffer;
    let mimeType = kind === 'screenshot' ? 'image/png' : 'application/zip';
    const localPath = safeLocalEvidencePath(url, runId);
    if (localPath) {
      bytes = await fs.promises.readFile(localPath);
    } else {
      const artifactUrl = new URL(url);
      const trustedOrigin = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : null;
      if (!trustedOrigin || artifactUrl.origin !== trustedOrigin || !artifactUrl.pathname.includes('/storage/v1/object/public/failure-recordings/')) {
        return { state: 'unavailable', kind, detail: `${kind} URL is outside the configured evidence store; it was not accessed.` };
      }
      const response = await fetch(artifactUrl, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) return { state: 'unavailable', kind, detail: `${kind} retrieval returned HTTP ${response.status}.` };
      const arrayBuffer = await response.arrayBuffer();
      bytes = Buffer.from(arrayBuffer);
      mimeType = response.headers.get('content-type') || mimeType;
    }
    if (!bytes.length || bytes.length > maxBytes) {
      return { state: 'unavailable', kind, detail: `${kind} has an invalid or oversized file (${bytes.length} bytes).` };
    }
    if (kind === 'screenshot' && (bytes[0] !== 0x89 || bytes.toString('ascii', 1, 4) !== 'PNG')) {
      return { state: 'unavailable', kind, detail: 'Retrieved screenshot is not a valid PNG image.' };
    }
    if (kind === 'trace' && (bytes[0] !== 0x50 || bytes[1] !== 0x4b)) {
      return { state: 'unavailable', kind, detail: 'Retrieved trace is not a valid ZIP archive.' };
    }
    let traceSummary: Record<string, unknown> | undefined;
    if (kind === 'trace') {
      try { traceSummary = extractTraceSummary(bytes); }
      catch (error) { return { state: 'unavailable', kind, detail: `Trace retrieved but events could not be read: ${error instanceof Error ? error.message : String(error)}` }; }
    }
    return {
      state: 'inspected',
      kind,
      detail: `Retrieved and validated ${kind} (${bytes.length} bytes).`,
      mimeType,
      ...(kind === 'screenshot' ? { base64: bytes.toString('base64') } : {}),
      ...(traceSummary ? { traceSummary } : {}),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { state: 'unavailable', kind, detail: `${kind} could not be retrieved: ${detail.slice(0, 180)}` };
  }
}

/** Stable fingerprint lets callers recognize a repeated diagnosis of unchanged evidence. */
export function fingerprintInvestigationEvidence(evidence: unknown): string {
  const crypto = require('crypto') as typeof import('crypto');
  return crypto.createHash('sha256').update(JSON.stringify(evidence)).digest('hex');
}

export function hasMaterialEvidenceChanged(previous: unknown, current: unknown): boolean {
  return fingerprintInvestigationEvidence(previous) !== fingerprintInvestigationEvidence(current);
}
