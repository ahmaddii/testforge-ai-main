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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenSlack = () => {
    setIsSlackDialogOpen(true);
  };

  const handleProjectChange = (id: string) => {
    setSelectedProjectId(id);
    const p = projects.find(x => x.id === id);
    setWebhookUrl(p?.slack_webhook_url || "");
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
                  {item.id === 'slack' && projects.some(p => p.slack_webhook_url) ? 'ACTIVE' : 'NOT CONNECTED'}
                </span>
                <Button
                  variant={item.status === 'Active' || (item.id === 'slack') ? "secondary" : "outline"}
                  size="sm"
                  disabled={item.status === 'Coming Soon' && item.id !== 'slack'}
                  onClick={item.id === 'slack' ? handleOpenSlack : undefined}
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
