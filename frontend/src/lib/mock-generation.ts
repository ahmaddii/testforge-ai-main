import type { TestCase } from "./store";

const modules = ["Auth", "Checkout", "Cart", "API", "Profile", "Search", "Notifications"];
const titles = [
  ["Successful operation", "Validates happy path", "positive"],
  ["Invalid input rejected", "Validates error handling", "negative"],
  ["Boundary value handling", "Edge case at limits", "edge"],
  ["Unauthorized access blocked", "Permission check", "negative"],
  ["Concurrent request handling", "Race condition test", "edge"],
  ["Empty payload handled", "Empty data scenario", "edge"],
  ["Response within SLA", "Performance check", "positive"],
  ["Retry on transient failure", "Resilience verified", "positive"],
];

export function generateMockTestCases(projectId: string, n = 8): Omit<TestCase, "id">[] {
  const out: Omit<TestCase, "id">[] = [];
  for (let i = 0; i < n; i++) {
    const mod = modules[Math.floor(Math.random() * modules.length)];
    const [t, exp, type] = titles[Math.floor(Math.random() * titles.length)];
    out.push({
      project_id: projectId,
      user_id: "user-default",
      module: mod,
      title: `${mod} — ${t}`,
      steps: `1. Set up ${mod.toLowerCase()} preconditions\n2. Execute the action\n3. Observe result`,
      expected: exp,
      type: type as TestCase["type"],
      priority: (["High", "Medium", "Low"] as const)[Math.floor(Math.random() * 3)],
      status: "Pending",
      created_at: new Date().toISOString(),
    });
  }
  return out;
}
