import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Sparkles, Zap } from "lucide-react";

interface PaywallOverlayProps {
  title: string;
  description: string;
  planRequired?: string;
  icon?: React.ReactNode;
}

export function PaywallOverlay({ 
  title, 
  description, 
  planRequired = "Pro",
  icon = <ShieldAlert className="h-10 w-10 text-primary" />
}: PaywallOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-12 bg-white/95 dark:bg-[#14120B]/95 backdrop-blur-md overflow-y-auto min-h-[500px]">
      <div className="max-w-md w-full bg-white dark:bg-[#14120B] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 text-center shadow-2xl relative overflow-hidden my-auto">
        
        <div className="relative z-10">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto ring-8 ring-primary/5">
            {icon}
          </div>
          
          <h2 className="text-2xl font-bold mb-3 tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-500 dark:text-white/50 mb-8 leading-relaxed">
            {description}
          </p>
          
          <div className="flex flex-col gap-3">
            <Link to="/app/billing">
              <Button size="lg" className="w-full rounded-full h-12 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md transition-all font-bold gap-2">
                <Sparkles className="h-4 w-4" />
                Upgrade to {planRequired}
              </Button>
            </Link>
            <Link to="/app/billing">
              <Button variant="ghost" className="w-full rounded-full text-slate-500 hover:text-primary">
                View all plans
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 dark:text-white/20 uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Priority Support
            </div>
            <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> No Usage Limits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
