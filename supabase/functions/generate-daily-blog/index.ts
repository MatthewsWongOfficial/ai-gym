import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const FITNESS_TOPICS = [
  // Strength & Muscle
  "Best compound exercises for building muscle mass",
  "The science of muscle hypertrophy explained",
  "How to progressive overload effectively for beginners",
  "Top isolation exercises for lagging body parts",
  "How to build a stronger squat from scratch",
  "The best deadlift variations for different goals",
  "How to increase your bench press by 20 percent",
  "Building bigger arms: triceps vs biceps focus",
  "The ultimate guide to overhead pressing",
  "How to build strong and defined shoulders",
  "Best back exercises for width and thickness",
  "Leg day exercises beyond the basic squat",
  "How to build a massive chest without injuries",
  "The best exercises for building a thick core",
  "How to train for both strength and size",
  "Understanding rep ranges: strength vs hypertrophy vs endurance",
  "The role of time under tension in muscle growth",
  "How to properly deload for continued progress",
  "The best dumbbell exercises for full-body development",
  "How to build functional strength for everyday life",
  // Cardio & Fat Loss
  "HIIT vs steady-state cardio: which burns more fat",
  "The science of fat loss explained simply",
  "How to break through a weight loss plateau",
  "Best cardio exercises that preserve muscle mass",
  "How to calculate your calorie deficit correctly",
  "The truth about fasted cardio for fat loss",
  "How to combine strength training and cardio effectively",
  "The best heart rate zones for fat burning",
  "How to use a rowing machine for full-body cardio",
  "Jump rope vs running: which is better for fitness",
  // Nutrition
  "The science behind protein timing for muscle growth",
  "How to track macros for optimal body composition",
  "Best pre-workout nutrition strategies for energy",
  "Post-workout meal ideas for maximum recovery",
  "Meal prep tips for busy fitness enthusiasts",
  "Understanding different types of protein supplements",
  "The role of creatine in athletic performance",
  "How much protein do you really need per day",
  "Best foods for muscle recovery after intense workouts",
  "The complete guide to bulking nutrition",
  "How to eat clean on a tight budget",
  "The truth about intermittent fasting and muscle gain",
  "Best supplements for natural muscle building",
  "How to calculate your maintenance calories accurately",
  "The role of carbs in workout performance",
  "Hydration tips for optimal athletic performance",
  "How to read nutrition labels effectively",
  "The best high-protein meals for muscle building",
  "How to meal prep for the entire week",
  "Understanding micronutrients for fitness enthusiasts",
  // Recovery & Mobility
  "The importance of sleep for muscle growth and recovery",
  "How to prevent common gym injuries",
  "Benefits of foam rolling and self-myofascial release",
  "Effective stretching routines for flexibility",
  "Understanding muscle soreness and recovery",
  "The importance of rest days in training",
  "How to fix common mobility restrictions",
  "The best recovery techniques after heavy lifting",
  "How to use a lacrosse ball for muscle release",
  "The science behind cold plunge and ice baths",
  "How to improve ankle mobility for deeper squats",
  "The best stretches for desk workers who lift",
  "How to recover from a marathon faster",
  "Understanding DOMS and when to worry about it",
  "The role of sleep quality in athletic performance",
  // Mindset & Motivation
  "Building mental toughness for fitness success",
  "How to stay motivated on your fitness journey",
  "How to set realistic fitness goals",
  "The psychology of habit formation for exercise",
  "How to overcome gym anxiety as a beginner",
  "Dealing with body image issues in fitness culture",
  "How to stay consistent when results slow down",
  "The mental benefits of regular exercise",
  "How to build a growth mindset for lifting",
  "Overcoming the fear of heavy weights",
  "How to train when you feel like giving up",
  "The role of self-discipline vs motivation in fitness",
  // Workout Programming
  "How to create an effective push-pull-legs routine",
  "The best 5-day workout split for muscle growth",
  "How to design a full-body workout program",
  "Upper lower split: the ultimate guide",
  "How to train around injuries safely",
  "The best home workout program with minimal equipment",
  "How to periodize your training for best results",
  "The best workout split for beginners",
  "How to train for a 5K run from scratch",
  "Bodyweight exercises for a full-body workout",
  "How to build a home gym on a budget",
  "The best resistance band exercises for muscle growth",
  "How to structure your training week for maximum gains",
  "The benefits of supersets and drop sets",
  "How to use rest-pause training for more volume",
  // Specific Exercises
  "How to improve your squat form step by step",
  "The perfect deadlift technique for beginners",
  "How to master the pull-up from zero reps",
  "The best bench press cues for maximum strength",
  "How to do a proper barbell row",
  "The correct way to do Romanian deadlifts",
  "How to perform lunges without knee pain",
  "The best variations of the overhead press",
  "How to do hip thrusts for glute development",
  "The proper form for cable flyes and chest isolation",
  // Yoga & Flexibility
  "The benefits of yoga for athletes",
  "How yoga improves weightlifting performance",
  "Best yoga poses for post-workout recovery",
  "The connection between flexibility and injury prevention",
  "How to start a yoga practice as a lifter",
  // Lifestyle & Wellness
  "The benefits of morning workouts",
  "How to balance fitness with a busy schedule",
  "The impact of stress on muscle growth",
  "How to improve posture through strength training",
  "The connection between gut health and fitness",
  "How to train during travel without losing gains",
  "The effects of alcohol on muscle recovery",
  "How to optimize your workout environment",
  "The best fitness trackers for serious lifters",
  "How to build a sustainable fitness lifestyle",
  // Equipment & Gear
  "The best weightlifting shoes for every budget",
  "How to choose the right gym bag for your needs",
  "The best lifting belts: when and how to use them",
  "Wrist wraps vs lifting straps: which do you need",
  "The best workout headphones for the gym",
  // Common Mistakes
  "The biggest mistakes beginners make in the gym",
  "How to fix common squat mistakes",
  "Why your bench press is stalling and how to fix it",
  "The most common deadlift errors and how to correct them",
  "Why you are not gaining muscle and what to change",
  "How to stop ego lifting and train smarter",
  "The biggest nutrition mistakes that kill your gains",
  "Why cardio might be hurting your muscle growth",
  "How to avoid overtraining and burnout",
  "The worst fitness myths that won't die",
  // Seasonal & Trending
  "How to stay fit during the holiday season",
  "The best winter workout routine for muscle building",
  "How to get summer-ready abs in 12 weeks",
  "New Year fitness resolutions that actually stick",
  "The best outdoor workouts for warm weather",
  // Advanced Training
  "How to program for a powerlifting meet",
  "The conjugate method explained for beginners",
  "How to train for a bodybuilding competition",
  "The Westside Barbell method for raw lifters",
  "How to use RPE for autoregulating your training",
  "The best strongman exercises for general fitness",
  "How to incorporate Olympic lifts into your routine",
  "The benefits of plyometric training for athletes",
  "How to use chains and bands for accommodating resistance",
  "The best grip strength exercises for heavy lifting",
  // Specific Populations
  "How to train effectively over age 40",
  "The best workout plan for college students",
  "How to start lifting as a complete beginner",
  "Fitness tips for people with desk jobs",
  "How to train safely during pregnancy",
  "The best exercises for seniors to stay strong",
  "How to lift weights with bad knees",
  "Training with diabetes: what you need to know",
  "The best workout routine for shift workers",
  "How to stay fit as a busy parent",
]

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const groqApiKey = Deno.env.get("GROQ_API_KEY")!

    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is not set")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch existing blog titles for deduplication and internal linking
    const { data: existingBlogs } = await supabase
      .from("blogs")
      .select("title, slug")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50)

    const existingTitles = (existingBlogs || []).map(b => b.title.toLowerCase())

    // Pick a topic that hasn't been covered yet
    let topic = ""
    let attempts = 0
    const shuffled = [...FITNESS_TOPICS].sort(() => Math.random() - 0.5)
    
    for (const candidate of shuffled) {
      const candidateLower = candidate.toLowerCase()
      const isDuplicate = existingTitles.some(existing => {
        const overlap = candidateLower.split(" ").filter(word => existing.includes(word)).length
        return overlap >= 4
      })
      
      if (!isDuplicate) {
        topic = candidate
        break
      }
      attempts++
    }

    // If all topics are covered, pick a random one with a unique angle
    if (!topic) {
      const randomTopic = FITNESS_TOPICS[Math.floor(Math.random() * FITNESS_TOPICS.length)]
      topic = `${randomTopic} - advanced tips and strategies for 2026`
    }

    console.log(`Generating blog about: ${topic}`)

    // Build internal linking context from recent posts
    const recentPostLinks = (existingBlogs || []).slice(0, 10).map(b => `- "${b.title}" (https://aigymbro.web.id/blog/${b.slug})`).join("\n")

    // Generate blog using JSON mode
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content: "You are a professional fitness blogger with expertise in exercise science and nutrition. Write engaging, detailed, and scientifically accurate blog posts. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: `Write a comprehensive blog post about: "${topic}".

