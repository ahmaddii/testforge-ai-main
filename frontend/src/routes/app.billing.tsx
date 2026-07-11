import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Loader2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/app/billing")({
  component: BillingPage,
  head: () => ({ meta: [{ title: "Billing — Speclane" }] }),
});

type PlanId = "starter" | "pro" | "business";

type Plan = {
  id: PlanId;
  name: string;
  description: string;
  priceLabel: string;
  configured: boolean;
  limits: {
    projects: number;
    monthlyGenerations: number;
    teamMembers: number;
  };
  features: {
    slackAlerts: boolean;
    teamCollaboration: boolean;
    videoCalls: boolean;
    advancedReports: boolean;
    aiTestGenerator: boolean;
    runComparison: boolean;
    dataExport: boolean;
  };
};

type BillingSummary = {
  plan: "free" | PlanId;
  plans: Plan[];
  can_manage_billing: boolean;
  subscription?: {
    status?: string;
    cancel_at_period_end?: boolean;
    current_period_end?: string;
  } | null;
  usage: {
    monthlyGenerations: number;
  };
};

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (environment: string) => void };
      Initialize: (options: Record<string, unknown>) => void;
      Checkout: {
        open: (options: Record<string, unknown>) => void;
      };
    };
    __speclanePaddleInitialized?: boolean;
  }
}

let paddleScriptPromise: Promise<void> | null = null;

const loadPaddleScript = () => {
  if (window.Paddle) return Promise.resolve();

  if (!paddleScriptPromise) {
    paddleScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Paddle.js"));
      document.body.appendChild(script);
    });
  }

  return paddleScriptPromise;
};

const featureLabels: Array<[keyof Plan["features"], string]> = [
  ["aiTestGenerator", "AI Test Generator"],
  ["runComparison", "Execution Run Comparison"],
  ["dataExport", "Data Export (PDF/CSV/JSON)"],
  ["advancedReports", "Advanced reports"],
  ["teamCollaboration", "Team Chat & Collaboration"],
  ["slackAlerts", "Slack alerts"],
  ["videoCalls", "Video calls"],
];

function formatLimit(value: number, label: string) {
  return value === -1 ? `Unlimited ${label}` : `${value.toLocaleString()} ${label}`;
}

