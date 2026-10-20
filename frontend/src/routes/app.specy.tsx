import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  FolderKanban,
  Bug,
  Play,
  Search,
  ShieldCheck,
  LoaderCircle,
  RefreshCw,
  FileText,
  FlaskConical,
  Layers,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Plus,
  ArrowLeft,
  Check,
  UploadCloud,
  Copy,
  LogOut,
  Paperclip,
  Globe,
  Trash2,
  X,
} from "lucide-react";
import { api, API_BASE, getHeaders } from "@/lib/api";
import { useApp } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import GrayAgent from "./Gray-agent";

export const Route = createFileRoute("/app/specy")({
  component: SpecyPage,
});

export type SpecySource = {
  id: string;
  title: string;
  source_type:
    | "requirement"
    | "test_case"
    | "test_plan"
    | "defect"
    | "execution_run"
    | string;
  similarity: number;
  project_id?: string | null;
  snippet?: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: SpecySource[];
  model_used?: string | null;
  isError?: boolean;
  rawInput?: string;
  execution_run?: any;
};

type HistorySession = {
  id: string;
  title: string;
  updated_at?: string;
  created_at?: string;
  project_id?: string | null;
  messages?: Message[];
};

const defaultStarterPrompts = [
  {
    title: "Run all pending test cases",
    description: "Run pending tests in the configured environment",
    prompt: "Run all pending test cases for the current project",
    icon: Play,
  },
  {
    title: "Investigate test failures",
    description: "Trace recent failures to execution logs and related project data",
    prompt: "Why are my tests failing?",
    icon: Bug,
  },
  {
    title: "Generate test cases",
    description: "Create positive, negative, and edge cases from project requirements",
    prompt:
      "Generate test cases for the current project's requirements, including positive, negative, and edge cases.",
    icon: Search,
  },
  {
    title: "Find coverage gaps",
    description: "Find project requirements and edge cases that lack test coverage",
    prompt:
      "Review test coverage for the current project and identify requirements or edge cases without enough coverage.",
    icon: FolderKanban,
  },
];

const ACTIVE_SPECY_SESSION_KEY = "speclane_specy_active_session";

function getSourceConfig(sourceType: string) {
  switch (sourceType) {
    case "requirement":
      return {
        label: "Requirement",
        icon: FileText,
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        href: "/app/requirements" as const,
      };
    case "test_case":
      return {
        label: "Test Case",
        icon: FlaskConical,
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        href: "/app/test-cases" as const,
      };
    case "test_plan":
      return {
        label: "Test Plan",
        icon: Layers,
        badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        href: "/app/test-plans" as const,
      };
    case "defect":
      return {
        label: "Defect",
        icon: Bug,
        badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        href: "/app/defects" as const,
      };
    case "execution_run":
      return {
        label: "Execution Run",
        icon: Play,
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        href: "/app/executed-tests" as const,
      };
    default:
      return {
        label: sourceType,
        icon: ShieldCheck,
        badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
        href: "/app/specy" as const,
      };
  }
}

function SpecyLogoGlyph({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 4.2L3.2 19.5h17.6L12 4.2z" />
    </svg>
  );
}

