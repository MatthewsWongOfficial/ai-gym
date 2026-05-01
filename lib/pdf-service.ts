"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

// Helper function to sanitize text for PDF rendering
function sanitizeText(text: string | null | undefined): string {
  if (!text) return ""
  return text
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")  // Smart single quotes, backtick, acute accent
    .replace(/[\u201C\u201D\u00AB\u00BB]/g, '"')  // Smart double quotes, guillemets
    .replace(/[\u2013\u2014\u2012\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")  // All dash variants
    .replace(/\u2026/g, "...")        // Ellipsis
    .replace(/\u00A0/g, " ")          // Non-breaking space
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Zero-width chars
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Replace other non-ASCII with closest ASCII equivalent or remove
      const asciiMap: Record<string, string> = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'á': 'a', 'à': 'a', 'â': 'a', 'ä': 'a', 'ã': 'a',
        'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
        'ó': 'o', 'ò': 'o', 'ô': 'o', 'ö': 'o', 'õ': 'o',
        'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
        'ñ': 'n', 'ç': 'c',
        '°': ' degrees', '²': '2', '³': '3',
        '½': '1/2', '¼': '1/4', '¾': '3/4',
        '•': '-', '·': '-',
        '–': '-', '—': '-', '−': '-',  // Additional dash fallbacks
      }
      return asciiMap[char] || ''
    })
    .trim()
}

// Define proper types for the workout and meal plans
interface ExerciseDetail {
  name: string
  sets: number
  reps: string
  rest: string
}

interface WorkoutDay {
  focus: string
  description?: string
  exercises: ExerciseDetail[]
  notes?: string[]
}

interface WorkoutPlan {
  summary: {
    goal: string
    level: string
    daysPerWeek: number
    sessionLength: number
  }
  overview: string
  workouts: Record<string, WorkoutDay>
}

interface FoodItem {
  name: string
  amount: string
  protein: number
  carbs: number
  fat: number
  calories: number
}

interface MealDetail {
  name: string
  foods: FoodItem[]
  totals: {
    protein: number
    carbs: number
    fat: number
    calories: number
  }
  notes?: string
  cookingTime?: string
  isSnack?: boolean
}

interface MealPlanSummary {
  goal: string
  calories: number
  dietType: string
  mealsPerDay: number
  restrictions: string
  cuisine?: string
  complexity?: string
  includeDesserts?: boolean
  allergies?: string
  budget?: string
  cookingTime?: string
  seasonalPreference?: string
  healthConditions?: string
  proteinPreference?: string
  mealPrepOption?: string
  includeSnacks?: boolean
  snackFrequency?: string
  snackType?: string
}

interface MealPlan {
  summary: MealPlanSummary
  overview: string
  macros: {
    protein: number
    carbs: number
    fat: number
  }
  meals: Record<string, MealDetail[]>
}

type PlanType = WorkoutPlan | MealPlan
type PlanCategory = "workout" | "meal"

// Fix for the lastAutoTable issue - extend jsPDF type
declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number
    }
  }
}

// Helper function to determine if a plan is a workout plan
function isWorkoutPlan(plan: PlanType, type: PlanCategory): plan is WorkoutPlan {
  return type === "workout"
}

// Helper function to determine if a plan is a meal plan
function isMealPlan(plan: PlanType, type: PlanCategory): plan is MealPlan {
  return type === "meal"
}

// Function to add a stylish header to the document
function addStylishHeader(doc: jsPDF, title: string): void {
  // Add header background
  doc.setFillColor(16, 185, 129) // emerald-500
  doc.rect(0, 0, 210, 25, "F")

  // Add white title text
  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text(title, 105, 15, {
    align: "center",
  })

  // Add decorative line
  doc.setDrawColor(16, 185, 129)
  doc.setLineWidth(0.5)
  doc.line(14, 30, 196, 30)
}

