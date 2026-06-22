import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { parseCVFromBase64 } from "@/lib/ai/cv-parser"
import { computeCVScore } from "@/lib/ai/cv-scorer"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const formData = await req.formData()
  const file = formData.get("file") as File
  const jobPostingId = formData.get("job_posting_id") as string | null
  const requiredExpYears = parseInt(formData.get("required_exp_years") as string || "0", 10)

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File quá lớn (max 5MB)" }, { status: 400 })
  if (!file.name.endsWith(".pdf")) return NextResponse.json({ error: "Chỉ hỗ trợ file PDF" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const storagePath = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("cvs")
    .upload(storagePath, buffer, { contentType: "application/pdf", upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Parse CV with Claude API
  let parsed = { full_name: "", years_experience: 0, companies_count: 1, university: "", english_score: "", summary: "" }
  try {
    parsed = await parseCVFromBase64(buffer.toString("base64"))
  } catch {
    // Continue even if parsing fails — HR can fill manually
  }

  // Compute score
  const scoreResult = computeCVScore(
    parsed.years_experience,
    parsed.companies_count || 1,
    requiredExpYears
  )

  return NextResponse.json({
    cv_file_name: file.name,
    cv_storage_path: storagePath,
    job_posting_id: jobPostingId,
    full_name: parsed.full_name,
    years_experience: parsed.years_experience,
    companies_count: parsed.companies_count,
    university: parsed.university,
    english_score: parsed.english_score,
    cv_summary: parsed.summary,
    cv_score: scoreResult.score,
    score_breakdown: {
      x: scoreResult.x,
      y: parsed.companies_count,
      z: requiredExpYears,
      nkn: parsed.years_experience,
      explanation: scoreResult.breakdown,
    },
  })
}
