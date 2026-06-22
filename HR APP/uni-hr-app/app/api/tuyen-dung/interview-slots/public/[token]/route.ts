import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Public endpoint — returns slot info for candidate response page
export async function GET(_: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createServerClient()

  const { data } = await supabase
    .from("interview_slots")
    .select(`
      id, interview_type, slot_1, slot_2, slot_3,
      chosen_slot, candidate_response, token_expires_at,
      candidates(full_name, job_postings(title))
    `)
    .eq("response_token", token)
    .single()

  if (!data) return NextResponse.json({ error: "Token không hợp lệ" }, { status: 404 })
  if (new Date(data.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Link đã hết hạn" }, { status: 410 })
  }

  return NextResponse.json(data)
}
