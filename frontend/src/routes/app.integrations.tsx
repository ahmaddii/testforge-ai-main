import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Link2, Github, Bell, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PaywallOverlay } from "@/components/paywall-overlay";
import { Webhook as WebhookIcon } from "lucide-react";

export const Route = createFileRoute("/app/integrations")({
  component: IntegrationsPage,
  head: () => ({ meta: [{ title: "Integrations — Speclane" }] }),
});

function IntegrationsPage() {
  const { projects, fetchData, user, billing } = useApp();
  const [isSlackDialogOpen, setIsSlackDialogOpen] = useState(false);
  const [isGithubDialogOpen, setIsGithubDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState("");
  
  // GitHub Agent States
  const [githubRepoOwner, setGithubRepoOwner] = useState("");
  const [githubRepoName, setGithubRepoName] = useState("");
  const [githubPullNumber, setGithubPullNumber] = useState("");
  const [isTriggeringAgent, setIsTriggeringAgent] = useState(false);
  const [isSettingUpWebhook, setIsSettingUpWebhook] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    if (isGithubDialogOpen && selectedProjectId) {
      fetchRuns();
    }
  }, [isGithubDialogOpen, selectedProjectId]);

  const fetchRuns = async () => {
    setIsLoadingRuns(true);
    try {
      const res = await api.get(`/github-agent/runs/${selectedProjectId}`);
      setRuns(res.data || []);
    } catch (err) {
      console.error(err);
      setRuns([]);
    } finally {
      setIsLoadingRuns(false);
    }
  };

  const handleOpenSlack = () => {
    setIsSlackDialogOpen(true);
  };

  const handleOpenGithub = () => {
    setIsGithubDialogOpen(true);
  };

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find(x => x.id === id);
    setWebhookUrl(p?.slack_webhook_url || "");
    
    // Attempt to parse existing repo_url for GitHub Agent
    if (p?.repo_url) {
      try {
        const url = new URL(p.repo_url);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          setGithubRepoOwner(parts[0]);
          setGithubRepoName(parts[1].replace('.git', ''));
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const triggerGithubAgent = async () => {
    if (!selectedProjectId) return toast.error("Please select a project");
    if (!githubRepoOwner || !githubRepoName || !githubPullNumber) return toast.error("Please fill in all GitHub details");
    
    setIsTriggeringAgent(true);
    try {
      await api.post(`/github-agent/run`, {
        projectId: selectedProjectId,
        owner: githubRepoOwner,
        repo: githubRepoName,
        pullNumber: githubPullNumber
      });
      toast.success("GitHub Agent completed successfully! Check your PR for comments.");
      fetchRuns();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to run GitHub Agent");
    } finally {
      setIsTriggeringAgent(false);
    }
  };

  const handleConnectGithub = () => {
    if (!selectedProjectId) return toast.error("Please select a project first");
    window.location.href = `http://localhost:3001/api/github-agent/oauth/connect?projectId=${selectedProjectId}`;
  };

  const setupWebhook = async () => {
    if (!selectedProjectId || !githubRepoOwner || !githubRepoName) {
      return toast.error("Please select a project and fill in Repo Owner/Name");
    }
    setIsSettingUpWebhook(true);
    try {
      await api.post('/github-agent/setup-webhook', {
        projectId: selectedProjectId,
        owner: githubRepoOwner,
        repo: githubRepoName
      });
      toast.success("GitHub Webhook installed successfully! Automated PR processing is now active.");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to setup webhook");
    } finally {
      setIsSettingUpWebhook(false);
    }
  };

  const saveSlackConfig = async () => {
    if (!selectedProjectId) return toast.error("Please select a project");
    setIsSaving(true);
    try {
      await api.patch(`/projects/${selectedProjectId}`, {
        slack_webhook_url: webhookUrl
      });
      await fetchData();
      toast.success("Slack integration updated");
      setIsSlackDialogOpen(false);
    } catch (err: any) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };
  const hasSlack = projects.some(p => p.slack_webhook_url);

  const integrations = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect repositories to analyze code and generate test cases.',
      icon: <img src="/integrations/github.png" alt="GitHub" className="h-8 w-8 object-contain" onError={(e) => (e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/25/25231.png')} />,
      status: 'Active',
      statusColor: 'text-green-500 bg-green-500/10 border-green-500/20',
      action: 'Configure'
    },
    {
      id: 'jira',
      name: 'Jira / Linear',
      description: 'Sync tickets and requirements directly into your workspace.',
      icon: <img src="/integrations/jira.png" alt="Jira" className="h-8 w-8 object-contain" />,
      status: 'Coming Soon',
      statusColor: 'text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
      action: 'Connect'
    },
    {
      id: 'slack',
      name: 'Slack Alerts',
      description: 'Send real-time QA notifications to your team channels.',
      icon: <img src="/integrations/slack.png" alt="Slack" className="h-8 w-8 object-contain" />,
      status: hasSlack ? 'Active' : 'Not Connected',
      statusColor: hasSlack 
        ? 'text-green-500 bg-green-500/10 border-green-500/20' 
        : 'text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
      action: hasSlack ? 'Configure' : 'Connect'
    },
    {
      id: 'webhooks',
      name: 'Webhooks',
      description: 'Custom outbound triggers for your CI/CD pipelines.',
      icon: <img src="/integrations/webhook.png" alt="Webhook" className="h-8 w-8 object-contain" />,
      status: 'Coming Soon',
      statusColor: 'text-slate-400 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10',
      action: 'Manage'
    }
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-6xl relative min-h-[calc(100vh-80px)]">
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-2">Integrations</h1>
        <p className="text-slate-500 dark:text-white/50 text-sm md:text-base max-w-2xl">
          Connect your favorite development and collaboration tools to build a seamless QA workflow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 relative z-10">
        {integrations.map((item) => (
          <Card key={item.id} className="group relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] shadow-none hover:border-primary/40 transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-500">
                  {item.icon}
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${item.statusColor}`}>
                  {item.status === 'Active' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.status}</span>
                </div>
              </div>
              <CardTitle className="text-xl font-bold mt-4">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-white/50 leading-relaxed min-h-[40px]">
                {item.description}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
                  {item.id === 'slack' && projects.some(p => p.slack_webhook_url) ? 'ACTIVE' : 
                   item.id === 'github' ? 'ACTIVE' : 'NOT CONNECTED'}
                </span>
                <Button 
                  variant={item.status === 'Active' || (item.id === 'slack') ? "secondary" : "outline"} 
                  size="sm" 
                  disabled={item.status === 'Coming Soon' && item.id !== 'slack'}
                  onClick={item.id === 'slack' ? handleOpenSlack : item.id === 'github' ? handleOpenGithub : undefined}
                  className={`rounded-full px-6 font-semibold ${item.status === 'Active' || item.id === 'slack' ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'border-slate-200 dark:border-white/10'}`}
                >
                  {item.id === 'slack' ? (projects.some(p => p.slack_webhook_url) ? 'Configure' : 'Connect') : item.action}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Slack Config Dialog */}
      <Dialog open={isSlackDialogOpen} onOpenChange={setIsSlackDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <img src="/integrations/slack.png" alt="Slack" className="h-8 w-8 object-contain mr-1" /> Slack Configuration
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-white/50">
              Follow the guide below to get your Incoming Webhook URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Guide Section */}
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-white">?</span>
                How to get your Webhook URL:
              </h4>
              <ul className="space-y-3">
                {[
                  "Go to the <a href='https://api.slack.com/apps' target='_blank' class='text-primary underline'>Slack API page</a> and click 'Create New App'.",
                  "Choose 'From scratch', name it 'Speclane Alerts', and select your workspace.",
                  "In the sidebar, open 'Incoming Webhooks' and turn the switch to 'ON'.",
                  "Click 'Add New Webhook to Workspace' and select your target channel.",
                  "Copy the generated Webhook URL and paste it below."
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                    <span className="font-bold text-primary">{i + 1}.</span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Target Project</Label>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl h-11">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 rounded-xl">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-primary/10">
                      {p.name} {p.slack_webhook_url ? "✅" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600 dark:text-white/70">Slack Webhook URL</Label>
              <Input 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 rounded-xl"
              />
              <p className="text-[10px] text-slate-400 dark:text-white/30">
                You can find this in your Slack App settings under "Incoming Webhooks".
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSlackDialogOpen(false)} className="rounded-full">Cancel</Button>
            <Button 
              onClick={saveSlackConfig} 
              disabled={isSaving || !selectedProjectId}
              className="gradient-bg text-primary-foreground rounded-full shadow-none px-8"
            >
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GitHub Config Dialog */}
      <Dialog open={isGithubDialogOpen} onOpenChange={setIsGithubDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white sm:rounded-3xl shadow-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <img src="/integrations/github.png" alt="GitHub" className="h-8 w-8 object-contain mr-1" /> GitHub Agent Configuration
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-white/50">
              Configure the AI Agent to watch for PRs, auto-generate test cases, and fix broken locators.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Target Project</Label>
              <Select value={selectedProjectId} onValueChange={handleProjectChange}>
                <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl h-11">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 rounded-xl">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id} className="focus:bg-primary/10">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-600 dark:text-white/70">Repo Owner</Label>
                <Input 
                  value={githubRepoOwner}
                  onChange={(e) => setGithubRepoOwner(e.target.value)}
                  placeholder="e.g. ahmaddii"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-600 dark:text-white/70">Repo Name</Label>
                <Input 
                  value={githubRepoName}
                  onChange={(e) => setGithubRepoName(e.target.value)}
                  placeholder="e.g. test-repo"
                  className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-600 dark:text-white/70">Pull Request Number (For Testing)</Label>
              <Input 
                type="number"
                value={githubPullNumber}
                onChange={(e) => setGithubPullNumber(e.target.value)}
                placeholder="e.g. 1"
                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 h-11 rounded-xl"
              />
              <p className="text-[10px] text-slate-400 dark:text-white/30">
                Enter an open Pull Request number to test the end-to-end agent workflow right now.
              </p>
            </div>

            {/* Recent Runs Section */}
            {selectedProjectId && (
              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10 mt-4">
                <Label className="text-sm font-semibold flex items-center justify-between">
                  Recent Automated PR Checks
                  <Button variant="ghost" size="sm" onClick={fetchRuns} disabled={isLoadingRuns} className="h-6 text-xs text-primary">
                    {isLoadingRuns ? "Refreshing..." : "Refresh"}
                  </Button>
                </Label>
                
                {runs.length === 0 ? (
                  <div className="text-sm text-slate-500 dark:text-white/40 text-center py-6 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
                    No runs found. Trigger a manual test or open a PR to see activity here!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {runs.map((run: any) => (
                      <div key={run.id} className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${run.status === 'Completed' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span className="text-sm font-bold">PR #{run.pull_request_number}</span>
                            <span className="text-xs text-slate-500 dark:text-white/40">{run.repo_name}</span>
                          </div>
                          <span className="text-xs text-slate-400 dark:text-white/30">
                            {new Date(run.created_at).toLocaleString()}
                          </span>
                        </div>
                        {run.status === 'Completed' && (
                          <div className="flex gap-4 text-xs font-medium text-slate-600 dark:text-white/60">
                            <span className="text-green-600 dark:text-green-400">{run.tests_passed} Passed</span>
                            {run.tests_fixed > 0 && <span className="text-yellow-600 dark:text-yellow-400">{run.tests_fixed} Auto-Fixed</span>}
                            {run.bugs_found > 0 && <span className="text-red-600 dark:text-red-400">{run.bugs_found} Bugs Found</span>}
                          </div>
                        )}
                        {run.status === 'Failed' && (
                          <span className="text-xs text-red-500">Pipeline Failed</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row flex-wrap sm:justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setIsGithubDialogOpen(false)} className="rounded-full">Cancel</Button>
            
            <Button 
              onClick={handleConnectGithub} 
              variant="outline"
              disabled={!selectedProjectId}
              className="rounded-full flex items-center gap-2 border-slate-200 dark:border-white/10"
            >
              <Github className="w-4 h-4" />
              1. Connect GitHub (OAuth)
            </Button>
            
            <Button 
              onClick={setupWebhook} 
              variant="outline"
              disabled={isSettingUpWebhook || !selectedProjectId}
              className="rounded-full flex items-center gap-2 border-slate-200 dark:border-white/10"
            >
              <Webhook className="w-4 h-4" />
              {isSettingUpWebhook ? "Setting up..." : "2. Install Webhook"}
            </Button>

            <Button 
              onClick={triggerGithubAgent} 
              disabled={isTriggeringAgent || !selectedProjectId}
              className="gradient-bg text-primary-foreground rounded-full shadow-none px-6 flex items-center gap-2"
            >
              {isTriggeringAgent ? "Running Agent..." : "3. Manual Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suggestion Card */}
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center bg-slate-50/50 dark:bg-white/[0.02] relative z-10 overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 relative z-10">Missing an integration?</h3>
        <p className="text-sm text-slate-500 dark:text-white/50 mb-6 relative z-10">Let us know which tools your team uses and we'll prioritize building them.</p>
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary hover:bg-primary/10 rounded-full font-bold relative z-10"
          onClick={() => {
            const subject = encodeURIComponent(`Integration Request from ${user?.name || user?.email}`);
            const body = encodeURIComponent(`Hello Speclane Team,\n\n I would like to request a new integration for:\n\nTool Name: \nUse Case: \n\nRegards,\n${user?.name || user?.email}`);
            window.location.href = `mailto:pulsarx.inc@gmail.com?subject=${subject}&body=${body}`;
          }}
        >
          Request integration
        </Button>
      </div>
    </div>
  );
}
