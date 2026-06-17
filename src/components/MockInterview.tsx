import React, { useState } from "react";
import { 
  Sparkles, 
  Briefcase, 
  Play, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Award, 
  RefreshCw,
  Clock
} from "lucide-react";
import { MockInterview as InterviewType, InterviewTurn } from "../types";

export default function MockInterview() {
  const [role, setRole] = useState("Staff Software Engineer");
  const [company, setCompany] = useState("Stripe");
  const [isStarting, setIsStarting] = useState(false);
  const [session, setSession] = useState<InterviewType | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const presets = [
    { role: "Staff React Architect", company: "Stripe" },
    { role: "Junior Core Developer", company: "Airtable" },
    { role: "Senior Product Manager", company: "Google" }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setRole(p.role);
    setCompany(p.company);
  };

  const startSession = async () => {
    if (!role.trim()) return;
    setIsStarting(true);
    setErrorText("");
    
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.trim(), company: company.trim() })
      });

      if (!response.ok) {
        throw new Error("Unable to initialize mock interview conversation.");
      }

      const data = await response.json();
      
      const firstTurn: InterviewTurn = {
        question: data.nextQuestion,
      };

      setSession({
        role: role.trim(),
        company: company.trim() || "Target Employer",
        turns: [firstTurn],
        currentTurnIndex: 0,
        isLoading: false,
        isCompleted: false,
        overallScore: 10
      });
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to boot mock interview session.");
    } finally {
      setIsStarting(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !userAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorText("");

    const currentTurn = session.turns[session.currentTurnIndex];
    currentTurn.answer = userAnswer;

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: session.role,
          company: session.company,
          answerText: userAnswer.trim(),
          currentQuestion: currentTurn.question
        })
      });

      if (!response.ok) {
        throw new Error("Interview analysis engine responded with an error.");
      }

      const data = await response.json();

      // Update current turn with response evaluation and scores
      const updatedTurns = [...session.turns];
      updatedTurns[session.currentTurnIndex] = {
        ...currentTurn,
        evaluation: data.evaluation,
        score: data.score || 8,
        proTips: data.proTips || ["Expand on quantitative details next time."]
      };

      // Handle limit: We conduct a concise, fast-paced 3-question interview
      const isSessionFinished = session.currentTurnIndex >= 2;

      if (isSessionFinished) {
        // Calculate cumulative score
        const totalScoreSum = updatedTurns.reduce((acc, t) => acc + (t.score || 8), 0);
        const avgScore = Number((totalScoreSum / updatedTurns.length).toFixed(1));

        setSession({
          ...session,
          turns: updatedTurns,
          isCompleted: true,
          overallScore: avgScore
        });
      } else {
        // Build the next question
        const nextTurn: InterviewTurn = {
          question: data.nextQuestion
        };

        setSession({
          ...session,
          turns: [...updatedTurns, nextTurn],
          currentTurnIndex: session.currentTurnIndex + 1
        });
        setUserAnswer("");
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to process interview response.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="mock-interview-tab">
      {!session ? (
        /* Setup Onboarding Screen */
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="w-12 h-12 bg-[#FAF9F5] rounded-xl border border-[#EAE6DF] flex items-center justify-center text-[#D97706] mx-auto shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-serif text-[#2C2E2F] font-bold">Interactive Mock Interview Simulator</h2>
            <p className="text-xs text-[#73716D] leading-relaxed">
              Step into a warm office environment with Coach Sarah. Rehearse responses, master STAR principles, and receive precise evaluations from technical and cultural interview criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Input params Form */}
            <div className="md:col-span-2 space-y-4 border-r border-[#FAF9F5] pr-0 md:pr-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">Target Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Senior Full-Stack Architecture Lead"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-xs border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden px-4 py-3 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">Target Employer</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., AirBnb, Stripe, or Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-[#FAF9F5] text-xs border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden px-4 py-3 rounded-xl transition-all"
                />
              </div>

              {errorText && (
                <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl p-3.5 text-xs font-mono">
                  Error starting session: {errorText}
                </div>
              )}

              <button
                id="btn-start-interview"
                onClick={startSession}
                disabled={isStarting || !role.trim()}
                className="w-full py-3.5 rounded-xl bg-[#2C2E2F] hover:bg-[#1A1C1D] text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                    <span>Initiating Interview Scenario...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-green-500 fill-green-500 shrink-0" />
                    <span>Start Mock Interview Scenario</span>
                  </>
                )}
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#8A8884] uppercase">Popular Templates</h4>
              <div className="space-y-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    id={`preset-interview-${idx}`}
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left p-3 rounded-xl border border-[#FAF9F5] bg-[#FAF9F5]/80 hover:bg-[#FAF9F5] hover:border-[#CECAC0] transition-colors focus:outline-hidden text-xs"
                  >
                    <p className="font-semibold text-[#2C2E2F]">{p.role}</p>
                    <p className="text-[10px] text-[#8A8884] mt-0.5">Target: {p.company}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Session Screen */
        <div className="space-y-6">
          {/* Active Status board */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#D97706] uppercase">In-Scenario with Coach Sarah</span>
              <h3 className="text-md font-serif text-[#2C2E2F] font-bold">{session.role} at {session.company}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8A8884]" />
              <span className="text-xs font-mono text-[#5D5E60] font-semibold">
                {session.isCompleted ? "Completed" : `Question ${session.currentTurnIndex + 1} of 3`}
              </span>
            </div>
          </div>

          {!session.isCompleted ? (
            /* Active Live Questions workspace */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Question Screen Card */}
              <div className="md:col-span-2 space-y-6">
                <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-6">
                  {/* Sarah's portrait header */}
                  <div className="flex items-center gap-3 border-b border-[#FAF9F5] pb-4">
                    <div className="w-9 h-9 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold">
                      S
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#2C2E2F]">Interview Question</h4>
                      <p className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[#8A8884]">Live Core Assessment</p>
                    </div>
                  </div>

                  {/* Question body */}
                  <div className="bg-[#FAF9F5] border border-[#EAE6DF] p-4 rounded-xl">
                    <p className="text-sm leading-relaxed text-[#2C2E2F] font-serif">
                      "{session.turns[session.currentTurnIndex].question}"
                    </p>
                  </div>

                  {/* Input details form */}
                  <form onSubmit={submitAnswer} className="space-y-4" id="submit-answer-form">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#8A8884] font-mono block">Your Answer Response</label>
                      <textarea
                        required
                        disabled={isSubmitting}
                        placeholder="Draft and articulate your response here using the STAR format (Situation, Task, Action, Result)..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        rows={6}
                        className="w-full bg-[#FAF9F5] focus:bg-white text-xs border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden p-4 rounded-xl transition-all leading-relaxed font-mono"
                      />
                    </div>

                    {errorText && (
                      <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl p-3.5 text-xs font-mono">
                        Error submitting: {errorText}
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Are you sure you want to stop this interview? Your progress won't be saved.")) {
                            setSession(null);
                          }
                        }}
                        className="px-4 py-2 bg-[#FAF9F5] border border-[#EAE6DF] hover:bg-[#EAE6DF] text-xs font-medium rounded-xl text-[#73716D] transition-colors"
                      >
                        Quit Session
                      </button>
                      
                      <button
                        id="btn-submit-answer"
                        type="submit"
                        disabled={isSubmitting || !userAnswer.trim()}
                        className="px-5 py-2 bg-[#2C2E2F] hover:bg-[#1A1C1D] text-white font-medium text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer disabled:bg-[#FAF9F5] disabled:text-[#8D8C89] disabled:border-[#EAE6DF]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                            <span>Sarah is Evaluating Your Answer...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Answer Response</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Sidebar: Evaluation History of past turns */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold font-mono tracking-widest text-[#8A8884] uppercase">Live Score Card Review</h4>
                
                {session.currentTurnIndex === 0 && !session.turns[0].evaluation ? (
                  <div className="bg-white/50 border border-dashed border-[#EAE6DF] rounded-2xl p-6 text-center text-xs text-[#8A8884]">
                    Submit your first answer. Evaluated ratings, critique text, and expert coaching tips will list instantly in this sidebar.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {session.turns.slice(0, session.currentTurnIndex + 1).map((turn, idx) => {
                      if (!turn.evaluation) return null;
                      return (
                        <div key={idx} className="bg-white border border-[#EAE6DF] rounded-xl p-4 space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-[#FAF9F5] pb-2">
                            <span className="text-[9px] font-mono font-bold text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded-sm">Q{idx + 1} Assessment</span>
                            <span className="text-xs font-bold font-mono text-[#2C2E2F]">{turn.score}/10 Score</span>
                          </div>
                          
                          <p className="text-[11px] text-[#5D5E60] leading-relaxed">
                            {turn.evaluation}
                          </p>

                          {turn.proTips && (
                            <div className="mt-2 bg-[#FAF9F5] p-2 rounded-lg space-y-1">
                              <span className="text-[9px] font-bold font-mono text-[#D97706] block uppercase tracking-wide">Coach Sarah Pro Tips:</span>
                              <ul className="space-y-0.5">
                                {turn.proTips.map((tip, tIdx) => (
                                  <li key={tIdx} className="text-[10px] text-[#73716D] list-disc ml-3 leading-relaxed">
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Cumulative Score Card Panel (Interview Complete) */
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-8 space-y-6 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-white text-green-500 mx-auto flex items-center justify-center shadow-md animate-bounce">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#D97706]">Interview Completed!</span>
                <h3 className="text-xl md:text-2xl font-serif text-[#2C2E2F] font-bold">Your Performance Report</h3>
                <p className="text-xs text-[#73716D] max-w-sm mx-auto leading-relaxed">
                  Excellent focus and technical effort. Coach Sarah has reviewed your session metrics.
                </p>
              </div>

              {/* Score summary panel */}
              <div className="bg-[#FAF9F5] border border-[#EAE6DF] rounded-xl p-4 grid grid-cols-2 divide-x divide-[#EAE6DF]">
                <div>
                  <span className="text-3xl font-mono font-bold text-[#2C2E2F]">{session.overallScore}</span>
                  <span className="text-[10px] text-[#8A8884] uppercase font-semibold font-mono tracking-wider block mt-0.5">Core Average Rating</span>
                </div>
                <div>
                  <span className="text-3xl font-mono font-bold text-green-600">PASSED</span>
                  <span className="text-[10px] text-[#8A8884] uppercase font-semibold font-mono tracking-wider block mt-0.5">Status Checkpoint</span>
                </div>
              </div>

              {/* Review individual questions feedback list */}
              <div className="text-left space-y-3.5 pt-4">
                <h4 className="text-xs font-bold font-mono tracking-widest text-[#8D8C89] uppercase px-1">Detailed Question Breakdown</h4>
                
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {session.turns.map((turn, tIdx) => (
                    <div key={tIdx} className="border border-[#EAE6DF] rounded-xl p-4 bg-white space-y-2.5 shadow-2xs">
                      <div>
                        <p className="text-[10px] font-mono font-bold uppercase text-[#D97706] tracking-wider">Question {tIdx + 1}</p>
                        <p className="text-xs font-serif italic text-[#2C2E2F] mt-0.5">"{turn.question}"</p>
                      </div>
                      
                      <div className="border-t border-[#FAF9F5] pt-2 space-y-1.5">
                        <p className="text-xs font-mono text-[#8A8884]"><strong className="text-[#2C2E2F]">Your Answer:</strong> "{turn.answer}"</p>
                        <p className="text-xs text-[#5D5E60] leading-relaxed"><strong className="text-[#D97706] font-mono uppercase text-[9px] tracking-wide block mb-0.5">Sarah's Evaluation Rating ({turn.score}/10):</strong> {turn.evaluation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action items */}
              <div className="flex gap-3 justify-center pt-2">
                <button
                  id="btn-retry-interview"
                  onClick={() => setSession(null)}
                  className="px-5 py-2.5 bg-[#FAF9F5] border border-[#EAE6DF] hover:bg-[#EAE6DF] text-xs font-medium rounded-xl text-[#2C2E2F] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Start New Scenario</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