// Function to generate the PDF
export function generatePDF(plan: PlanType, type: PlanCategory): void {
  const doc = new jsPDF()
  const titleText = `AI GymBRO - Your Personalized ${type === "workout" ? "Workout" : "Meal"} Plan`

  // Add stylish header
  addStylishHeader(doc, titleText)

  // Add summary
  doc.setFontSize(12)
  doc.setTextColor(70, 70, 70)
  doc.setFont("helvetica", "bold")
  doc.text("Plan Summary", 14, 40)
  doc.setLineWidth(0.2)
  doc.line(14, 41, 65, 41)

  let summaryText = ""
  if (isWorkoutPlan(plan, type)) {
    summaryText = sanitizeText(`Goal: ${plan.summary.goal} | Level: ${plan.summary.level} | ${plan.summary.daysPerWeek} days per week | ${plan.summary.sessionLength} min sessions`)
  } else if (isMealPlan(plan, type)) {
    summaryText = sanitizeText(`Goal: ${plan.summary.goal} | ${plan.summary.calories} calories | Diet: ${plan.summary.dietType} | ${plan.summary.mealsPerDay} meals per day`)
  }

  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(summaryText, 14, 47)

  // Add overview
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("Overview", 14, 57)
  doc.setLineWidth(0.2)
  doc.line(14, 58, 55, 58)

  const splitOverview = doc.splitTextToSize(sanitizeText(plan.overview), 180)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(splitOverview, 14, 65)

  let yPosition = 65 + splitOverview.length * 5

  // Add macros if meal plan
  if (isMealPlan(plan, type)) {
    yPosition += 5
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Macronutrient Breakdown", 14, yPosition)
    doc.setLineWidth(0.2)
    doc.line(14, yPosition + 1, 105, yPosition + 1)
    yPosition += 7

    autoTable(doc, {
      startY: yPosition,
      head: [["Nutrient", "Amount", "Calories", "% of Total"]],
      body: [
        [
          "Protein",
          `${plan.macros.protein}g`,
          `${plan.macros.protein * 4} cal`,
          `${Math.round(((plan.macros.protein * 4) / plan.summary.calories) * 100)}%`,
        ],
        [
          "Carbs",
          `${plan.macros.carbs}g`,
          `${plan.macros.carbs * 4} cal`,
          `${Math.round(((plan.macros.carbs * 4) / plan.summary.calories) * 100)}%`,
        ],
        [
          "Fat",
          `${plan.macros.fat}g`,
          `${plan.macros.fat * 9} cal`,
          `${Math.round(((plan.macros.fat * 9) / plan.summary.calories) * 100)}%`,
        ],
        ["Total", "", `${plan.summary.calories} cal`, "100%"],
      ],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, lineWidth: 0.1 },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 250, 245],
      },
    })

    yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 40

    // Add snack information if included
    if (plan.summary.includeSnacks) {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        doc.setFillColor(16, 185, 129)
        doc.rect(0, 0, 210, 10, "F")
        yPosition = 20
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(70, 70, 70)
      doc.text("Snack Information", 14, yPosition)
      doc.setLineWidth(0.2)
      doc.line(14, yPosition + 1, 85, yPosition + 1)
      yPosition += 7

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const snackInfo = [
        [`Snack Frequency: ${plan.summary.snackFrequency || "As needed"}`],
        [`Snack Type: ${plan.summary.snackType || "Balanced"}`],
        [`Snack Goals: To provide energy between meals and support your ${plan.summary.goal.toLowerCase()} goals`],
      ]

      autoTable(doc, {
        startY: yPosition,
        body: snackInfo,
        theme: "plain",
        styles: { fontSize: 10, cellPadding: 3 },
        tableWidth: 180,
      })

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 10 : yPosition + 30
    }
  }

  // Add daily plans
  if (isWorkoutPlan(plan, type)) {
    // Workout plan
    Object.entries(plan.workouts).forEach(([_, workout], index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        doc.setFillColor(16, 185, 129)
        doc.rect(0, 0, 210, 10, "F")
        yPosition = 20
      }

      const dayNumber = index + 1
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(16, 185, 129)
      doc.text(`Day ${dayNumber}: ${sanitizeText(workout.focus)}`, 14, yPosition)

      // Add divider
      doc.setDrawColor(16, 185, 129)
      doc.setLineWidth(0.3)
      doc.line(14, yPosition + 2, 196, yPosition + 2)

      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(70, 70, 70)
      const splitDesc = doc.splitTextToSize(sanitizeText(workout.description), 180)
      doc.text(splitDesc, 14, yPosition)
      yPosition += splitDesc.length * 5 + 5

      // Exercise table
      autoTable(doc, {
        startY: yPosition,
        head: [["Exercise", "Sets", "Reps", "Rest"]],
        body: workout.exercises.map((exercise) => [
          sanitizeText(exercise.name),
          exercise.sets.toString(),
          sanitizeText(exercise.reps),
          sanitizeText(exercise.rest),
        ]),
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 250, 245],
        },
      })

      yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : yPosition + 20

      // Notes
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 14, yPosition)
      yPosition += 5

      doc.setFont("helvetica", "normal")
      if (workout.notes) {
        workout.notes.forEach((note) => {
          const splitNote = doc.splitTextToSize(`- ${sanitizeText(note)}`, 180)
          doc.text(splitNote, 14, yPosition)
          yPosition += splitNote.length * 5
        })
      }

      yPosition += 10
    })
  } else if (isMealPlan(plan, type)) {
    // Meal plan
    Object.entries(plan.meals).forEach(([dayKey, meals], dayIndex) => {
      // Add a new page for each day
      if (dayIndex > 0) {
        doc.addPage()
        doc.setFillColor(16, 185, 129)
        doc.rect(0, 0, 210, 10, "F")
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(16, 185, 129)
      doc.text(`Day ${dayIndex + 1}`, 14, yPosition)

      // Add divider
      doc.setDrawColor(16, 185, 129)
      doc.setLineWidth(0.3)
      doc.line(14, yPosition + 2, 196, yPosition + 2)

      yPosition += 10

      // Separate meals and snacks
      const mainMeals = meals.filter((meal) => !meal.isSnack)
      const snacks = meals.filter((meal) => meal.isSnack)

      // First output main meals
      mainMeals.forEach((meal) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          doc.setFillColor(16, 185, 129)
          doc.rect(0, 0, 210, 10, "F")
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(16, 185, 129)
        doc.text(sanitizeText(meal.name), 14, yPosition)
        yPosition += 7

        // Food table
        autoTable(doc, {
          startY: yPosition,
          head: [["Food", "Amount", "Protein", "Carbs", "Fat", "Calories"]],
          body: meal.foods.map((food) => [
            sanitizeText(food.name),
            sanitizeText(food.amount),
            `${food.protein}g`,
            `${food.carbs}g`,
            `${food.fat}g`,
            food.calories.toString(),
          ]),
          theme: "grid",
          styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [240, 250, 245],
          },
          foot: [
            [
              "Total",
              "",
              `${meal.totals.protein}g`,
              `${meal.totals.carbs}g`,
              `${meal.totals.fat}g`,
              meal.totals.calories.toString(),
            ],
          ],
          footStyles: {
            fillColor: [230, 250, 240],
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },
        })

        yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : yPosition + 20

        // Notes
        if (meal.notes) {
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(70, 70, 70)
          doc.text("Preparation:", 14, yPosition)
          yPosition += 5

          doc.setFont("helvetica", "normal")
          const splitNote = doc.splitTextToSize(sanitizeText(meal.notes), 180)
          doc.text(splitNote, 14, yPosition)
          yPosition += splitNote.length * 5 + 10
        } else {
          yPosition += 10
        }
      })

      // Then output snacks if any
      if (snacks.length > 0) {
        // Check if we need a new page
        if (yPosition > 230) {
          doc.addPage()
          doc.setFillColor(16, 185, 129)
          doc.rect(0, 0, 210, 10, "F")
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(214, 156, 60) // Amber color for snacks
        doc.text("Daily Snacks", 14, yPosition)

        // Add divider
        doc.setDrawColor(214, 156, 60)
        doc.setLineWidth(0.3)
        doc.line(14, yPosition + 2, 196, yPosition + 2)

        yPosition += 10

        snacks.forEach((snack, snackIndex) => {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage()
            doc.setFillColor(16, 185, 129)
            doc.rect(0, 0, 210, 10, "F")
            yPosition = 20
          }

          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          doc.setTextColor(214, 156, 60)
          doc.text(`Snack ${snackIndex + 1}: ${sanitizeText(snack.name)}`, 14, yPosition)
          yPosition += 6

          // Snack table
          autoTable(doc, {
            startY: yPosition,
            head: [["Food", "Amount", "Calories"]],
            body: snack.foods.map((food) => [sanitizeText(food.name), sanitizeText(food.amount), food.calories.toString()]),
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, lineWidth: 0.1 },
            headStyles: {
              fillColor: [214, 156, 60],
              textColor: [255, 255, 255],
              fontStyle: "bold",
            },
            alternateRowStyles: {
              fillColor: [252, 245, 235],
            },
            foot: [["Total", "", snack.totals.calories.toString()]],
            footStyles: {
              fillColor: [250, 240, 220],
              textColor: [0, 0, 0],
              fontStyle: "bold",
            },
          })

          yPosition = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 5 : yPosition + 15

          // Notes
          if (snack.notes) {
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(70, 70, 70)
            doc.text("Tip:", 14, yPosition)
            yPosition += 4

            doc.setFont("helvetica", "normal")
            const splitNote = doc.splitTextToSize(sanitizeText(snack.notes), 180)
            doc.text(splitNote, 14, yPosition)
            yPosition += splitNote.length * 4 + 8
          } else {
            yPosition += 8
          }
        })
      }
    })
  }

  // Add footer
  doc.setFillColor(240, 240, 240)
  doc.rect(0, 280, 210, 17, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(100, 100, 100)
  doc.text("Generated by AI GymBRO", 105, 285, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text("Your AI-powered fitness companion", 105, 290, { align: "center" })

  // Save the PDF
  doc.save(`ai-gymbro-${type}-plan.pdf`)
}

