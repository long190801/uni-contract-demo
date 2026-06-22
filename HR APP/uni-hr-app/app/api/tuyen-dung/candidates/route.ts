import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("job_id")
  const status = searchParams.get("status")

  let query = supabase
    .from("candidates")
    .select(`*, job_postings(id, title, required_exp_years)`)
    .order("created_at", { ascending: false })

  if (jobId) query = query.eq("job_posting_id", jobId)
  if (status) query = query.eq("status", status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase.from("candidates").insert(body).select(`*, job_postings(id, title, required_exp_years)`).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
