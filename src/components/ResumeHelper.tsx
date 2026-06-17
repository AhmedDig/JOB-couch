import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Copy, 
  TrendingUp, 
  Check 
} from "lucide-react";
import { ResumeCritique } from "../types";

export default function ResumeHelper() {
  const [targetRole, setTargetRole] = useState("Senior Full-Stack Developer");
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [critique, setCritique] = useState<ResumeCritique | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const prefillSample = () => {
    setTargetRole("Senior Software Engineer");
    setResumeText(
      "EXPERIENCE:\n" +
      "Software Developer at Delta Inc (2022 - Present)\n" +
      "- Responsible for managing team projects and writing code.\n" +
      "- Helped with transitioning system backend to new servers.\n" +
      "- Managed and updated database records periodically.\n" +
      "- Kept clean documents for software updates and user help logs.\n\n" +
      "Junior Programmer at Alpha Corp (2020 - 2022)\n" +
      "- Built user screens in React and cleaned up visual designs.\n" +
      "- Solved bugs identified in testing phases and spoke to client."
    );
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);
    setCritique(null);
    setErrorMsg("");

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText: resumeText.trim(), targetRole: targetRole.trim() })
      });

      if (!response.ok) {
        throw new Error("Resume critique backend encountered an error.");
      }

      const data = await response.json();
      setCritique({
        ...data,
        targetRole,
        isAnalyzed: true
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to critique resume.");
    } finally {
      setIsAnalyzing(true); // set finished but allow rendering
      setIsAnalyzing(false);
    }
  };

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6" id="resume-helper-tab">
      {/* Search inputs column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-md font-serif text-[#2C2E2F] font-bold">Resume Optimizer Workspace</h3>
            <p className="text-xs text-[#73716D]">
              Analyze your resume experience statements against competitive targets. Swaps vague passive task list descriptions into high-metrics actionable storytelling bullets.
            </p>
          </div>

          <form onSubmit={handleAnalyzeResume} className="space-y-4" id="resume-analysis-form">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                Target Role
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8884]" />
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Full-Stack Developer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-[#FAF9F5] focus:bg-white text-xs border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden pl-10 pr-4 py-2.5 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">
                  Paste Resume Experience Text
                </label>
                <button
                  type="button"
                  onClick={prefillSample}
                  className="text-[10px] font-semibold text-[#D97706] hover:underline"
                >
                  Prefill Developer Sample
                </button>
              </div>
              <textarea
                required
                placeholder="Paste experience summary text or single bullets here to evaluate..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                className="w-full bg-[#FAF9F5] focus:bg-white text-xs border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden p-4 rounded-xl transition-all leading-relaxed font-mono"
              />
            </div>

            {errorMsg && (
              <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl p-4 text-xs font-medium font-mono">
                Error: {errorMsg}
              </div>
            )}

            <button
              id="submit-resume-critique"
              type="submit"
              disabled={isAnalyzing || !resumeText.trim()}
              className="w-full py-3 rounded-xl bg-[#2C2E2F] hover:bg-[#1A1C1D] disabled:bg-[#FAF9F5] disabled:text-[#8D8C89] border disabled:border-[#EAE6DF] text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Structure & Keywords...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                  <span>Analyze Technical Resonance</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Critiques and Revisions Column */}
      <div className="lg:col-span-3 space-y-4">
        {!critique ? (
          <div className="bg-[#FAF9F5]/60 border-2 border-dashed border-[#EAE6DF] rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#E8E4DD] flex items-center justify-center text-[#D97706]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-sm font-medium text-[#2C2E2F]">Awaiting Evaluation</h4>
              <p className="text-xs text-[#8A8884] leading-relaxed">
                Input your target job title and experience details on the left, then click 'Analyze Technical Resonance' to review.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary Score Bar Card */}
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6 shadow-2xs">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EAE6DF]"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${critique.overallScore >= 75 ? 'text-green-500' : 'text-[#D97706]'} transition-all duration-500`}
                    strokeWidth="3"
                    strokeDasharray={`${critique.overallScore}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-2xl font-bold text-[#2C2E2F] font-mono">{critique.overallScore}</span>
                  <span className="text-[10px] text-[#8A8884] uppercase font-mono tracking-wider block -mt-1">Rank</span>
                </div>
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <p className="text-xs font-bold text-[#D97706] uppercase tracking-wider font-mono">Recruiter Resonance Assessment</p>
                <h4 className="text-md font-serif text-[#2C2E2F] font-semibold">{critique.targetRole} Alignment</h4>
                <p className="text-xs text-[#73716D] leading-relaxed">
                  {critique.overallScore >= 80 
                    ? "Great alignment, narrative targets metric-driven achievements perfectly." 
                    : critique.overallScore >= 60 
                      ? "Good starting point, but experience bullets lack quantifiable business metrics and focus keywords. Let's fix them below!" 
                      : "Critical structure gaps identified. Swapping statements to highlight proactive ownership is recommended."
                  }
                </p>
              </div>
            </div>

            {/* Critique grids (Strengths vs Gaps) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#EAE6DF] rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-[#FAF9F5] pb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Resume Strengths</span>
                </h4>
                <ul className="space-y-2">
                  {critique.strengths.map((str, idx) => (
                    <li key={idx} className="text-xs text-[#4B4C4E] flex items-start gap-2 leading-relaxed">
                      <span className="text-green-500 font-bold shrink-0">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-[#EAE6DF] rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-[#FAF9F5] pb-2">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <span>Critical Metric Gaps</span>
                </h4>
                <ul className="space-y-2">
                  {critique.criticalGaps.map((gap, idx) => (
                    <li key={idx} className="text-xs text-[#4B4C4E] flex items-start gap-2 leading-relaxed">
                      <span className="text-[#D97706] font-bold shrink-0">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Keyword tags gap */}
            {critique.keywordGaps && critique.keywordGaps.length > 0 && (
              <div className="bg-white border border-[#EAE6DF] rounded-xl p-4.5 space-y-2.5">
                <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Target Recruiters Search Keywords Missing</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {critique.keywordGaps.map((kw, idx) => (
                    <span key={idx} className="text-[10px] font-mono font-medium text-[#2C2E2F] bg-[#FAF9F5] border border-[#EAE6DF] px-2 py-0.5 rounded-md">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Revisions Cards (Before / After Showcase) */}
            <div className="space-y-3 border-t border-[#FAF9F5] pt-4">
              <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-widest font-mono px-1">
                Optimized Experience Bullets
              </h4>

              <div className="space-y-4">
                {critique.actionableRevisions.map((rev, index) => (
                  <div key={index} className="bg-white border border-[#EAE6DF] rounded-xl overflow-hidden shadow-2xs divide-y divide-[#FAF9F5]">
                    {/* Before description (Weak) */}
                    <div className="p-4 bg-red-50/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-red-100 text-red-700 rounded-sm font-mono">
                          Prior Bullet
                        </span>
                      </div>
                      <p className="text-xs text-[#8A8884] font-mono italic">
                        "{rev.originalText}"
                      </p>
                    </div>

                    {/* After description (Compelling & Optimised) */}
                    <div className="p-4 bg-green-50/20 relative group">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-green-100 text-green-700 rounded-sm font-mono">
                          Optimized Revision
                        </span>
                        
                        <button
                          onClick={() => handleCopyText(rev.suggestedText, index)}
                          className="p-1 border border-[#EAE6DF] hover:bg-white text-[#73716D] rounded-md transition-colors flex items-center gap-1 bg-[#FAF9F5]"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[9px] font-mono font-medium">
                            {copiedIndex === index ? "Copied!" : "Copy"}
                          </span>
                        </button>
                      </div>
                      
                      <p className="text-xs font-semibold text-[#2C2E2F] leading-relaxed">
                        "{rev.suggestedText}"
                      </p>

                      <div className="mt-3 pt-3 border-t border-[#FAF9F5] text-[11px] text-[#5D5E60] flex items-start gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong>Coach Coach Sarah Tips:</strong> {rev.reasoning}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
