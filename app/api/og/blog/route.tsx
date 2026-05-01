import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  fitness: { bg: "linear-gradient(135deg, #065f46 0%, #064e3b 100%)", accent: "#10b981", label: "Fitness" },
  nutrition: { bg: "linear-gradient(135deg, #78350f 0%, #92400e 100%)", accent: "#f59e0b", label: "Nutrition" },
  recovery: { bg: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)", accent: "#3b82f6", label: "Recovery" },
  mindset: { bg: "linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)", accent: "#8b5cf6", label: "Mindset" },
  workout: { bg: "linear-gradient(135deg, #881337 0%, #9f1239 100%)", accent: "#f43f5e", label: "Workout" },
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get("title") || "AI GymBRO Fitness Blog"
  const category = searchParams.get("category") || "fitness"
  const date = searchParams.get("date") || ""

  const cat = CATEGORY_COLORS[category] || CATEGORY_COLORS.fitness

  return new ImageResponse(
    <div
      style={{
        background: cat.bg,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Top: Category badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            background: cat.accent,
            color: "white",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "16px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {cat.label}
        </div>
        {date && (
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "16px" }}>{date}</span>
        )}
      </div>

      {/* Center: Title */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: title.length > 60 ? "40px" : "52px",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: 0,
            maxWidth: "90%",
          }}
        >
          {title}
        </h1>
      </div>

      {/* Bottom: Branding */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          paddingTop: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: cat.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 800,
              fontSize: "20px",
            }}
          >
            AI
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: "20px" }}>AI GymBRO</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
              aigymbro.web.id
            </div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          Fitness Blog
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
