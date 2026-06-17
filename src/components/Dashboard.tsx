import React, { useState } from "react";
import { 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Award,
  BookOpen
} from "lucide-react";
import { GoalBlueprint, TaskItem, Milestone } from "../types";

interface DashboardProps {
  activePlan: GoalBlueprint | null;
  setActivePlan: (plan: GoalBlueprint) => void;
  goToTab: (tab: "dashboard" | "coach" | "builder" | "resume" | "interview") => void;
  hasApiKey: boolean;
}

export default function Dashboard({ activePlan, setActivePlan, goToTab, hasApiKey }: DashboardProps) {
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    activePlan && activePlan.milestones.length > 0 ? activePlan.milestones[0].id : null
  );

  // If no milestone is set actively but a plan exists, default to the first
  React.useEffect(() => {
    if (activePlan && activePlan.milestones.length > 0 && !activeMilestoneId) {
      setActiveMilestoneId(activePlan.milestones[0].id);
    }
  }, [activePlan, activeMilestoneId]);

  // Toggle checklist tasks
  const handleToggleTask = (milestoneId: string, taskId: string) => {
    if (!activePlan) return;
    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          checklist: m.checklist.map((task) => 
            task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
          )
        };
      }
      return m;
    });

    setActivePlan({
      ...activePlan,
      milestones: updatedMilestones
    });
  };

  // Add a task manually to an active milestone
  const handleAddTask = (e: React.FormEvent, milestoneId: string) => {
    e.preventDefault();
    if (!newChecklistItem.trim() || !activePlan) return;

    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          checklist: [
            ...m.checklist,
            {
              id: `custom-task-${Date.now()}`,
              text: newChecklistItem.trim(),
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
    setNewChecklistItem("");
  };

  // Delete a task
  const handleDeleteTask = (milestoneId: string, taskId: string) => {
    if (!activePlan) return;
    const updatedMilestones = activePlan.milestones.map((m) => {
      if (m.id === milestoneId) {
        return {
          ...m,
          checklist: m.checklist.filter((task) => task.id !== taskId)
        };
      }
      return m;
    });

    setActivePlan({
      ...activePlan,
      milestones: updatedMilestones
    });
  };

  // Helper stats definitions
  const getTotalTasks = () => {
    if (!activePlan) return 0;
    return activePlan.milestones.reduce((acc, m) => acc + m.checklist.length, 0);
  };

  const getCompletedTasks = () => {
    if (!activePlan) return 0;
    return activePlan.milestones.reduce(
      (acc, m) => acc + m.checklist.filter((t) => t.isCompleted).length, 
      0
    );
  };

  const totalTasks = getTotalTasks();
  const completedTasks = getCompletedTasks();
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Selected active milestone details
  const selectedMilestone = activePlan?.milestones.find((m) => m.id === activeMilestoneId) || activePlan?.milestones[0];

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* Top Banner introducing Coach Sarah and the Warm Progress Theme */}
      <div className="bg-gradient-to-r from-[#FAF6E9] via-[#F4EDE0] to-[#EAE2D5] border border-[#E1D9CD] rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none translate-x-12 select-none">
          {/* Subtle background element mimicking positive progression arches */}
          <svg width="280" height="100%" viewBox="0 0 100 100" fill="none">
            <circle cx="100" cy="100" r="80" stroke="#D97706" strokeWidth="4" strokeDasharray="6,6" />
            <circle cx="100" cy="100" r="55" stroke="#2C2E2F" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coaching Active with Sarah</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#2C2E2F] tracking-tight">
              {activePlan ? `${activePlan.title}` : "Your Professional Workspace"}
            </h1>
            <p className="text-sm text-[#5D5E60] leading-relaxed">
              {activePlan 
                ? activePlan.description 
                : "Welcome! To unlock interactive career progression trackers, create a tailored development plan with Coach Sarah or specify your career milestones directly in the builder."}
            </p>
          </div>

          {!activePlan ? (
            <button
              id="cta-start-planning"
              onClick={() => goToTab("builder")}
              className="px-5 py-3 whitespace-nowrap rounded-xl bg-[#2C2E2F] hover:bg-[#1A1C1D] text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all duration-200 group"
            >
              <span>Build My Plan Now</span>
              <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <div className="flex items-center gap-5 bg-white/70 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/60">
              <div className="relative w-14 h-14 flex items-center justify-center">
                {/* Custom circular progress gauge */}
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EAE6DF]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#D97706] transition-all duration-500 ease-out"
                    strokeWidth="3.5"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="text-sm font-semibold font-mono text-[#2C2E2F]">{completionPercentage}%</span>
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-[#8A8884] font-medium font-mono">My Momentum</p>
                <p className="text-sm font-medium text-[#2C2E2F]">
                  {completedTasks} of {totalTasks} Tasks
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!activePlan ? (
        /* Empty State */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-[#EAE6DF] rounded-2xl p-8 text-center space-y-6 flex flex-col items-center justify-center min-h-[360px]">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DF] flex items-center justify-center text-[#D97706] shadow-2xs">
              <Target className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-medium text-[#2C2E2F]">No Active Plan Configured</h3>
              <p className="text-sm text-[#73716D] leading-relaxed">
                Unlock career goals, actionable task milestones, and interactive progress metrics by generating a tailored progression plan.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="empty-state-builder"
                onClick={() => goToTab("builder")}
                className="px-5 py-2.5 rounded-xl bg-[#2C2E2F] text-white hover:bg-[#1A1C1D] text-sm font-medium transition-colors"
              >
                Launch Plan Builder
              </button>
              <button
                id="empty-state-coach"
                onClick={() => goToTab("coach")}
                className="px-5 py-2.5 rounded-xl border border-[#D3CECE] text-[#5C5C5C] hover:bg-[#FAF9F5] text-sm font-medium transition-colors"
              >
                Chat with Coach Sarah
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>Coach Sarah's Pillars</span>
              </h3>
              <ul className="space-y-3.5 divide-y divide-[#FAF9F5]">
                <li className="pt-2 first:pt-0">
                  <p className="text-sm font-medium text-[#2C2E2F]">Positive Momentum</p>
                  <p className="text-xs text-[#73716D] mt-0.5">Focusing on incremental, daily checkpoints generates progress confidence.</p>
                </li>
                <li className="pt-3">
                  <p className="text-sm font-medium text-[#2C2E2F]">Metrics & Quantification</p>
                  <p className="text-xs text-[#73716D] mt-0.5">Ditch vague targets. Speak in concrete success, timelines, and business growth value.</p>
                </li>
                <li className="pt-3">
                  <p className="text-sm font-medium text-[#2C2E2F]">Structured Preparation</p>
                  <p className="text-xs text-[#73716D] mt-0.5">Simulate actual role situations using mock evaluations and STAR response formats.</p>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-tr from-[#2C2E2F] to-[#45484A] text-white rounded-2xl p-5 space-y-3">
              <Award className="w-6 h-6 text-[#FBBF24]" />
              <h4 className="text-md font-medium font-serif">Aesthetic Resonance</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Designed to echo the modern office scene: warm wood textures, cream elements, and focused interactive screens that promote focus and optimism.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Workload Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Milestone Selection Column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-2 px-1">
              <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
              <span>Milestones Roadmap</span>
            </h3>

            <div className="space-y-3">
              {activePlan.milestones.map((milestone, idx) => {
                const isSelected = selectedMilestone?.id === milestone.id;
                const mCompleted = milestone.checklist.filter(t => t.isCompleted).length;
                const mTotal = milestone.checklist.length;
                const percent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;

                return (
                  <button
                    id={`milestone-card-${milestone.id}`}
                    key={milestone.id}
                    onClick={() => setActiveMilestoneId(milestone.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected 
                        ? "bg-white border-[#D97706] shadow-sm ring-1 ring-[#D97706]/20" 
                        : "bg-white/80 border-[#EAE6DF] hover:bg-white hover:border-[#CECAC0]"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-mono text-[#D97706] bg-[#FFFBEB] px-1.5 py-0.5 rounded-sm">
                          Stage {idx + 1}
                        </span>
                        <span className="text-xs text-[#8A8884] font-medium font-mono">{milestone.duration}</span>
                      </div>
                      <h4 className="font-medium text-sm text-[#2C2E2F] truncate">{milestone.title}</h4>
                      
                      {/* Milestone small bar */}
                      <div className="w-full bg-[#FAF9F5] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#D97706] h-full rounded-full transition-all duration-300" 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-medium text-[#2C2E2F]">
                        {mCompleted}/{mTotal}
                      </div>
                      <div className="text-[10px] text-[#8A8884] uppercase font-mono tracking-wider mt-0.5">Tasks</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Target focus skills */}
            <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Priority Focus Area</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activePlan.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="text-xs font-medium text-[#4B4C4E] bg-[#FAF9F5] border border-[#EAE6DF] px-2.5 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Active Milestone Checklist Tasks */}
          <div className="lg:col-span-2 space-y-4">
            {selectedMilestone ? (
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-6">
                <div className="border-b border-[#FAF9F5] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#D97706] uppercase tracking-widest font-mono">
                      Active Action Desk
                    </p>
                    <h3 className="text-lg font-serif text-[#2C2E2F] font-medium">
                      {selectedMilestone.title}
                    </h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#2C2E2F] text-white rounded-lg font-mono font-medium align-self-start sm:align-self-auto">
                    Timeline: {selectedMilestone.duration}
                  </span>
                </div>

                {/* Inspiration Card */}
                {selectedMilestone.inspiration && (
                  <div className="bg-[#FAF9F5] border border-l-4 border-[#EAE6DF] border-l-[#D97706] p-4 rounded-xl flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <p className="text-xs font-serif italic text-[#5D5E60] leading-relaxed">
                      "{selectedMilestone.inspiration}"
                    </p>
                  </div>
                )}

                {/* Checklist Task items */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#8A8884] uppercase tracking-wider font-mono px-1">
                    Checkpoint Tasks:
                  </h4>

                  {selectedMilestone.checklist.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[#8A8884]">
                      No active checkpoint tasks in this milestone. Create one below to kick Off!
                    </div>
                  ) : (
                    <div className="divide-y divide-[#FAF9F5]">
                      {selectedMilestone.checklist.map((task) => (
                        <div 
                          key={task.id} 
                          className="flex items-center justify-between py-3.5 px-1 group transition-colors duration-150"
                        >
                          <label className="flex items-start gap-3 flex-1 cursor-pointer select-none pr-4">
                            <input
                              type="checkbox"
                              checked={task.isCompleted}
                              onChange={() => handleToggleTask(selectedMilestone.id, task.id)}
                              className="mt-0.5 rounded border-[#CECAC0] text-[#D97706] focus:ring-[#D97706] h-4 w-4"
                            />
                            <span className={`text-sm text-[#2C2E2F] leading-snug ${
                              task.isCompleted ? "line-through text-[#8A8884] decoration-[#CECAC0]" : ""
                            }`}>
                              {task.text}
                            </span>
                          </label>

                          <button
                            onClick={() => handleDeleteTask(selectedMilestone.id, task.id)}
                            className="text-[#8A8884] hover:text-[#DC2626] opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md hover:bg-[#FAF9F5] transition-all"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add task bar */}
                <form 
                  onSubmit={(e) => handleAddTask(e, selectedMilestone.id)} 
                  className="pt-2 flex gap-2 border-t border-[#FAF9F5]"
                  id="add-task-form"
                >
                  <input
                    type="text"
                    required
                    maxLength={140}
                    placeholder="Enter customized task detail..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="flex-1 bg-[#FAF9F5] focus:bg-white text-sm border border-[#EAE6DF] focus:border-[#D97706] focus:outline-hidden px-4 py-2.5 rounded-xl transition-all"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#FAF9F5] hover:bg-[#EAE6DF] text-[#2C2E2F] border border-[#EAE6DF] rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-[#EAE6DF] rounded-2xl p-8 text-center text-[#8A8884]">
                Select a milestone from the progression roadmap to view and complete milestones.
              </div>
            )}

            {/* Small Aesthetic prompt note */}
            <div className="flex items-center justify-between text-xs text-[#8A8884] font-mono px-2 pt-2">
              <span>Timeframe Target: {activePlan.timeFrame || "N/A"}</span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#D97706]" />
                Momentum Score: {completionPercentage}/100
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
