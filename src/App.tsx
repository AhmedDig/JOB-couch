import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  HelpCircle, 
  FileText, 
  Compass, 
  Briefcase, 
  TrendingUp,
  Info 
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import CoachChat from "./components/CoachChat";
import GoalBuilder from "./components/GoalBuilder";
import ResumeHelper from "./components/ResumeHelper";
import MockInterview from "./components/MockInterview";
import { GoalBlueprint, Message } from "./types";

// Standard pre-populated Progress Roadmap to make the initial experience feel rich and instant
const INITIAL_DEMO_PLAN: GoalBlueprint = {
  title: "Cloud & Vector Tech-Stack Onboarding",
  category: "Career Transition Blueprint",
  description: "A fast-track roadmap pre-designed by Coach Sarah to help you master state orchestration, vector databases, and full stack deployment targets.",
  targetGoal: "Cloud & Vector Tech-Stack Onboarding",
  timeFrame: "1 Month",
  skills: ["Vector DB Indexes", "Custom LLM Chains", "TypeScript Server Hooks"],
  milestones: [
    {
      id: "demo-m-1",
      title: "Stage 1: Foundational Framework Audit",
      duration: "1 Week",
      inspiration: "Strategic review is half of the performance framework. Know your tools clearly.",
      checklist: [
        { id: "demo-t-1", text: "Audit local codebase structures against standard vector index frameworks.", isCompleted: true },
        { id: "demo-t-2", text: "Create custom schema representation templates in /src/types.ts.", isCompleted: true },
        { id: "demo-t-3", text: "Establish backend Express proxy connections to avoid CORS blocking.", isCompleted: false },
        { id: "demo-t-4", text: "Prepare 1 case description featuring quantified optimization targets.", isCompleted: false }
      ]
    },
    {
      id: "demo-m-2",
      title: "Stage 2: Production Portfolio Build",
      duration: "2 Weeks",
      inspiration: "Your personal metrics speak louder than certificates. Detail direct metric differences.",
      checklist: [
        { id: "demo-t-5", text: "Implement 2 automated query routers with strict TypeScript validation.", isCompleted: false },
        { id: "demo-t-6", text: "Deploy containers using optimal chunk caching, decreasing cold starts by 30%.", isCompleted: false },
        { id: "demo-t-7", text: "Conduct comprehensive peer review scenarios for extreme payload edge cases.", isCompleted: false }
      ]
    }
  ]
};

export default function App() {
  const [selectedTab, setSelectedTab] = useState<"dashboard" | "coach" | "builder" | "resume" | "interview">("dashboard");
  const [activePlan, setActivePlan] = useState<GoalBlueprint | null>(INITIAL_DEMO_PLAN);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Check config on boot
  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((err) => {
        console.warn("Unable to fetch server config variables. Fallback mode active.", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2C2E2F] flex flex-col font-sans" id="app-workspace">
      {/* Top Banner Warning if API key is not active */}
      {!hasApiKey && (
        <div className="bg-[#FFFBEB] border-b border-[#FEF3C7] text-[#D97706] px-4 py-2 text-center text-xs flex items-center justify-center gap-2 font-medium">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Offline Simulation Active. To enable real-time personalized AI counseling, populate a <strong>GEMINI_API_KEY</strong> inside your AI Studio <strong>Settings &rarr; Secrets</strong> panel.
          </span>
        </div>
      )}

      {/* Main navigation Header */}
      <header className="bg-white border-b border-[#EAE6DF] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand logo & tagline */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#2C2E2F] text-amber-500 font-serif flex items-center justify-center font-bold text-lg select-none">
              In
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-[#2C2E2F] block tracking-tight">AI Career Studio</span>
              <span className="text-[10px] font-mono font-semibold text-[#8A8884] uppercase tracking-wider block -mt-1">
                Progress & Momentum Engine
              </span>
            </div>
          </div>

          {/* Large desktop navigation buttons */}
          <nav className="hidden md:flex items-center gap-1.5" id="nav-desktop">
            <button
              id="tab-dashboard"
              onClick={() => setSelectedTab("dashboard")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === "dashboard"
                  ? "bg-[#FAF6E9] text-[#D97706] border border-[#FEF3C7]"
                  : "text-[#5C5C5C] hover:bg-[#FAF9F5]"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Progress Dashboard</span>
            </button>

            <button
              id="tab-builder"
              onClick={() => setSelectedTab("builder")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === "builder"
                  ? "bg-[#FAF6E9] text-[#D97706] border border-[#FEF3C7]"
                  : "text-[#5C5C5C] hover:bg-[#FAF9F5]"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Blueprint Builder</span>
            </button>

            <button
              id="tab-coach"
              onClick={() => setSelectedTab("coach")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === "coach"
                  ? "bg-[#FAF6E9] text-[#D97706] border border-[#FEF3C7]"
                  : "text-[#5C5C5C] hover:bg-[#FAF9F5]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Sarah's Co-working</span>
            </button>

            <button
              id="tab-resume"
              onClick={() => setSelectedTab("resume")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === "resume"
                  ? "bg-[#FAF6E9] text-[#D97706] border border-[#FEF3C7]"
                  : "text-[#5C5C5C] hover:bg-[#FAF9F5]"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resume Optimizer</span>
            </button>

            <button
              id="tab-interview"
              onClick={() => setSelectedTab("interview")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                selectedTab === "interview"
                  ? "bg-[#FAF6E9] text-[#D97706] border border-[#FEF3C7]"
                  : "text-[#5C5C5C] hover:bg-[#FAF9F5]"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mock Practice</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Render selected workspace view */}
        <div className="transition-all duration-300">
          {selectedTab === "dashboard" && (
            <Dashboard 
              activePlan={activePlan} 
              setActivePlan={setActivePlan}
              goToTab={(tab) => setSelectedTab(tab)}
              hasApiKey={hasApiKey}
            />
          )}

          {selectedTab === "builder" && (
            <GoalBuilder 
              activePlan={activePlan} 
              setActivePlan={setActivePlan}
              goToTab={(tab) => setSelectedTab(tab)}
              hasApiKey={hasApiKey}
            />
          )}

          {selectedTab === "coach" && (
            <CoachChat 
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              activePlan={activePlan}
              setActivePlan={setActivePlan}
              goToTab={(tab) => setSelectedTab(tab)}
            />
          )}

          {selectedTab === "resume" && (
            <ResumeHelper />
          )}

          {selectedTab === "interview" && (
            <MockInterview />
          )}
        </div>
      </main>

      {/* Bottom responsive footer bar for mobile touch screens */}
      <footer className="md:hidden border-t border-[#EAE6DF] bg-white sticky bottom-0 z-20 flex justify-around py-2.5 shadow-md">
        <button
          onClick={() => setSelectedTab("dashboard")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            selectedTab === "dashboard" ? "text-[#D97706]" : "text-[#8A8884]"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => setSelectedTab("builder")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            selectedTab === "builder" ? "text-[#D97706]" : "text-[#8A8884]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Builder</span>
        </button>

        <button
          onClick={() => setSelectedTab("coach")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            selectedTab === "coach" ? "text-[#D97706]" : "text-[#8A8884]"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Mentorship</span>
        </button>

        <button
          onClick={() => setSelectedTab("resume")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            selectedTab === "resume" ? "text-[#D97706]" : "text-[#8A8884]"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Resume</span>
        </button>

        <button
          onClick={() => setSelectedTab("interview")}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${
            selectedTab === "interview" ? "text-[#D97706]" : "text-[#8A8884]"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span>Practice</span>
        </button>
      </footer>
    </div>
  );
}
