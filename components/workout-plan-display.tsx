"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, ChevronDown, ChevronUp, Calendar, Clock, Target, Loader2, Youtube } from "lucide-react"
import { generatePDF } from "@/lib/pdf-service"
import { savePlanToDatabase } from "@/lib/services/planService"

interface Exercise {
  name: string
  sets: number
  reps: string
  rest: string
}

interface DayWorkout {
  focus: string
  description?: string
  exercises: Exercise[]
  notes?: string[]
}

interface WorkoutPlanDisplayProps {
  plan: {
    summary: {
      goal: string
      level: string
      daysPerWeek: number
      sessionLength: number
    }
    overview: string
    workouts: Record<string, DayWorkout>
  }
  onBack: () => void
}

export default function WorkoutPlanDisplay({ plan, onBack }: WorkoutPlanDisplayProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>("day1")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    const saveToDb = async () => {
      await savePlanToDatabase({
        planType: "workout",
        planData: plan as unknown as Record<string, unknown>,
      })
    }
    saveToDb()
  }, [plan])

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      await generatePDF(plan, "workout")
    } catch {
      // PDF generation failed
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const workoutDays = Object.entries(plan.workouts || {})

  return (
    <div className="min-h-screen bg-stone-950 pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>
        </div>

        {/* Plan Header */}
        <div className="bg-stone-900/80 border border-stone-800/50 rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {plan.summary?.goal || "Your"} Workout Plan
          </h1>
          <p className="text-stone-400 text-sm mb-4">{plan.overview || "Personalized workout routine"}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-teal-400" />
              <span className="text-stone-300">{plan.summary?.level || "Intermediate"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="text-stone-300">{plan.summary?.daysPerWeek || 3} days/week</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-teal-400" />
              <span className="text-stone-300">{plan.summary?.sessionLength || 60} min/session</span>
            </div>
          </div>
        </div>

        {/* Workout Days - Horizontal Tabs */}
        {workoutDays.length === 0 ? (
          <div className="bg-stone-900/80 border border-stone-800/50 rounded-xl p-8 text-center">
            <p className="text-stone-400">No workouts found</p>
          </div>
        ) : (
          <>
            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-transparent">
              {workoutDays.map(([dayKey, workout]) => {
                const dayNumber = dayKey.replace("day", "")
                const isSelected = expandedDay === dayKey

                return (
                  <button
                    key={dayKey}
                    onClick={() => setExpandedDay(dayKey)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-teal-500/20 border-teal-500/50 text-teal-400"
                        : "bg-stone-900/80 border-stone-800/50 text-stone-400 hover:bg-stone-800/50 hover:text-white"
                    }`}
                  >
                    <span className="text-xs opacity-70">Day</span>
                    <span className="text-lg font-bold">{dayNumber}</span>
                    <span className="text-xs truncate max-w-[80px]">{workout.focus?.split(" ")[0] || "Workout"}</span>
                  </button>
                )
              })}
            </div>

            {/* Selected Day Content */}
            {expandedDay && plan.workouts[expandedDay] && (
              <div className="bg-stone-900/80 border border-stone-800/50 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-stone-800/50">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {plan.workouts[expandedDay].focus || "Workout"}
                  </h3>
                  {plan.workouts[expandedDay].description && (
                    <p className="text-stone-400 text-sm">{plan.workouts[expandedDay].description}</p>
                  )}
                  <p className="text-xs text-stone-500 mt-2">
                    {plan.workouts[expandedDay].exercises?.length || 0} exercises
                  </p>
                </div>

                <div className="p-5 space-y-3">
                  {plan.workouts[expandedDay].exercises?.map((exercise, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-stone-800/30 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-white">{exercise.name}</p>
                        <div className="text-right">
                          <p className="text-teal-400 font-semibold">
                            {exercise.sets} × {exercise.reps}
                          </p>
                          <p className="text-xs text-stone-500">Rest: {exercise.rest}</p>
                        </div>
                      </div>
                      <a
                        href={`https://youtube.com/results?search_query=How+to+${encodeURIComponent(exercise.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                        Watch on YouTube
                      </a>
                    </div>
                  ))}
                </div>

                {plan.workouts[expandedDay].notes && plan.workouts[expandedDay].notes!.length > 0 && (
                  <div className="px-5 pb-5">
                    <div className="p-4 bg-stone-800/20 rounded-xl">
                      <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Notes</p>
                      <ul className="space-y-1">
                        {plan.workouts[expandedDay].notes!.map((note, idx) => (
                          <li key={idx} className="text-sm text-stone-400">• {note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
