import React, { useState } from "react";
import { 
  Target, 
  Calendar, 
  Sparkles, 
  Compass, 
  Layers, 
  Terminal, 
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { GoalBlueprint, Milestone, TaskItem } from "../types";

interface GoalBuilderProps {
  activePlan: GoalBlueprint | null;
  setActivePlan: (plan: GoalBlueprint) => void;
  goToTab: (tab: "dashboard" | "coach" | "builder" | "resume" | "interview") => void;
  hasApiKey: boolean;
}

export default function GoalBuilder({ activePlan, setActivePlan, goToTab, hasApiKey }: GoalBuilderProps) {
  const [targetGoal, setTargetGoal] = useState("");
  const [timeFrame, setTimeFrame] = useState("1 Month");
  const [details, setDetails] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorText, setErrorText] = useState("");

  const presets = [
    {
      title: "Senior AI Engineer Transition",
      details: "Transition from senior full-stack React developer to AI product integration engineering, focusing on LLM custom prompts, vector databases, and full stack orchestration.",
      timeFrame: "1 Month"
    },
    {
      title: "Executive Technical Leadership",
      details: "Prepare for promotion from lead developer to engineering director. Focus on architectural decision logs, multi-team milestone alignment, and executive presentations.",
      timeFrame: "2 Months"
    },
    {
      title: "High-Metrics Product Portfolio Build",
      details: "Design and build 3 production-grade project cases showing explicit metric targets (e.g., server load decreased 45%, retention raised 15%) to capture recruiter attention.",
      timeFrame: "3 Weeks"
    }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setTargetGoal(p.title);
    setDetails(p.details);
    setTimeFrame(p.timeFrame);
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGoal.trim()) return;

    setIsGenerating(true);
    setErrorText("");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetGoal: targetGoal.trim(), timeFrame, details: details.trim() })
      });

      if (!response.ok) {
        throw new Error("Plan builder failed to construct structured roadmap.");
      }

      const rawPlan = await response.json();

      // Transform checklist strings into actual task objects: { id, text, isCompleted }
      const formattedMilestones: Milestone[] = (rawPlan.milestones || []).map((m: any, idx: number) => ({
        id: m.id || `milestone-idx-${idx}-${Date.now()}`,
        title: m.title || `Stage ${idx + 1}`,
        duration: m.duration || "Self-Paced",
        inspiration: m.inspiration || "Execution beats theory every single time.",
        checklist: (m.checklist || []).map((itemText: string, tIdx: number) => ({
          id: `task-${idx}-${tIdx}-${Date.now()}`,
          text: itemText,
          isCompleted: false
        }))
      }));

      const fullBlueprint: GoalBlueprint = {
        title: rawPlan.title || targetGoal,
        category: rawPlan.category || "Career Strategy",
        description: rawPlan.description || "Comprehensive structured career milestone roadmap.",
        skills: rawPlan.skills || ["Strategic Focus"],
        milestones: formattedMilestones,
        targetGoal: targetGoal.trim(),
        timeFrame,
        details: details.trim()
      };

      setActivePlan(fullBlueprint);
      // Automatically redirect to dashboard layout to view and toggle accomplishments!
      goToTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to contact generator backend.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="builder-tab">
      {/* Forms column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-serif text-[#2C2E2F] font-bold">Plan Creation Engine</h2>
            <p className="text-xs text-[#73716D]">
              Declare your professional target. Coach Sarah will generate a rigorous, multi-stage milestone strategy complete with daily checkpoint tasks.
            </p>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4" id="generate-plan-form">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                Target Professional Goal
              </label>
              <div className="relative">
                <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8A8884]" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Transition to Senior AI Integration Engineer"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-[#FAF9F5] focus:bg-white text-sm border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden pl-11 pr-4 py-3 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                  Timeframe Target
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8A8884]" />
                  <select
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className="w-full bg-[#FAF9F5] focus:bg-white text-sm border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden pl-11 pr-4 py-3 rounded-xl transition-all appearance-none cursor-pointer"
                  >
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                    <option value="3 Months">3 Months</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                  Category Style
                </label>
                <div className="relative">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8A8884]" />
                  <input
                    type="text"
                    disabled
                    value="Technical Transition Blueprint"
                    className="w-full bg-[#FAF9F5]/60 text-sm text-[#73716D] border border-[#EAE6DF] pl-11 pr-4 py-3 rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                My Background & Sub-goals
              </label>
              <textarea
                placeholder="List your current core technologies or specific constraints (e.g., 'Currently have 3 years NodeJS experience, need vector index familiarity...')"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full bg-[#FAF9F5] focus:bg-white text-sm border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden px-4 py-3 rounded-xl transition-all leading-relaxed"
              />
            </div>

            {/* Error logs */}
            {errorText && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl p-4 text-xs font-medium">
                Error constructing plan: {errorText}
              </div>
            )}

            {/* Submit button */}
            <button
              id="submit-generate-plan"
              type="submit"
              disabled={isGenerating || !targetGoal.trim()}
              className="w-full py-3.5 rounded-xl bg-[#2C2E2F] hover:bg-[#1A1C1D] disabled:bg-[#FAF9F5] disabled:text-[#8D8C89] border disabled:border-[#EAE6DF] text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              {isGenerating ? (
                <>
                  <div className="w-4.5 h-4.5 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                  <span>Structuring Your Dynamic Milestones...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-[#FBBF24]" />
                  <span>Generate Customized Progression Checklist</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Recommended presets sidebar column */}
      <div className="space-y-6">
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono text-[#D97706] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Starting Checkpoints</span>
            </h3>
            <p className="text-[11px] text-[#8A8884] leading-relaxed">
              Click any of Sarah's pre-designed templates below to immediately populate the form and customize.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                id={`preset-builder-${idx}`}
                onClick={() => handleApplyPreset(p)}
                className="w-full text-left p-4 rounded-xl border border-[#FAF9F5] bg-[#FAF9F5]/70 hover:bg-[#FAF9F5] hover:border-[#CECAC0] transition-colors focus:outline-hidden text-xs flex items-start gap-3 group"
              >
                <div className="w-6.5 h-6.5 shrink-0 rounded-lg bg-white border border-[#E8E4DD] text-[#D97706] flex items-center justify-center text-xs font-bold font-serif group-hover:bg-[#FFFBEB] transition-colors">
                  {idx + 1}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-semibold text-[#2C2E2F] truncate">{p.title}</h4>
                  <p className="text-[#73716D] line-clamp-2 leading-relaxed text-[10.5px]">{p.details}</p>
                  <p className="text-[10px] font-mono text-[#8A8884] font-medium pt-1">Timeframe: {p.timeFrame}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1E2021] to-[#343739] text-[#FAF9F5] rounded-2xl p-5 space-y-3 shadow-xs">
          <Award className="w-5 h-5 text-[#FBBF24]" />
          <h4 className="text-sm font-serif font-semibold">Feeling of Progress</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            By analyzing thousands of career paths, our AI structuring creates small, achievable, atomic steps so you start checking off achievements on day one.
          </p>
        </div>
      </div>
    </div>
  );
}
