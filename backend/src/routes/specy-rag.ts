import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getAccessibleOwnerIds, getProjectWithAccess } from '../lib/access';
import {
  syncWorkspaceRAG,
  retrieveEvidence,
} from '../services/specy-rag';

const router = Router();

/**
 * POST /api/specy-rag/sync
 * Comprehensive sync of all workspace entities:
 * requirements, test cases, test plans, defects, and execution runs.
 */
router.post('/sync', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const rawProjectId = req.body?.project_id;
    const projectId =
      typeof rawProjectId === 'string' && rawProjectId.trim() !== '' && rawProjectId !== 'all'
        ? rawProjectId.trim()
        : null;

    if (projectId) {
      const { project, error: accessErr } = await getProjectWithAccess(
        projectId,
        userId,
      );
      if (accessErr || !project) {
        return res.status(404).json({ error: 'Project not found or access denied.' });
      }
    }

    const ownerIds = await getAccessibleOwnerIds(userId);
    const stats = await syncWorkspaceRAG({ ownerIds, projectId });

    return res.json({
      success: true,
      message: `Knowledge base synced. ${stats.inserted} inserted, ${stats.updated} updated, ${stats.deleted} deleted, ${stats.unchanged} unchanged.`,
      stats,
      project_id: projectId,
    });
  } catch (error: any) {
    console.error('Specy RAG sync failed:', error);
    return res.status(500).json({
      error: error?.message || 'Knowledge base sync failed. Check backend logs.',
    });
  }
});

/**
 * POST /api/specy-rag/ingest/requirements
 * Backward-compatible endpoint specifically for requirement sync.
 */
router.post(
  '/ingest/requirements',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const rawProjectId = req.body?.project_id;
      const projectId =
        typeof rawProjectId === 'string' && rawProjectId.trim() !== '' && rawProjectId !== 'all'
          ? rawProjectId.trim()
          : null;

      if (projectId) {
        const { project, error: accessErr } = await getProjectWithAccess(
          projectId,
          userId,
        );
        if (accessErr || !project) {
          return res.status(404).json({ error: 'Project not found' });
        }
      }

      const ownerIds = await getAccessibleOwnerIds(userId);
      const stats = await syncWorkspaceRAG({ ownerIds, projectId });

      return res.json({
        success: true,
        source: 'requirements',
        stats: stats.byType.requirement,
        message: 'Requirements indexed for semantic retrieval.',
      });
    } catch (error: any) {
      console.error('Specy RAG ingestion failed:', error);
      return res.status(500).json({
        error: error?.message || 'Requirement ingestion failed.',
      });
    }
  },
);

/**
 * POST /api/specy-rag/search
 * Semantic retrieval across all indexed project artifacts with similarity filtering.
 */
router.post('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const question =
      typeof req.body?.query === 'string' ? req.body.query.trim() : '';

    const rawProjectId = req.body?.project_id;
    const projectId =
      typeof rawProjectId === 'string' && rawProjectId.trim() !== '' && rawProjectId !== 'all'
        ? rawProjectId.trim()
        : null;

    const minSimilarity =
      typeof req.body?.min_similarity === 'number'
        ? req.body.min_similarity
        : 0.55;

    const limit =
      typeof req.body?.limit === 'number'
        ? Math.min(Math.max(req.body.limit, 1), 20)
        : 6;

    if (!question || question.length > 4000) {
      return res.status(400).json({
        error: 'Query must contain between 1 and 4000 characters.',
      });
    }

    const userId = req.user!.id;
    const ownerIds = await getAccessibleOwnerIds(userId);

    if (projectId) {
      const { project, error: accessErr } = await getProjectWithAccess(
        projectId,
        userId,
      );
      if (accessErr || !project) {
        return res.status(404).json({ error: 'Project not found or access denied.' });
      }
    }

    const { sources, contextText } = await retrieveEvidence({
      query: question,
      ownerIds,
      projectId,
      minSimilarity,
      limit,
    });

    return res.json({
      query: question,
      project_id: projectId,
      count: sources.length,
      results: sources,
      evidence_text: contextText,
    });
  } catch (error: any) {
    console.error('Specy RAG search failed:', error);
    return res.status(500).json({
      error: error?.message || 'Semantic search failed. Check backend logs.',
    });
  }
});

export default router;