function BillingPage() {
  const user = useApp((s) => s.user);
  const setBilling = useApp((s) => s.setBilling);
  const fetchData = useApp((s) => s.fetchData);
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const loadBilling = async () => {
    try {
      const data = await api.get("/billing/subscription");
      setSummary(data);
      setBilling(data);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to load billing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Checkout completed. Your plan will be updated soon ");
      loadBilling();
    }
    if (params.get("checkout") === "cancelled") {
      toast.info("Checkout cancelled.");
    }
  }, []);

  const currentPlan = summary?.plan || "free";
  const currentPlanDetails = useMemo(
    () => summary?.plans.find((plan) => plan.id === currentPlan),
    [summary?.plans, currentPlan]
  );
  const generationLimit = currentPlanDetails?.limits.monthlyGenerations ?? 1;
  const generationUsage = summary?.usage.monthlyGenerations ?? 0;
  const generationPct =
    generationLimit === -1 ? 0 : Math.min(100, Math.round((generationUsage / generationLimit) * 100));

  const startCheckout = async (plan: PlanId) => {
    setBusyPlan(plan);
    try {
      const data = await api.post("/billing/create-checkout-session", { plan });
      if (!data?.transactionId) throw new Error("Paddle did not return a transaction ID.");

      const token = import.meta.env.VITE_PADDLE_CLIENT_TOKEN;
      if (!token) throw new Error("VITE_PADDLE_CLIENT_TOKEN is not configured.");

      await loadPaddleScript();

      if (!window.Paddle) throw new Error("Paddle.js is not available.");
      if (!window.__speclanePaddleInitialized) {
        if (import.meta.env.VITE_PADDLE_ENV !== "production") {
          window.Paddle.Environment?.set("sandbox");
        }

        window.Paddle.Initialize({
          token,
          eventCallback: (event: any) => {
            if (event?.name === "checkout.completed") {
              toast.success("Checkout completed. Your plan will update when Paddle confirms it.");
              setTimeout(() => loadBilling(), 2500);
            }
          },
        });
        window.__speclanePaddleInitialized = true;
      }

      window.Paddle.Checkout.open({
        transactionId: data.transactionId,
        customer: user?.email ? { email: user.email } : undefined,
        settings: {
          displayMode: "overlay",
          theme: "dark",
          variant: "one-page",
          successUrl: `${window.location.origin}/app/billing?checkout=success`,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setBusyPlan(null);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const data = await api.post("/billing/create-portal-session", {});
      if (!data?.url) throw new Error("Paddle did not return a portal URL.");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="h-[400px] rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-6xl relative">

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-white/60 bg-clip-text text-transparent mb-1">
            Billing
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-sm md:text-base">
            Choose the plan that fits your QA workflow and manage your subscription.
          </p>
        </div>
        {summary?.subscription?.status && summary.subscription.status !== "free" && (
          <Button
            onClick={openPortal}
            disabled={portalLoading || !summary.can_manage_billing}
            variant="outline"
            className="rounded-full h-11 px-6 border-slate-200 dark:border-white/10"
          >
            {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
            Manage billing
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 relative z-10">
        <div className="md:col-span-2 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30">
                  Current Plan
                </span>
              </div>
              <h2 className="text-2xl font-bold capitalize">{currentPlan}</h2>
              <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
                {summary?.can_manage_billing
                  ? "Workspace owner billing controls are enabled for this account."
                  : "Billing is managed by the workspace owner."}
              </p>
            </div>
            <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary pointer-events-none shadow-none font-bold tracking-wide">
              {summary?.subscription?.status || "free"}
            </Badge>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">AI generations this month</span>
              <span className="text-slate-500 dark:text-white/50">
                {generationUsage.toLocaleString()} / {generationLimit === -1 ? "Unlimited" : generationLimit.toLocaleString()}
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div className="h-full rounded-full gradient-bg" style={{ width: `${generationPct}%` }} />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#14120B] p-6 shadow-none">
          <Zap className="h-8 w-8 text-primary mb-4" />
          <h3 className="font-bold text-lg">Production ready</h3>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-2">
            Paddle Checkout, Customer Portal, webhook sync, usage tracking, and server-side plan enforcement are wired together.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 relative z-10">
        {summary?.plans.map((plan) => {
          const active = currentPlan === plan.id;
          const popular = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={`relative overflow-hidden rounded-3xl border bg-white dark:bg-[#14120B] p-6 shadow-none transition-all duration-300 ${active
                ? "border-primary ring-2 ring-primary/20 scale-[1.02] z-20 shadow-none"
                : popular
                  ? "border-primary/50 shadow-none hover:border-primary hover:scale-[1.01]"
                  : "border-slate-200 dark:border-white/10 hover:border-primary/30 hover:scale-[1.01]"
                }`}
            >
              {active && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-[#14120B] text-[10px] font-bold uppercase tracking-widest py-1 px-4 rounded-bl-xl shadow-none">
                    Current
                  </div>
                </div>
              )}
              {popular && !active && (
                <Badge variant="outline" className="absolute right-5 top-5 rounded-full bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 hover:text-primary pointer-events-none shadow-none font-bold tracking-wide">
                  Popular
                </Badge>
              )}
              <div className="mb-6">
                <h3 className={`text-xl font-bold ${active ? "text-primary" : ""}`}>{plan.name}</h3>
                <div className="mt-3 text-3xl font-black">{plan.priceLabel}</div>
                <p className="mt-3 text-sm text-slate-500 dark:text-white/50 min-h-[42px]">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${active ? "text-primary" : "text-green-500"}`} />
                  {formatLimit(plan.limits.projects, "projects")}
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${active ? "text-primary" : "text-green-500"}`} />
                  {formatLimit(plan.limits.monthlyGenerations, "AI generations/mo")}
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`h-4 w-4 ${active ? "text-primary" : "text-green-500"}`} />
                  {formatLimit(plan.limits.teamMembers, "team seats")}
                </div>
                {featureLabels.map(([key, label]) => (
                  plan.features[key] && (
                    <div key={key} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${active ? "text-primary" : "text-green-500"}`} />
                      {label}
                    </div>
                  )
                ))}
              </div>

              <button
                onClick={() => startCheckout(plan.id)}
                disabled={active || busyPlan === plan.id || !summary.can_manage_billing || !plan.configured}
                className={`w-full rounded-full h-11 font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${active
                  ? "bg-primary/10 text-primary border-primary/20 cursor-default"
                  : popular
                    ? "gradient-bg text-[#14120B] shadow-none hover:scale-[1.02] border-transparent"
                    : "bg-transparent border border-primary/50 text-white hover:bg-primary hover:text-[#14120B] hover:border-primary"
                  }`}
              >
                {busyPlan === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : active ? (
                  "Current plan"
                ) : !plan.configured ? (
                  "Price not configured"
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upgrade
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
