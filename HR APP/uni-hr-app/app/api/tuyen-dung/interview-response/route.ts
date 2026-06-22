import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import { interviewConfirmationEmail } from "@/lib/email/templates/interview-invitation"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

// Public endpoint — no auth required. Candidate responds to interview invitation via token link.
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { token, response, proposed_time } = await req.json()

  const { data: slot } = await supabase
    .from("interview_slots")
    .select("*, candidates(*, job_postings(title))")
    .eq("response_token", token)
    .single()

  if (!slot) return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  if (new Date(slot.token_expires_at) < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  await supabase.from("interview_slots").update({
    candidate_response: response,
    proposed_time: proposed_time || null,
    confirmation_sent_at: new Date().toISOString(),
  }).eq("id", slot.id)

  const candidate = slot.candidates as Record<string, unknown>

  if (response === "Chấp nhận" && candidate?.email) {
    const confirmedTime = slot.chosen_slot
      ? format(new Date(String(slot.chosen_slot)), "EEEE, dd/MM/yyyy HH:mm", { locale: vi })
      : "Thời gian đã chọn"
    const { subject, html } = interviewConfirmationEmail({
      candidateName: String(candidate.full_name),
      confirmedTime,
      meetingUrl: String(candidate.teams_meeting_url || ""),
    })
    await sendEmail({ to: String(candidate.email), subject, html, candidateId: String(candidate.id), templateName: "interview-confirmation" })
  }

  return NextResponse.json({ success: true, response })
}
