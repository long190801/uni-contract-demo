import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import { interviewInvitationEmail } from "@/lib/email/templates/interview-invitation"
import { sendWebhookNotification } from "@/lib/teams/webhook"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { candidate_id, interview_type, slot_1, slot_2, slot_3, teams_meeting_url } = body

  // Fetch candidate
  const { data: candidate } = await supabase
    .from("candidates")
    .select("*, job_postings(title)")
    .eq("id", candidate_id)
    .single()

  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

  // Create slot record
  const { data: slot, error } = await supabase
    .from("interview_slots")
    .insert({
      candidate_id,
      interview_type,
      slot_1,
      slot_2,
      slot_3,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update candidate status and meeting URL
  const newStatus = interview_type === "Online" ? "Mời PV Online" : "Mời PV Trực tiếp"
  await supabase.from("candidates").update({
    status: newStatus,
    teams_meeting_url: teams_meeting_url || null,
  }).eq("id", candidate_id)

  // Send email invitation
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const responseUrl = `${appUrl}/public/phong-van/${slot.response_token}`

  const formatSlot = (s: string) => format(new Date(s), "EEEE, dd/MM/yyyy HH:mm", { locale: vi })

  if (candidate.email) {
    const { subject, html } = interviewInvitationEmail({
      candidateName: candidate.full_name,
      position: (candidate.job_postings as { title?: string })?.title || "",
      slot1: slot_1 ? formatSlot(slot_1) : "",
      slot2: slot_2 ? formatSlot(slot_2) : "",
      slot3: slot_3 ? formatSlot(slot_3) : "",
      responseUrl,
      meetingUrl: teams_meeting_url,
    })
    await sendEmail({ to: candidate.email, subject, html, candidateId: candidate_id, templateName: "interview-invitation" })
  }

  // Teams notification
  await sendWebhookNotification(
    "recruitment",
    `Mời phỏng vấn: ${candidate.full_name}`,
    `Đã gửi thư mời phỏng vấn ${interview_type} cho ứng viên ${candidate.full_name}`,
    [
      { name: "Vị trí", value: (candidate.job_postings as { title?: string })?.title || "—" },
      { name: "Điểm CV", value: String(candidate.cv_score || "—") },
    ],
    `${appUrl}/tuyen-dung/${candidate_id}`,
    "Xem hồ sơ ứng viên"
  )

  await supabase.from("interview_slots").update({ invitation_sent_at: new Date().toISOString() }).eq("id", slot.id)

  return NextResponse.json({ slot, candidate: { ...candidate, status: newStatus } })
}
