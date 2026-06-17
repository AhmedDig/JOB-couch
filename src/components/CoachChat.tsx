import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Briefcase, 
  Compass, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  User, 
  ArrowUpRight 
} from "lucide-react";
import { Message, GoalBlueprint } from "../types";

interface CoachChatProps {
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  activePlan: GoalBlueprint | null;
  setActivePlan: (plan: GoalBlueprint) => void;
  goToTab: (tab: "dashboard" | "coach" | "builder" | "resume" | "interview") => void;
}

export default function CoachChat({ 
  chatHistory, 
  setChatHistory, 
  activePlan, 
  setActivePlan, 
  goToTab 
}: CoachChatProps) {
  const [userInput, setUserInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isSending]);

  // Initial welcome message from Coach Sarah if empty
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistory([
        {
          id: "welcome-msg",
          role: "assistant",
          content: "Hello! I am Sarah, your dedicated AI Career & Success Coach. " +
            "In our office scene today, we are discussing progress, positivity, and clear targets. " +
            "How can I help you today? I can critique your professional goals, review skill gaps, design step roadmap directions, or refine your professional storytelling.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [chatHistory, setChatHistory]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setUserInput("");
    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedHistory })
      });

      if (!response.ok) {
        throw new Error("Coaching engine responded with an error.");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to contact coach server.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  // Extract bullets helper to turn suggestions.text into dashboard tasks
  const parseBulletItems = (content: string) => {
    const lines = content.split("\n");
    const bullets: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for custom list items: * item, - item, 1. item, etc. and extract text
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const cleaned = trimmed.replace(/^[\s*\-]+/, "").trim();
        if (cleaned.length > 5) bullets.push(cleaned);
      } else if (/^\d+\./.test(trimmed)) {
        const cleaned = trimmed.replace(/^\d+[\.\s]+/, "").trim();
        if (cleaned.length > 5) bullets.push(cleaned);
      }
    }
    return bullets;
  };

  // Pin task directly into standard active plan's first milestone
  const handlePinTask = (taskText: string) => {
    if (!activePlan) {
      // Prompt user to generate plan first
      alert("Please configure an active progression roadmap plan first so we can pin these action tasks to a milestone!");
      goToTab("builder");
      return;
    }

    const updatedMilestones = activePlan.milestones.map((m, idx) => {
      // Add to current active/first milestone
      if (idx === 0) {
        return {
          ...m,
          checklist: [
            ...m.checklist,
            {
              id: `pinned-task-${Date.now()}`,
              text: taskText,
              isCompleted: false
            }
          ]
        };
      }
      return m;
    });

    setActivePlan({
      ...activePlan,
      milestones: updatedMilestones
    });

    // Notify user with success animation state or notification
    alert(`Successfully pinned key action item to Milestone: "${activePlan.milestones[0].title}"!`);
  };

  const presets = [
    {
      label: "Map Career Transition",
      prompt: "I want to transition from my current role. How can we map out my key skill milestones?",
      icon: Compass
    },
    {
      label: "Find My Skills Gaps",
      prompt: "Help me identify hidden skill gaps between senior professional profiles and junior frameworks.",
      icon: Briefcase
    },
    {
      label: "Ask Me Career Questions",
      prompt: "Give me an expert coaching questionnaire to discover my target professional priorities.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="coach-chat-tab">
      {/* Sidebar with presets and Sarah's bio/image context */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
          <div className="relative">
            <div className="bg-gradient-to-tr from-[#EAE2D5] to-[#D97706] rounded-xl h-24 overflow-hidden relative shadow-inner">
              {/* Subtle background overlay circles */}
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white/40 animate-pulse" />
              </div>
            </div>
            
            {/* Coach Profile Circle in center overlapping */}
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-24 w-16 h-16 bg-[#F4EDE0] border-4 border-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-xl font-bold font-serif text-[#D97706]">S</span>
            </div>
          </div>

          <div className="pt-8 text-center space-y-1.5">
            <h3 className="font-serif text-[#2C2E2F] font-bold text-md">Coach Sarah</h3>
            <p className="text-xs font-mono uppercase tracking-wider text-[#8A8884] font-medium">AI Progress Mentor</p>
            <p className="text-xs text-[#73716D] max-w-xs mx-auto leading-relaxed">
              Inspired by collaborative workspace mentoring. Sarah guides you with constructive feedback, career diagnostics, and concrete momentum.
            </p>
          </div>

          <div className="border-t border-[#FAF9F5] pt-4 text-xs font-serif italic text-center text-[#9E9C99] px-2 leading-relaxed">
            "Your professional success starts when your goals transition from dreams into daily structured checklists."
          </div>
        </div>

        {/* Rapid Presets Trigger panel */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-[#8D8C89] px-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Recommended Focus</span>
          </h4>

          <div className="space-y-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                id={`preset-prompt-${idx}`}
                onClick={() => handleSendMessage(p.prompt)}
                disabled={isSending}
                className="w-full text-left p-3.5 rounded-xl border border-[#EAE6DF] bg-white hover:bg-[#FAF9F5] hover:border-[#CECAC0] transition-all text-xs font-medium text-[#2C2E2F] flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-7 h-7 shrink-0 rounded-lg bg-[#FAF9F5] border border-[#EAE6DF] text-[#D97706] flex items-center justify-center group-hover:bg-white transition-colors">
                  <p.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#2C2E2F]">{p.label}</p>
                  <p className="text-[10px] text-[#8A8884] truncate mt-0.5">{p.prompt}</p>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 text-[#8A8884] group-hover:text-[#D97706] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main interactive chat workspace */}
      <div className="lg:col-span-3 flex flex-col h-[600px] border border-[#EAE6DF] rounded-2xl bg-white overflow-hidden shadow-xs">
        {/* Terminal Header */}
        <div className="px-5 py-4 border-b border-[#EAE6DF] flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="text-sm font-medium text-[#2C2E2F]">Strategic Integration Workspace</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#8A8884] font-semibold mt-0.5">
                Session Active • Localized Core
              </p>
            </div>
          </div>
        </div>

        {/* Conversations viewport */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FAF9F5] relative transition-all duration-300"
        >
          {chatHistory.map((msg) => {
            const isSarah = msg.role === "assistant";
            const extractedCheckpoints = isSarah ? parseBulletItems(msg.content) : [];

            return (
              <div 
                key={msg.id}
                className={`flex gap-4 max-w-4xl ${isSarah ? "" : "flex-row-reverse ml-auto"}`}
              >
                {/* Avatar Display */}
                <div className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                  isSarah 
                    ? "bg-[#2C2E2F] text-[#FAF6E9] border border-[#2C2E2F]/10" 
                    : "bg-[#D97706] text-white"
                }`}>
                  {isSarah ? "S" : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-2 max-w-[80%]">
                  {/* Chat Card Box */}
                  <div className={`rounded-2xl p-4 border text-sm leading-relaxed ${
                    isSarah 
                      ? "bg-white border-[#EAE6DF] text-[#2C2E2F] shadow-2xs rounded-tl-xs" 
                      : "bg-[#2C2E2F] border-[#2C2E2F] text-[#FAF9F5] rounded-tr-xs"
                  }`}>
                    {/* Render message formatting lines cleanly */}
                    <div className="space-y-2 whitespace-pre-wrap font-serif md:font-sans">
                      {msg.content}
                    </div>
                  </div>

                  {/* Extractable Action Items under Sarah responses */}
                  {isSarah && extractedCheckpoints.length > 0 && (
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-3.5 space-y-2.5 shadow-2xs">
                      <p className="text-xs font-bold text-[#D97706] uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Sarah's Co-working Suggestions</span>
                      </p>
                      
                      <div className="space-y-2">
                        {extractedCheckpoints.map((bullet, bIdx) => (
                          <div 
                            key={bIdx}
                            className="flex items-start gap-2 justify-between bg-white text-xs border border-[#FEF3C7] rounded-lg p-2 hover:border-[#FCD34D] transition-colors"
                          >
                            <span className="text-[#3F4042] pr-2 leading-relaxed">{bullet}</span>
                            <button
                              onClick={() => handlePinTask(bullet)}
                              className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md bg-[#FAF9F5] hover:bg-[#FFFBEB] text-[#D97706] border border-[#EAE6DF] font-semibold text-[10px] transition-colors"
                              title="Pin item to daily priority checklist"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Pin Task</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] font-mono text-[#8A8884] block mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-4">
              <div className="w-9 h-9 shrink-0 rounded-full bg-[#2C2E2F] text-white flex items-center justify-center text-xs font-semibold animate-pulse">
                S
              </div>
              <div className="bg-white border border-[#EAE6DF] rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 max-w-[120px] shadow-2xs">
                {/* Visual Thinking Dots */}
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] rounded-xl p-4 text-xs font-medium">
              Error: {errorMessage}
            </div>
          )}
        </div>

        {/* Input form */}
        <form 
          onSubmit={handleFormSubmit}
          className="p-4 border-t border-[#EAE6DF] bg-white flex items-center gap-3 relative z-10"
          id="send-chat-form"
        >
          <input
            type="text"
            required
            disabled={isSending}
            placeholder={isSending ? "Coach Sarah is formulating response..." : "Ask Sarah about milestones, gap assessment, resume reviews..."}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 bg-[#FAF9F5] focus:bg-white text-sm border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden px-4 py-3.5 rounded-xl transition-all"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isSending}
            className="w-12 h-12 rounded-xl bg-[#2C2E2F] hover:bg-[#1A1C1D] disabled:bg-[#FAF9F5] disabled:text-[#8D8C89] border disabled:border-[#EAE6DF] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
