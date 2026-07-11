import { BookOpen, Bookmark, Wand2, Terminal, Cpu, ShieldCheck, FileText } from "lucide-react";

export type DocArticle = {
  id: string;
  category: string;
  icon: any;
  title: string;
  summary: string;
  content: string;
  readTime: string;
};

export const articles: DocArticle[] = [
  {
    id: "repo-sync",
    category: "Projects & Test Cases",
    icon: BookOpen,
    title: "Repository Synchronization & Webhooks",
    summary: "Connect GitHub repositories, setup continuous sync, and organize file structures.",
    readTime: "3 min read",
    content: `Speclane establishes a secure, automated webhook connection with your GitHub repository. When new branches are created or code is pushed, Speclane parses your project structure, indexes ASTs (Abstract Syntax Trees), and identifies untested modules.

### Key Capabilities
• Continuous 2-Way GitHub Webhook Integration
• AST Codebase Indexing & Dependency Mapping
• Automated Repository Branch Detection

To configure manual sync or verify webhook connectivity, navigate to Project Settings and click 'Resync Codebase'. All synchronization events are securely logged with SHA hashes.`
  },
  {
    id: "rtm-traceability",
    category: "Projects & Test Cases",
    icon: Bookmark,
    title: "Requirement Traceability & RTM Generation",
    summary: "Maintain full bi-directional traceability from product specs to test execution results.",
    readTime: "4 min read",
    content: `The Requirement Traceability Matrix (RTM) ensures compliance for enterprise and regulated environments (e.g., SOC2, ISO27001). Speclane automatically extracts requirement identifiers (e.g. REQ-204) from commit messages and PR descriptions, linking them directly to executed test suites.

### Generating Compliance Reports
You can download compliance audit reports in PDF or CSV format directly from the dashboard. The matrix maps every user story to its corresponding BDD scenarios and execution history in real-time.`
  },
  {
    id: "bdd-prompts",
    category: "AI Test Generator",
    icon: Wand2,
    title: "Writing BDD Scenarios & AI Prompts",
    summary: "Best practices for formatting user stories to maximize AI test generation accuracy.",
    readTime: "5 min read",
    content: `For high-fidelity test generation, provide clear acceptance criteria using Given-When-Then BDD syntax or structured markdown bullet points.

### Prompt Formatting Guide
• **Context (Given)**: Define the initial system state and user roles.
• **Action (When)**: Specify exact user interactions, API payloads, or button clicks.
• **Verification (Then)**: Detail expected DOM changes, database records, and HTTP status codes.

Speclane's LLM engine will automatically synthesize executable test scripts in Python, Playwright, or Cypress adhering strictly to these prompt constraints.`
  },
  {
    id: "pr-ci-cd",
    category: "AI Test Generator",
    icon: Terminal,
    title: "Automated PR Test Generation in CI/CD",
    summary: "Trigger autonomous test generation and execution directly on GitHub Pull Requests.",
    readTime: "4 min read",
    content: `When a pull request is opened, Speclane's GitHub App intercepts the webhook payload, analyzes the code diff, and synthesizes targeted regression tests specifically for the modified components.

### Automated Checks
Results are posted back as a GitHub check run with inline code annotations and screenshot comparisons. If a regression is detected, the PR check is marked as failed with actionable logs.`
  },
  {
    id: "target-envs",
    category: "Target Environments",
    icon: Cpu,
    title: "Configuring Staging and Production URLs",
    summary: "Manage environment variables, authentication headers, and multi-environment runs.",
    readTime: "3 min read",
    content: `In the Environments tab, you can configure target URLs (e.g., https://staging.speclane.com vs https://app.speclane.com).

### Secure Authentication Storage
Store Bearer tokens, custom cookie headers, or basic auth credentials securely. Test runs can be parameterized to execute simultaneously across multiple target environments to ensure parity between staging and production builds.`
  },
  {
    id: "defect-triage",
    category: "Defect Lifecycle",
    icon: ShieldCheck,
    title: "Defect Triage & Automated Bug Tracking",
    summary: "Track test failures, analyze root causes, and manage defect resolution workflows.",
    readTime: "4 min read",
    content: `Every failed verification run automatically logs a Defect containing console logs, network payloads, screenshot diffs, and AI-powered root cause analysis.

### Defect States & Severities
Assign severity levels (Critical, Major, Minor) and transition defect states (Open, In Progress, Fixed) as your engineering team deploys fixes. You can also enable bi-directional sync with Jira or Linear.`
  },
  {
    id: "run-diffs",
    category: "Execution Runs",
    icon: Terminal,
    title: "Execution Run Comparison & Diff Analysis",
    summary: "Compare test execution snapshots side-by-side to detect performance regressions.",
    readTime: "5 min read",
    content: `Use the Run Comparison tool to select a Baseline Run (Run A) and a Target Run (Run B). Speclane highlights changes in test duration, execution determinism, new defect introductions, and coverage percentages.

This tool is highly effective for validating release candidates before production deployment.`
  },
  {
    id: "advanced-export",
    category: "Enterprise Analytics",
    icon: FileText,
    title: "Advanced Reporting & Data Exporting",
    summary: "Generate executive summary PDFs, detailed CSV spreadsheets, and JSON test payloads.",
    readTime: "3 min read",
    content: `Engineering leaders can export full test execution summaries, pass velocity trends, and defect burn-down charts.

Click the 'Export' buttons on the dashboard or help hub to instantly download structured reports tailored for stakeholder reviews and compliance audits.`
  },
];
