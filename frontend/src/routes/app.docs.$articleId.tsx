import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Clock, ExternalLink, ThumbsUp, ThumbsDown, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { articles, type DocArticle } from "@/lib/docs-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/app/docs/$articleId")({
  component: DocArticleDetailPage,
  head: () => ({ meta: [{ title: "Documentation Guide — Speclane" }] }),
});

function DocArticleDetailPage() {
  const { articleId } = Route.useParams();
  const navigate = useNavigate();
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const currentArticle = articles.find(a => a.id === articleId) || articles[0];

  const handleFeedback = (type: 'yes' | 'no') => {
    setFeedbackGiven(type);
    toast.success(type === 'yes' ? "Thank you for your feedback!" : "We will improve this guide.");
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl relative space-y-8">
      {/* Top Bar with Back Link */}
      <div className="flex items-center justify-between relative z-10">
        <Link 
          to="/app/help" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-white/60 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Help & Resource Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-mono font-bold uppercase py-1 px-3 shadow-none">
            {currentArticle.category}
          </Badge>
        </div>
      </div>

      {/* Main Layout: Sidebar Navigation + Article Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        
        {/* Left Navigation Menu */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white dark:bg-[#14120B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Related Guides</span>
            </h3>
            <div className="space-y-1">
              {articles.map((item) => {
                const isActive = item.id === currentArticle.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to="/app/docs/$articleId"
                    params={{ articleId: item.id }}
                    onClick={() => setFeedbackGiven(null)}
                    className={`flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-[#14120B] font-bold shadow-sm"
                        : "text-slate-600 dark:text-white/70 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#14120B]" : "text-primary"}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-transparent p-6 rounded-3xl border border-primary/20 shadow-none space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest font-mono">Enterprise SLA</h4>
            <p className="text-xs text-slate-600 dark:text-white/70 leading-normal">
              Need advanced integrations or dedicated AI agents? Our solution architects are available 24/7.
            </p>
            <Button 
              onClick={() => navigate({ to: "/contact" })} 
              variant="outline" 
              className="w-full h-10 rounded-full font-bold text-xs bg-white dark:bg-[#14120B] text-slate-900 dark:text-white border-primary/40 hover:bg-primary hover:text-[#14120B] transition-all"
            >
              Contact Support
            </Button>
          </div>
        </div>

        {/* Right Article Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-[#14120B] p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-white/10 shadow-none space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <Clock className="h-4 w-4 text-primary" />
                <span>Estimated reading time: {currentArticle.readTime}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {currentArticle.title}
              </h1>
              <div className="text-sm sm:text-base font-semibold leading-relaxed text-slate-700 dark:text-white/80 p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                {currentArticle.summary}
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-slate-700 dark:text-white/90 whitespace-pre-wrap font-sans">
              {currentArticle.content}
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-medium text-slate-500 dark:text-white/60">
                Was this documentation helpful to you?
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleFeedback('yes')}
                  disabled={feedbackGiven !== null}
                  variant={feedbackGiven === 'yes' ? 'default' : 'outline'}
                  className={`rounded-full h-10 px-5 text-xs font-bold gap-2 ${feedbackGiven === 'yes' ? 'bg-green-600 text-white' : 'border-slate-200 dark:border-white/10'}`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" /> Yes
                </Button>
                <Button
                  onClick={() => handleFeedback('no')}
                  disabled={feedbackGiven !== null}
                  variant={feedbackGiven === 'no' ? 'destructive' : 'outline'}
                  className={`rounded-full h-10 px-5 text-xs font-bold gap-2 ${feedbackGiven === 'no' ? 'bg-red-600 text-white' : 'border-slate-200 dark:border-white/10'}`}
                >
                  <ThumbsDown className="h-3.5 w-3.5" /> No
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
