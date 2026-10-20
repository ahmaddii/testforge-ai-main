/**
 * Specy Intent Classifier & Action Router
 * 
 * Accurately classifies user requests into discrete QA actions with strict
 * negation awareness, context preservation, and parameter extraction.
 */

export type SpecyIntent =
  | 'test_execution'
  | 'audit_inspection'
  | 'execution_history'
  | 'defect_investigation'
  | 'repository_analysis'
  | 'test_generation'
  | 'requirement_creation'
  | 'workspace_query';

export interface ClassifiedIntent {
  intent: SpecyIntent;
  confidence: number;
  reasoning: string;
  filterKeyword?: string;
  explicitUrl?: string;
  requirementTitle?: string;
  requirementDescription?: string;
  targetRunId?: string;
  runAll?: boolean;
}

/**
 * Extract an explicit HTTP/HTTPS URL from user prompt
 */
export function extractUrlFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s\)\],;'"]+/i);
  if (!match) return null;
  return match[0].replace(/[\.\,\;\:\?\!]+$/, '');
}

/**
 * Check if the text contains explicit negation regarding execution
 */
export function hasExecutionNegation(lower: string): boolean {
  return (
    /\b(do not|don'?t|never|without|stop|no|avoid|refrain from)\s+(run|execute|trigger|start|launch|running|executing)\b/i.test(lower) ||
    /\b(without\s+executing|without\s+running|not\s+to\s+execute|not\s+to\s+run)\b/i.test(lower) ||
    /\b(inspect\s+only|audit\s+only|dry\s+run|simulation\s+only|read\s*only)\b/i.test(lower) ||
    /\b(do\s+not\s+execute\s+tests|do\s+not\s+run\s+tests|don'?t\s+run\s+any\s+tests|do\s+not\s+run\s+any\s+tests)\b/i.test(lower)
  );
}

/**
 * Classify user prompt into a structured intent
 */
export function classifySpecyIntent(message: string): ClassifiedIntent {
  const clean = message.trim();
  const lower = clean.toLowerCase();
  const explicitUrl = extractUrlFromText(clean) || undefined;

  // Extract potential run ID (UUID pattern)
  const uuidMatch = clean.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  const targetRunId = uuidMatch ? uuidMatch[0] : undefined;

  const isNegated = hasExecutionNegation(lower);

  // 1. Audit / Evidence Inspection Intent
  // e.g. "Audit the last run without executing anything", "Do not execute tests; inspect the saved evidence",
  // "Audit the existing Vehloom execution records", "Inspect the saved evidence"
  const isAuditRequest =
    /\b(audit|inspect\s+evidence|inspect\s+the\s+saved\s+evidence|saved\s+evidence|evidence\s+only|review\s+evidence|verify\s+records)\b/i.test(lower) ||
    (isNegated && /\b(inspect|audit|check|verify|evidence|records|results)\b/i.test(lower));

  if (isAuditRequest) {
    return {
      intent: 'audit_inspection',
      confidence: 0.98,
      reasoning: 'User requested inspection or audit of existing execution records/evidence without execution.',
      explicitUrl,
      targetRunId,
    };
  }

  // 2. Execution History Intent
  // e.g. "Show me the previous execution history", "List recent execution runs", "Past runs"
  const isHistoryRequest =
    /\b(execution\s+history|previous\s+history|past\s+runs|previous\s+runs|history\s+of\s+runs|list\s+(all\s+)?runs|recent\s+runs|latest\s+run\s+summary)\b/i.test(lower) &&
    !/\b(run|execute)\s+(all|pending|tests)\b/i.test(lower);

  if (isHistoryRequest) {
    return {
      intent: 'execution_history',
      confidence: 0.95,
      reasoning: 'User requested past execution history and run logs.',
      explicitUrl,
      targetRunId,
    };
  }

  // 3. Defect & Failure Investigation Intent
  // e.g. "What tests failed in the last run, and why?", "Why did this test fail?", "Investigate failures"
  const isDefectRequest =
    /\b(why\s+(?:(?:are|do|does|did|is|were)\s+)?(?:(?:my|our|the|these|those)\s+)?(?:tests?|runs?|suite|checkout|login)?\s*fail(?:ed|ing|ure)?|what\s+tests?\s+failed|investigate\s+(the\s+)?(fail|defect|error|bug|issue)s?|root\s+cause\s+of\s+failure)\b/i.test(lower) ||
    (/\b(?:tests?|suites?|runs?)\b.{0,50}\bfail(?:ed|ing|ures?)\b/i.test(lower)) ||
    (/\bfail(?:ed|ing|ures?)?\b/i.test(lower) && /\b(why|what|explain|cause|reason|investigate)\b/i.test(lower));

  if (isDefectRequest) {
    return {
      intent: 'defect_investigation',
      confidence: 0.95,
      reasoning: 'User requested an investigation into failed test cases or defect root causes.',
      explicitUrl,
      targetRunId,
    };
  }

  // 4. Repository Analysis Intent
  // e.g. "Analyze this repository and identify the main features", "Scan the repo", "Analyze repo structure"
  const isRepoAnalysis =
    /\b(analyze\s+(this\s+)?(repo|repository|codebase|source)|identify\s+(the\s+)?(main\s+)?features|scan\s+(the\s+)?(repo|codebase|repository)|discover\s+(endpoints|routes|modules))\b/i.test(lower);

  if (isRepoAnalysis) {
    return {
      intent: 'repository_analysis',
      confidence: 0.95,
      reasoning: 'User requested static repository architecture and feature discovery analysis.',
    };
  }

  // 5. Requirement Creation Intent
  // e.g. "Create a requirement for password reset", "Add a new requirement for payment"
  const reqMatch = clean.match(/(?:create|add|new)\s+(?:a\s+)?requirement\s+(?:for|named|titled|about)?\s*[:"']?([^"'\n\.\?]+)/i);
  if (reqMatch && !/\b(test|tests|test\s*case|test\s*cases)\b/i.test(reqMatch[1])) {
    const title = reqMatch[1].trim();
    return {
      intent: 'requirement_creation',
      confidence: 0.95,
      reasoning: 'User requested the creation of a new specification requirement.',
      requirementTitle: title,
      requirementDescription: `Specification requirement for ${title}.`,
    };
  }

  // 6. Test Generation Intent
  // e.g. "Generate test cases for this requirement", "Generate test cases for password reset", "Generate BDD tests"
  const isTestGen =
    /\b(generate|create|synthesize|write|draft)\s+(automated\s+)?(test\s+cases?|tests?|test\s+plan|scenarios?|bdd)\b/i.test(lower);

  if (isTestGen) {
    const forMatch = clean.match(/for\s+["']?([^"'\n\.\?]+)/i);
    return {
      intent: 'test_generation',
      confidence: 0.95,
      reasoning: 'User requested generation of test cases or test plans.',
      filterKeyword: forMatch ? forMatch[1].trim() : undefined,
    };
  }

  // 7. Test Execution Intent
  // Must NOT be negated! Must express explicit affirmative action to run/execute tests.
  // e.g. "Run all pending test cases for the current project", "Run only the login tests against staging"
  const hasAction = /\b(run|execute|trigger|start|launch|test)\b/i.test(lower);
  const hasTarget = /\b(pending test cases|pending tests|all test cases|all tests|all cases|test cases|tests|suite|smoke tests)\b/i.test(lower);

  if (hasAction && hasTarget && !isNegated) {
    // Extract filter keyword if user requested specific tests
    // e.g. "run only the login tests", "run auth tests", "execute waitlist test cases"
    let filterKeyword: string | undefined = undefined;
    const filterMatch = lower.match(/(?:only\s+(?:the\s+)?|run\s+|execute\s+)([a-z0-9_\-]+)\s+(?:test|tests|test\s*cases)/i);
    if (filterMatch) {
      const candidate = filterMatch[1].trim().toLowerCase();
      if (!['all', 'pending', 'the', 'my', 'this', 'current', 'only', 'eligible'].includes(candidate)) {
        filterKeyword = candidate;
      }
    }

    const runAll =
      (/\b(all|every)\s+(?:of\s+)?(?:the\s+)?(?:pending\s+)?(?:test\s+cases|tests)\b/i.test(lower) &&
        !/\bpending\s+(?:test\s+cases|tests)\b/i.test(lower)) ||
      /\ball\s+(?:of\s+)?(?:the\s+)?cases\b/i.test(lower) ||
      /\b(full|entire)\s+(?:test\s+)?suite\b/i.test(lower);

    return {
      intent: 'test_execution',
      confidence: 0.96,
      reasoning: 'User explicitly requested affirmative execution of test cases.',
      filterKeyword,
      explicitUrl,
      runAll,
    };
  }

  // 8. Default to Grounded Workspace QA Query
  return {
    intent: 'workspace_query',
    confidence: 0.85,
    reasoning: 'General QA or informational workspace inquiry.',
    explicitUrl,
    targetRunId,
  };
}
