import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Github, Loader2, Trash2, RefreshCw } from "lucide-react";
import { GeminiIcon } from "@/components/gemini-icon";
import { useApp } from "@/lib/store";
import { PageSkeleton } from "@/components/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/projects/$projectId")({
  component: ProjectDetail,
  head: () => ({ meta: [{ title: "Project — Speclane" }] }),
});

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const { projects, testCases, requirements, fetchData, loading } = useApp();
  const project = projects.find((p) => p.id === projectId);

  const [repo, setRepo] = useState(project?.repo_url || "");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [running, setRunning] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchFiles = async (customRepoUrl?: string) => {
    const targetUrl = customRepoUrl || repo || project?.repo_url;
    if (!targetUrl) return;
    setLoadingFiles(true);
    try {
      const data = await api.get(`/projects/${projectId}/files`);
      const fileList = Array.isArray(data) ? data : [];
      setFiles(fileList);
    } catch (err: any) {
      console.error("Failed to fetch files", err);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (project?.repo_url) {
      setRepo(project.repo_url);
      fetchFiles(project.repo_url);
    } else {
      // If project is not yet cached in store, fetch it directly
      api.get(`/projects/${projectId}`).then((p: any) => {
        if (p?.repo_url) {
          setRepo(p.repo_url);
          fetchFiles(p.repo_url);
        }
      }).catch(() => {});
    }
  }, [projectId, project?.repo_url]);

  if (!project) {
    return (
      <div className="container mx-auto p-6 max-w-3xl text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/app/projects"><Button variant="outline" className="mt-4">Back to projects</Button></Link>
      </div>
    );
  }

  const projectTests = testCases.filter((t) => t.project_id === projectId);
  const projectReqs = requirements.filter((r) => r.project_id === projectId);

  const analyze = async () => {
    if (!repo) return toast.error("Add a repository URL");
    setRunning(true);
    setPhase("Preparing analysis...");
    setProgress(10);

    try {
      // 1. Update repo URL if changed
      if (repo !== project.repo_url) {
        await api.patch(`/projects/${projectId}`, { repo_url: repo });
      }

      setPhase("Orchestrating AI generation...");
      setProgress(40);

      // 2. Call Generation API
      await api.post('/generate', { project_id: projectId });

      setProgress(90);
      setPhase("Finalizing...");

      // 3. Refresh data
      await fetchData();
      await fetchFiles();

      toast.success("AI analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setRunning(false);
      setProgress(0);
      setPhase("");
    }
  };

  const remove = async () => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      await fetchData();
      navigate({ to: "/app/projects" });
      toast.success("Project deleted");
    } catch (err: any) {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <Link to="/app/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" /> All projects
      </Link>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge className={project.status === "Completed" ? "bg-success/15 text-success" : project.status === "Analyzing" ? "bg-warning/15 text-warning" : "bg-muted"}>{project.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{project.description || "No description"}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </div>

      <Card className="border-border shadow-card">
        <CardHeader><CardTitle className="text-base">Repository</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/org/repo" className="pl-9" />
            </div>
            <Button onClick={analyze} disabled={running} className="gradient-bg text-primary-foreground shadow-none">
              {running ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GeminiIcon className="mr-2 h-4 w-4 object-contain" />}
              {running ? "Analyzing…" : "Analyze repository"}
            </Button>
          </div>
          {running && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{phase}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border shadow-card">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Test Cases</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{projectTests.length}</div></CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Requirements</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{projectReqs.length}</div></CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Last analyzed</CardTitle></CardHeader>
          <CardContent><div className="text-sm">{project.last_analyzed ? new Date(project.last_analyzed).toLocaleString() : "Never"}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-card">
          <CardHeader><CardTitle className="text-base">Recent test cases</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {projectTests.slice(0, 6).map((t) => (
                <div key={t.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{t.module} · {t.type}</div>
                  </div>
                  <Badge variant="outline">{t.priority}</Badge>
                </div>
              ))}
              {projectTests.length === 0 && <p className="text-sm text-muted-foreground py-3">No test cases yet — analyze the repository to generate some.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Repository Files</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">{files.length} items</Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-muted/80" 
                onClick={async () => {
                  await fetchFiles();
                  toast.success("Repository files synced");
                }} 
                disabled={loadingFiles}
                title="Sync Repository Files"
              >
                <RefreshCw className={`h-4 w-4 ${loadingFiles ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {loadingFiles ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : files.length > 0 ? (
                files.map((file) => (
                  <div key={file.path} className="flex items-center gap-2 text-sm py-1.5 hover:bg-muted/50 px-2 rounded-md transition-colors group">
                    <span className={file.type === 'dir' ? "text-primary/70" : "text-muted-foreground"}>
                      {file.type === 'dir' ? '📁' : '📄'}
                    </span>
                    <span className="truncate flex-1 font-mono text-[13px]">{file.path}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">No files synced. Check your repository URL.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