IMPORTANT REQUIREMENTS:
- Content must be 1200-1500 words (this is critical for SEO)
- Use proper markdown formatting with ## headings and ### subheadings
- Include practical, actionable tips backed by science
- Write in a friendly, authoritative tone
- Include a brief introduction and conclusion

INTERNAL LINKING: Include 2-3 natural references to these related articles using markdown links:
${recentPostLinks}

Return a JSON object with these fields:
- title: string (catchy, 50-80 characters, include power words)
- excerpt: string (compelling summary, max 200 characters)
- content: string (full blog content in markdown, 1200-1500 words)
- category: string (one of: fitness, nutrition, recovery, mindset, workout)
- tags: array of 5-7 relevant strings
- read_time: number (estimated minutes to read)`
          }
        ],
        temperature: 0.9,
        max_completion_tokens: 4096,
        top_p: 1,
        stream: false,
        response_format: { type: "json_object" },
        stop: null
      }),
    })

    const groqData = await groqResponse.json()
    
    console.log("Groq status:", groqResponse.status)
    
    if (!groqResponse.ok) {
      console.error("Groq error:", JSON.stringify(groqData))
      throw new Error(`Groq API error: ${groqResponse.status}`)
    }

    if (!groqData.choices?.[0]?.message?.content) {
      console.error("Invalid response:", JSON.stringify(groqData))
      throw new Error("Invalid Groq response")
    }

    const blogData = JSON.parse(groqData.choices[0].message.content)

    // Generate a unique slug
    const baseSlug = blogData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const slug = `${baseSlug}-${dateStr}`

    // Insert blog into database
    const { data, error } = await supabase
      .from("blogs")
      .insert({
        title: blogData.title,
        slug: slug,
        excerpt: blogData.excerpt?.slice(0, 200) || blogData.title,
        content: blogData.content,
        category: blogData.category || "fitness",
        cover_image: "https://aigymbro.web.id/og-image/blog.png",
        tags: blogData.tags || [],
        read_time: blogData.read_time || 7,
        author: "Matthews Wong",
        is_published: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    console.log(`Blog created successfully: ${data.title}`)

    return new Response(JSON.stringify({ success: true, blog: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error generating blog:", error)
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