function SpecyPage() {
  const navigate = useNavigate();
  const user = useApp((s) => s.user);
  const projects = useApp((s) => s.projects);
  const requirements = useApp((s) => s.requirements);
  const testCases = useApp((s) => s.testCases);
  const testPlans = useApp((s) => s.testPlans);
  const defects = useApp((s) => s.defects);
  const executionRuns = useApp((s) => s.executionRuns);
  const workspaceLoading = useApp((s) => s.loading);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [executionProgress, setExecutionProgress] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  // Layout & session controls
  const [toolsOpen, setToolsOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<string>("");
  const [chatHistories, setChatHistories] = useState<HistorySession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const isPageLoading = isLoadingHistory || workspaceLoading;

  // QA tools toggle
  const [qaTools, setQaTools] = useState({
    playwrightRunner: true,
    defectInvestigator: true,
    ragGrounding: true,
  });

  // Modals
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionSaveQueue = useRef<Map<string, Promise<void>>>(new Map());

  // Load chat sessions from backend DB on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSessions() {
      setIsLoadingHistory(true);
      try {
        const res: any = await api.get("/specy-agent/sessions");
        if (isMounted && res?.sessions && Array.isArray(res.sessions)) {
          setChatHistories(res.sessions);
          try {
            localStorage.setItem("speclane_specy_history", JSON.stringify(res.sessions));
          } catch (_) {}
          const savedActiveId = localStorage.getItem(ACTIVE_SPECY_SESSION_KEY);
          const activeSession = res.sessions.find((session: HistorySession) => session.id === savedActiveId);
          if (activeSession) {
            const fullSession: any = await api.get(`/specy-agent/sessions/${activeSession.id}`);
            if (isMounted && fullSession?.session) {
              setActiveHistoryId(activeSession.id);
              setMessages(Array.isArray(fullSession.session.messages) ? fullSession.session.messages : []);
              if (fullSession.session.project_id) setSelectedProjectId(fullSession.session.project_id);
            }
          }
          return;
        }
      } catch (err) {
        console.warn("Falling back to local storage sessions:", err);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }

      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("speclane_specy_history");
        if (stored && isMounted) {
          const sessions = JSON.parse(stored) as HistorySession[];
          setChatHistories(sessions);
          const savedActiveId = localStorage.getItem(ACTIVE_SPECY_SESSION_KEY);
          const activeSession = sessions.find((session) => session.id === savedActiveId);
          if (activeSession?.messages) {
            setActiveHistoryId(activeSession.id);
            setMessages(activeSession.messages);
            if (activeSession.project_id) setSelectedProjectId(activeSession.project_id);
          }
        }
      } catch (_) {}
    }

    loadSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, executionProgress, loading]);

  function toggleSources(idx: number) {
    setExpandedSources((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  }

  function startNewChat() {
    setMessages([]);
    setInput("");
    setActiveHistoryId("");
    localStorage.removeItem(ACTIVE_SPECY_SESSION_KEY);
    textareaRef.current?.focus();
  }

  // Load full session from backend DB
  async function selectHistory(item: HistorySession) {
    if (activeHistoryId === item.id) return;
    setActiveHistoryId(item.id);
    localStorage.setItem(ACTIVE_SPECY_SESSION_KEY, item.id);

    // If session already has cached messages in state
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
      if (item.project_id) setSelectedProjectId(item.project_id);
      return;
    }

    try {
      const res: any = await api.get(`/specy-agent/sessions/${item.id}`);
      if (res?.session?.messages) {
        setMessages(res.session.messages);
        if (res.session.project_id) {
          setSelectedProjectId(res.session.project_id);
        }
        // Update local memory cache with full messages
        setChatHistories((prev) =>
          prev.map((h) => (h.id === item.id ? { ...h, messages: res.session.messages } : h))
        );
      }
    } catch (err) {
      console.error("Failed to load session:", err);
      toast.error("Could not load chat messages from server");
    }
  }

  // Delete chat session from backend DB and UI
  async function deleteHistory(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    // Optimistically remove from state
    setChatHistories((prev) => prev.filter((h) => h.id !== id));
    if (activeHistoryId === id) {
      startNewChat();
    }
    try {
      await api.delete(`/specy-agent/sessions/${id}`);
      // Update local storage cache
      try {
        const stored = localStorage.getItem("speclane_specy_history");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            "speclane_specy_history",
            JSON.stringify(parsed.filter((s: any) => s.id !== id))
          );
        }
      } catch (_) {}
      toast.success("Chat deleted from history");
    } catch (err) {
      console.error("Failed to delete chat session:", err);
      toast.error("Failed to delete chat from database");
    }
  }

  // Save conversation session to backend DB
  async function persistSession(sessionId: string, title: string, updatedMessages: Message[]) {
    try {
      const stored = JSON.parse(localStorage.getItem("speclane_specy_history") || "[]") as HistorySession[];
      const cachedSession: HistorySession = {
        ...(stored.find((session) => session.id === sessionId) || {}),
        id: sessionId,
        title,
        messages: updatedMessages,
        project_id: selectedProjectId === "all" ? null : selectedProjectId,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(
        "speclane_specy_history",
        JSON.stringify([cachedSession, ...stored.filter((session) => session.id !== sessionId)]),
      );
    } catch (err) {
      console.warn("Failed to update local Specy chat cache:", err);
    }

    const previousSave = sessionSaveQueue.current.get(sessionId) || Promise.resolve();
    const nextSave = previousSave.catch(() => {}).then(async () => {
      try {
        await api.post("/specy-agent/sessions", {
          id: sessionId,
          title,
          messages: updatedMessages,
          project_id: selectedProjectId === "all" ? null : selectedProjectId,
        });
      } catch (err) {
        console.warn("Failed to persist session to database:", err);
      }
    });
    sessionSaveQueue.current.set(sessionId, nextSave);
    await nextSave;
  }

  async function handleSync() {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const payload = {
        project_id: selectedProjectId === "all" ? null : selectedProjectId,
      };
      const res: any = await api.post("/specy-rag/sync", payload);
      const stats = res?.stats;
      const count = (stats?.inserted ?? 0) + (stats?.updated ?? 0);
      toast.success(
        res?.message ||
          `Knowledge base synchronized (${count} records indexed, ${stats?.unchanged ?? 0} unchanged).`,
      );
    } catch (err: any) {
      console.error("Knowledge base sync error:", err);
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to synchronize knowledge base.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  async function sendMessage(text = input) {
    const message = text.trim();
    if (!message || loading) return;

    const userMsg: Message = { role: "user", content: message };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const sessionId = activeHistoryId || `specy-${Date.now()}`;
    localStorage.setItem(ACTIVE_SPECY_SESSION_KEY, sessionId);
    const sessionTitle =
      chatHistories.find((h) => h.id === sessionId)?.title ||
      (message.length > 34 ? `${message.substring(0, 32)}…` : message);

    if (!activeHistoryId) {
      setActiveHistoryId(sessionId);
    }

    // Optimistically update sidebar
    setChatHistories((prev) => {
      const exists = prev.find((h) => h.id === sessionId);
      if (exists) {
        return prev.map((h) =>
          h.id === sessionId ? { ...h, messages: newMessages, updated_at: new Date().toISOString() } : h
        );
      }
      return [
        {
          id: sessionId,
          title: sessionTitle,
          updated_at: new Date().toISOString(),
          messages: newMessages,
          project_id: selectedProjectId === "all" ? null : selectedProjectId,
        },
        ...prev,
      ];
    });

    // Save initial user message to DB
    void persistSession(sessionId, sessionTitle, newMessages);

    const isExecution = qaTools.playwrightRunner &&
      /\b(run|execute|trigger|start|launch|test)\b/i.test(message) &&
      /\b(pending|tests|test cases|all cases|suite|smoke tests)\b/i.test(message) &&
      !/\b(do not|don't|never|without|stop|no|avoid)\s+(run|execute|trigger|start|launch|test)\b/i.test(message);

    if (isExecution) {
      setExecutionProgress("Initializing Playwright test runner...");
    }

    try {
      const payload: Record<string, any> = {
        message,
        qa_tools: {
          playwright_runner: qaTools.playwrightRunner,
          defect_investigator: qaTools.defectInvestigator,
          rag_grounding: qaTools.ragGrounding,
        },
      };
      if (selectedProjectId && selectedProjectId !== "all") {
        payload.project_id = selectedProjectId;
      }

      if (isExecution) {
          const headers = await getHeaders();
          const response = await fetch(`${API_BASE}/specy-agent/chat?stream=true`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });

          if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.error || `Execution request failed (${response.status}).`);
          }
          {
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let finalReply = "";
            let finalRun: any = null;
            let finalSources: any[] = [];

            if (reader) {
              let buffer = "";
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split("\n\n");
                buffer = lines.pop() || "";

                for (const block of lines) {
                  const line = block.trim();
                  if (line.startsWith("data: ")) {
                    try {
                      const event = JSON.parse(line.replace("data: ", ""));
                      if (
                        event.type === "init" ||
                        event.type === "progress" ||
                        event.type === "step" ||
                        event.type === "case_start" ||
                        event.type === "case_complete"
                      ) {
                        setExecutionProgress(event.message);
                      } else if (event.type === "complete") {
                        finalReply = event.reply;
                        finalRun = event.execution_run;
                        finalSources = event.sources || [];
                        setExecutionProgress(null);
                      } else if (event.type === "error") {
                        throw new Error(event.error);
                      }
                    } catch (e: any) {
                      if (e.message && !line.includes("complete")) {
                        throw e;
                      }
                    }
                  }
                }
              }
            }

            if (finalReply) {
              const assistantMsg: Message = {
                role: "assistant",
                content: finalReply,
                sources: finalSources,
                execution_run: finalRun,
              };
              const completedMessages = [...newMessages, assistantMsg];
              setMessages(completedMessages);
              void persistSession(sessionId, sessionTitle, completedMessages);
              useApp.getState().fetchData();
              return;
            }
            throw new Error("Playwright execution stream ended before it returned results.");
          }
      }

      // Standard chat streams user-facing work updates while RAG and the model run.
      const chatHeaders = await getHeaders();
      const chatResponse = await fetch(`${API_BASE}/specy-agent/chat?stream=true`, {
        method: "POST",
        headers: chatHeaders,
        body: JSON.stringify(payload),
      });
      let result: any;
      if (chatResponse.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = chatResponse.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedResult: any = null;
        if (reader) {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split("\n\n");
            buffer = blocks.pop() || "";
            for (const block of blocks) {
              const dataLine = block.split("\n").find((line) => line.startsWith("data: "));
              if (!dataLine) continue;
              const event = JSON.parse(dataLine.slice(6));
              if (event.type === "progress") setExecutionProgress(event.message);
              else if (event.type === "complete") streamedResult = event;
              else if (event.type === "error") throw new Error(event.error || "Specy could not complete this request.");
            }
          }
        }
        if (!streamedResult) throw new Error("Specy’s response stream ended before an answer arrived.");
        result = streamedResult;
        setExecutionProgress(null);
      } else {
        result = await chatResponse.json().catch(() => null);
        if (!chatResponse.ok) throw new Error(result?.error || `Chat request failed (${chatResponse.status}).`);
      }

      const reply =
        result?.reply ??
        result?.text ??
        result?.message ??
        "The agent returned no response.";

      const assistantMsg: Message = {
        role: "assistant",
        content: String(reply),
        sources: Array.isArray(result?.sources) ? result.sources : [],
        model_used: result?.model_used || null,
        execution_run: result?.execution_run || null,
      };

      const completedMessages = [...newMessages, assistantMsg];
      setMessages(completedMessages);
      void persistSession(sessionId, sessionTitle, completedMessages);

      if (result?.execution_run) {
        useApp.getState().fetchData();
      }
    } catch (error: any) {
      const detail =
        error?.response?.data?.error ||
        error?.message ||
        "Unknown connection error";

      const errorMsg: Message = {
        role: "assistant",
        content: isExecution
          ? `### Playwright execution could not complete\n\n${detail}`
          : `I encountered an issue reaching the Specy agent service.\n\nDetails: ${detail}`,
        isError: true,
        rawInput: message,
      };
      const failedMessages = [...newMessages, errorMsg];
      setMessages(failedMessages);
      void persistSession(sessionId, sessionTitle, failedMessages);
    } finally {
      setLoading(false);
      setExecutionProgress(null);
    }
  }

  function copyText(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-[#14120B] text-zinc-100 font-sans">
      {/* 1. CLEAN SIDEBAR (Only History + Trash/Recycle in front + New Chat + User) */}
      <aside className="w-[260px] flex-shrink-0 bg-[#14120B] border-r border-white/[0.08] flex flex-col justify-between p-3 z-20">
        <div className="flex flex-col gap-3 min-h-0 flex-1">
          {/* Brand header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center text-white">
                <SpecyLogoGlyph className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-white">
                Specy
              </span>
              <span className="text-[10px] text-zinc-400 font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                QA Agent
              </span>
            </div>

            <Link
              to="/app"
              title="Return to Workspace"
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={startNewChat}
            variant="outline"
            className="w-full justify-start gap-2 h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-medium text-white shadow-none transition-all"
          >
            <Plus className="w-4 h-4 text-zinc-300" />
            <span>New chat</span>
          </Button>

          {/* Chat History List with Recycle/Trash icon in front */}
          <div className="flex-1 overflow-y-auto mt-1 pr-1 space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Recent Chats
              </span>
              {isLoadingHistory && (
                <LoaderCircle className="w-3 h-3 text-zinc-500 animate-spin" />
              )}
            </div>

            {isPageLoading ? (
              <div className="space-y-2 px-1 py-2" aria-label="Loading chat history">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={`history-skeleton-${index}`} className="flex items-center gap-2 px-2 py-1.5">
                    <Skeleton className="h-5 w-5 rounded-md bg-white/[0.06]" />
                    <Skeleton className={`h-3 bg-white/[0.06] ${index % 2 ? "w-3/4" : "w-5/6"}`} />
                  </div>
                ))}
              </div>
            ) : chatHistories.length === 0 ? (
              <div className="px-2 py-6 text-xs text-zinc-500 text-center">
                No saved chats yet
              </div>
            ) : (
              chatHistories.map((hist) => {
                const isActive = activeHistoryId === hist.id;
                return (
                  <div
                    key={hist.id}
                    onClick={() => selectHistory(hist)}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? "bg-zinc-800 text-white font-medium border border-white/10 shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                  >
                    {/* Recycle / Trash Icon in front */}
                    <button
                      type="button"
                      onClick={(e) => deleteHistory(hist.id, e)}
                      title="Delete chat from history"
                      className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="truncate flex-1" title={hist.title}>
                      {hist.title}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-1.5">
          {/* Back to Workspace button */}
          <Link
            to="/app"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workspace</span>
          </Link>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-zinc-200 truncate">
                      {user?.name || "QA Engineer"}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                      {user?.email || "workspace@speclane.com"}
                    </div>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              className="w-52 bg-[#1A1810] border-white/10 text-zinc-200 rounded-xl shadow-2xl p-1"
            >
              <DropdownMenuItem
                onClick={() => navigate({ to: "/app" })}
                className="text-xs text-zinc-300 hover:text-white cursor-pointer rounded-lg"
              >
                Back to Workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/app/executed-tests" })}
                className="text-xs text-zinc-300 hover:text-white cursor-pointer rounded-lg"
              >
                Executed Tests
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: "/app/settings" })}
                className="text-xs text-zinc-300 hover:text-white cursor-pointer rounded-lg"
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => navigate({ to: "/login" })}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* 2. MAIN CONVERSATION CANVAS */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-[#14120B]">
        {/* Streamlined Top Bar (Zero Overflow) */}
        <header className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06] bg-[#14120B]/90 backdrop-blur-md z-10">
          {/* Left: Project Selector */}
          <div className="flex items-center gap-2 min-w-0">
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
            >
              <SelectTrigger className="h-8 border-white/10 bg-[#1A1810] px-2.5 text-xs text-zinc-200 hover:text-white rounded-xl focus:ring-0 focus:ring-offset-0 gap-2 max-w-[200px]">
                <FolderKanban className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1810] border-white/10 text-zinc-200 rounded-xl">
                <SelectItem value="all">All Accessible Projects</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="hidden sm:inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] text-zinc-400 bg-white/5 border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {qaTools.playwrightRunner ? "Playwright runner on" : "Playwright runner off"}
            </span>
          </div>

          {/* Right: Prominent options */}
          <div className="flex items-center gap-2">
            {/* Sync RAG quick action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-8 gap-1.5 rounded-xl border-white/10 bg-zinc-900/60 text-xs text-zinc-300 hover:text-white hover:bg-white/10 shadow-none px-2.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-zinc-400 ${
                  isSyncing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync RAG"}</span>
            </Button>

            {/* Toggle Tools drawer */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setToolsOpen(!toolsOpen)}
              title="QA Tools & Knowledge Base"
              className={`h-8 w-8 p-0 rounded-xl border-white/10 bg-zinc-900/60 shadow-none transition-colors ${
                toolsOpen
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Button>

            {/* Back to Workspace button */}
            <Link
              to="/app"
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {isPageLoading ? (
            <div className="min-h-full flex flex-col justify-center items-center max-w-2xl mx-auto py-8 space-y-5" aria-label="Loading Specy">
              <Skeleton className="h-14 w-14 rounded-full bg-white/[0.07]" />
              <div className="w-full max-w-md space-y-2 flex flex-col items-center">
                <Skeleton className="h-6 w-64 max-w-full bg-white/[0.07]" />
                <Skeleton className="h-3 w-80 max-w-full bg-white/[0.05]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`prompt-skeleton-${index}`} className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-3.5 space-y-2">
                    <Skeleton className="h-4 w-2/3 bg-white/[0.07]" />
                    <Skeleton className="h-3 w-full bg-white/[0.05]" />
                  </div>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* CLEAN MINIMAL WELCOME STATE */
            <div className="min-h-full flex flex-col justify-center items-center max-w-2xl mx-auto py-8">
              <div className="mb-4 flex items-center justify-center" aria-label="Specy agent">
                <GrayAgent size={56} color="#71717a" eyeColor="#ffffff" active={inputFocused} />
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight text-center">
                How can Specy help you today?
              </h2>

              <p className="text-xs text-zinc-400 text-center max-w-md mt-1.5 leading-relaxed">
                Production-grounded QA intelligence. Ask about requirements, test cases, defects, or run Playwright automation.
              </p>

              {/* 4 Clean Starter Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-6">
                {defaultStarterPrompts.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void sendMessage(item.prompt)}
                      disabled={loading}
                      className="group rounded-xl border border-white/[0.08] bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 p-3.5 transition-all text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 leading-snug">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SEAMLESS CHAT STREAM */
            <div className="max-w-3xl mx-auto space-y-6 pb-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={idx}
                    className={`flex gap-3.5 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-white">
                        <SpecyLogoGlyph className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}

                    <div
                      className={`select-text text-sm leading-relaxed ${
                        isUser
                          ? "bg-zinc-800/80 border border-white/[0.08] text-zinc-100 rounded-2xl px-4 py-2.5 max-w-[85%]"
                          : msg.isError
                          ? "bg-rose-950/20 text-rose-200 border border-rose-500/20 rounded-2xl p-4 max-w-full w-full"
                          : "text-zinc-200 max-w-full flex-1"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="space-y-3">
                          {/* Markdown Response */}
                          <div className="select-text prose prose-invert prose-zinc max-w-none text-sm leading-relaxed [&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_li]:my-1.5 [&_h1]:mt-5 [&_h2]:mt-4 [&_h3]:mt-3 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_th]:border [&_th]:border-white/10 [&_th]:bg-zinc-800/80 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-white/10 [&_td]:px-3 [&_td]:py-2 [&_a]:text-emerald-400 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-emerald-300 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/50 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>

                          {/* Execution run card if triggered */}
                          {msg.execution_run && (
                            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-3 text-xs">
                              <div className="flex items-center justify-between">
                                  <span className={`font-semibold ${((msg.execution_run.failed_count ?? 0) > 0) ? "text-rose-300" : "text-emerald-300"}`}>
                                  Playwright Run {((msg.execution_run.failed_count ?? 0) > 0) ? "Finished with failures" : "Passed"}
                                </span>
                                <Link
                                  to="/app/executed-tests"
                                  className="text-xs text-zinc-400 hover:text-white underline"
                                >
                                  View Executed Tests
                                </Link>
                              </div>
                              <div className="mt-1.5 flex items-center gap-4 text-[11px]">
                                <span className="text-emerald-400">Passed: {msg.execution_run.passed_count ?? 0}</span>
                                <span className={(msg.execution_run.failed_count ?? 0) > 0 ? "text-rose-400" : "text-zinc-500"}>Failed: {msg.execution_run.failed_count ?? 0}</span>
                                <span>Status: {msg.execution_run.status ?? "Completed"}</span>
                              </div>
                            </div>
                          )}

                          {/* Grounded Evidence Sources Accordion */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => toggleSources(idx)}
                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                              >
                                <span className="font-medium">
                                  {msg.sources.length} Grounded References
                                </span>
                                {expandedSources[idx] ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {expandedSources[idx] && (
                                <div className="mt-2 space-y-1.5">
                                  {msg.sources.slice(0, expandedSources[idx] ? undefined : 3).map((src, sIdx) => {
                                    const cfg = getSourceConfig(src.source_type);
                                    const Icon = cfg.icon;
                                    return (
                                      <Link
                                        key={sIdx}
                                        to={cfg.href}
                                        className="block rounded-lg border border-white/[0.06] bg-zinc-900/40 p-2 text-xs transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/80"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 font-medium text-zinc-300 truncate">
                                            <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                            <span className="truncate">
                                              {cfg.label}: {src.title}
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-zinc-500 font-mono">
                                            {Math.round(src.similarity * 100)}%
                                          </span>
                                        </div>
                                        {src.snippet && (
                                          <p className="mt-1 text-[11px] text-zinc-400 line-clamp-2">
                                            {src.snippet}
                                          </p>
                                        )}
                                      </Link>
                                    );
                                  })}
                                  {msg.sources.length > 3 && (
                                    <button type="button" onClick={() => toggleSources(idx)} className="text-[11px] text-emerald-400 hover:text-emerald-300">
                                      {expandedSources[idx] ? "Show fewer references" : `Show ${msg.sources.length - 3} more references`}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions: Copy */}
                          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                            <span className="text-[11px]">
                              {msg.model_used ? `Model: ${msg.model_used}` : "Specy QA"}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyText(msg.content, idx)}
                              className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              <span>{copiedIndex === idx ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Streaming Playwright Progress */}
              {loading && executionProgress && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/15 bg-zinc-900/70 p-3.5 text-xs text-zinc-300 animate-in fade-in max-w-xl shadow-lg shadow-black/10">
                  <div className="relative mt-0.5 shrink-0">
                    <LoaderCircle className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Specy is working</div>
                    <p className="text-xs leading-relaxed text-zinc-300">{executionProgress}</p>
                  </div>
                </div>
              )}

              {/* Thinking loader */}
              {loading && !executionProgress && (
                <div className="flex items-center gap-2.5 text-xs text-zinc-500 pl-10 py-1">
                  <LoaderCircle className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  <span>Specy is preparing your response…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 3. SEAMLESS CHAT INPUT (Centered & Clean) */}
        <div className="p-4 bg-gradient-to-t from-[#14120B] via-[#14120B] to-transparent z-10">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="rounded-2xl border border-white/10 bg-[#1A1810] focus-within:border-zinc-500/50 shadow-xl transition-all p-2.5"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                  }
                }}
                placeholder="Message Specy... (Shift + Enter for new line)"
                rows={2}
                disabled={loading}
                className="w-full resize-none bg-transparent px-2.5 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1 px-1">
                {/* Left tools icons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowAttachModal(true)}
                    title="Attach test artifact or context"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(true)}
                    title="Target URL Inspector"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                </div>

                {/* Right: Circular Send Button */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-8 h-8 rounded-full bg-white text-black hover:bg-zinc-200 disabled:opacity-20 disabled:hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                >
                  {loading ? (
                    <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* 4. CLEAN RIGHT TOOLS & KNOWLEDGE DRAWER (Hidden by default) */}
      {toolsOpen && (
        <aside className="w-[300px] flex-shrink-0 bg-[#14120B] border-l border-white/[0.08] flex flex-col p-4 z-20 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-xs font-semibold text-zinc-200 tracking-tight uppercase">
              QA Tools & Context
            </h3>
            <button
              type="button"
              onClick={() => setToolsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 space-y-5 pr-1">
            {/* Sync Knowledge Base Action */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-xs font-semibold text-zinc-200">
                Vector Knowledge Base
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                Syncs requirements, tests, defects & runs for RAG reasoning.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full mt-2.5 h-8 text-xs font-medium rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-zinc-200"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 text-zinc-400 ${
                    isSyncing ? "animate-spin" : ""
                  }`}
                />
                {isSyncing ? "Synchronizing..." : "Sync Knowledge Base"}
              </Button>
            </div>

            {/* QA Entities Count */}
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Workspace Entities
              </div>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span>Requirements</span>
                  <span className="font-mono text-zinc-400">{requirements.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span>Test Cases</span>
                  <span className="font-mono text-zinc-400">{testCases.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span>Test Plans</span>
                  <span className="font-mono text-zinc-400">{testPlans.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span>Defects</span>
                  <span className="font-mono text-zinc-400">{defects.length}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span>Execution Runs</span>
                  <span className="font-mono text-zinc-400">{executionRuns.length}</span>
                </div>
              </div>
            </div>

            {/* Active Engines Switches */}
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Active Engines
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02]">
                  <div>
                    <div className="font-medium text-zinc-200">Playwright Runner</div>
                    <div className="text-[10px] text-zinc-500">Live browser execution</div>
                  </div>
                  <Switch
                    checked={qaTools.playwrightRunner}
                    onCheckedChange={(checked) =>
                      setQaTools((s) => ({ ...s, playwrightRunner: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02]">
                  <div>
                    <div className="font-medium text-zinc-200">Defect Investigator</div>
                    <div className="text-[10px] text-zinc-500">Evidence-based failure investigation</div>
                  </div>
                  <Switch
                    checked={qaTools.defectInvestigator}
                    onCheckedChange={(checked) =>
                      setQaTools((s) => ({ ...s, defectInvestigator: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.02]">
                  <div>
                    <div className="font-medium text-zinc-200">RAG Grounding</div>
                    <div className="text-[10px] text-zinc-500">Workspace evidence index</div>
                  </div>
                  <Switch
                    checked={qaTools.ragGrounding}
                    onCheckedChange={(checked) =>
                      setQaTools((s) => ({ ...s, ragGrounding: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Attach Context Modal */}
      <Dialog open={showAttachModal} onOpenChange={setShowAttachModal}>
        <DialogContent className="bg-[#1A1810] border-white/10 text-zinc-200 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Attach QA Artifact or Context
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Provide test specifications, logs, or error traces for Specy to analyze.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-zinc-500 transition-colors cursor-pointer">
            <UploadCloud className="w-7 h-7 text-zinc-400 mx-auto" />
            <div className="text-xs font-medium text-zinc-200 mt-2">
              Click to select or drag and drop files
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Supports .pdf, .ts, .js, .json, .csv, screenshots
            </p>
          </div>
          <Button
            onClick={() => {
              setShowAttachModal(false);
              toast.success("Artifact attached to context.");
            }}
            className="w-full bg-white text-black hover:bg-zinc-200 font-medium rounded-xl"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Target URL Modal */}
      <Dialog open={showUrlModal} onOpenChange={setShowUrlModal}>
        <DialogContent className="bg-[#1A1810] border-white/10 text-zinc-200 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Inspect Web Route / Endpoint
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Provide a staging URL or endpoint for Specy to evaluate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://staging.speclane.com/checkout or /api/orders"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-zinc-500"
            />
          </div>
          <Button
            onClick={() => {
              if (urlInput.trim()) {
                setInput((prev) => `${prev} Please inspect route: ${urlInput.trim()}`);
                setUrlInput("");
              }
              setShowUrlModal(false);
            }}
            className="w-full bg-white text-black hover:bg-zinc-200 font-medium rounded-xl"
          >
            Add to Message
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
