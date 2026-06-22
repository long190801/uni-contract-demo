import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Public GET: return evaluation form data
export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServerClient()

  const { data: evaluation } = await supabase
    .from("interview_evaluations")
    .select(`
      id, eval_token, token_expires_at, submitted_at,
      interview_sessions(
        interview_type, scheduled_at,
        candidates(full_name, job_postings(title))
      ),
      interviewers(name)
    `)
    .eq("eval_token", token)
    .single()

  if (!evaluation) return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  if (new Date(evaluation.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  return NextResponse.json(evaluation)
}

// Public POST: submit evaluation
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServerClient()
  const body = await req.json()
  const { scores, overall_score, recommendation, comments } = body

  const { data: evaluation } = await supabase
    .from("interview_evaluations")
    .select("id, token_expires_at, submitted_at")
    .eq("eval_token", token)
    .single()

  if (!evaluation) return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  if (evaluation.submitted_at) return NextResponse.json({ error: "Already submitted" }, { status: 409 })
  if (new Date(evaluation.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  const { error } = await supabase
    .from("interview_evaluations")
    .update({
      scores,
      overall_score,
      recommendation,
      comments,
      submitted_at: new Date().toISOString(),
    })
    .eq("id", evaluation.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
