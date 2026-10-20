import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { hasMaterialEvidenceChanged, inspectSavedArtifact } from '../services/qa-investigation-evidence';

async function main() {
  const stable = { id: 'case-1', status: 'Failed', error: 'Expected 401, received 200' };
  assert.strictEqual(hasMaterialEvidenceChanged(stable, { ...stable }), false, 'identical evidence must not trigger a new diagnosis');
  assert.strictEqual(hasMaterialEvidenceChanged(stable, { ...stable, error: 'Expected 401, received 302' }), true, 'changed error evidence must trigger a fresh analysis');

  const runId = `qa-evidence-test-${Date.now()}`;
  const dir = path.resolve(__dirname, '../../data/evidence', runId);
  fs.mkdirSync(dir, { recursive: true });
  try {
    const screenshotName = 'screenshot.png';
    fs.writeFileSync(path.join(dir, screenshotName), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    const screenshot = await inspectSavedArtifact({ url: `/api/execution-runs/evidence/${runId}/${screenshotName}`, runId, kind: 'screenshot' });
    assert.strictEqual(screenshot.state, 'inspected', 'valid saved screenshot should be retrieved');
    assert.ok(screenshot.base64, 'retrieved screenshot bytes should be available for visual analysis');

    const missing = await inspectSavedArtifact({ url: `/api/execution-runs/evidence/${runId}/missing.png`, runId, kind: 'screenshot' });
    assert.strictEqual(missing.state, 'unavailable', 'missing screenshot must be reported unavailable');

    const absent = await inspectSavedArtifact({ runId, kind: 'trace' });
    assert.strictEqual(absent.state, 'not_recorded', 'absent trace must not be described as inspected');

    const unsafe = await inspectSavedArtifact({ url: 'https://example.invalid/secret.png', runId, kind: 'screenshot' });
    assert.strictEqual(unsafe.state, 'unavailable', 'untrusted remote artifact hosts must not be accessed');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  console.log('Passed: Specy QA investigation evidence regression checks.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
