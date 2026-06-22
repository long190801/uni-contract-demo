import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import { rejectionAfterOnlineEmail, rejectionAfterInPersonEmail } from "@/lib/email/templates/rejection"
import { offerLetterEmail } from "@/lib/email/templates/offer-letter"
import { sendWebhookNotification } from "@/lib/teams/webhook"

type ActionType = "Tiến Online" | "Tiến Trực tiếp" | "Gửi Offer" | "Từ chối Online" | "Từ chối Trực tiếp" | "Nhận việc"

const STATUS_MAP: Record<ActionType, string> = {
  "Tiến Online":         "Phỏng vấn Online",
  "Tiến Trực tiếp":     "Phỏng vấn Trực tiếp",
  "Gửi Offer":          "Offer",
  "Từ chối Online":     "Từ chối Online",
  "Từ chối Trực tiếp": "Từ chối Trực tiếp",
  "Nhận việc":          "Đã nhận việc",
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { candidate_id, action_type, decided_by, offer_salary, offer_start_date } = body as {
    candidate_id: string
    action_type: ActionType
    decided_by: string
    offer_salary?: string
    offer_start_date?: string
  }

  const { data: candidate } = await supabase
    .from("candidates")
    .select("*, job_postings(title, office)")
    .eq("id", candidate_id)
    .single()

  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

  const newStatus = STATUS_MAP[action_type]
  await supabase.from("candidates").update({ status: newStatus }).eq("id", candidate_id)
  await supabase.from("approval_actions").insert({
    candidate_id,
    action_type,
    decided_by,
    decided_at: new Date().toISOString(),
  })

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const job = candidate.job_postings as Record<string, string> | null

  // Send appropriate emails
  if (action_type === "Từ chối Online" && candidate.email) {
    const { subject, html } = rejectionAfterOnlineEmail(candidate.full_name)
    await sendEmail({ to: candidate.email, subject, html, candidateId: candidate_id, templateName: "rejection-online" })
  }

  if (action_type === "Từ chối Trực tiếp" && candidate.email) {
    const { subject, html } = rejectionAfterInPersonEmail(candidate.full_name)
    await sendEmail({ to: candidate.email, subject, html, candidateId: candidate_id, templateName: "rejection-inperson" })
  }

  if (action_type === "Gửi Offer" && candidate.email) {
    const { subject, html } = offerLetterEmail({
      candidateName: candidate.full_name,
      position: job?.title || "—",
      office: job?.office || "—",
      startDate: offer_start_date || "Thỏa thuận",
      salary: offer_salary || "Thỏa thuận",
      responseUrl: `${appUrl}/public/phong-van/offer-${candidate_id}`,
    })
    await sendEmail({ to: candidate.email, subject, html, candidateId: candidate_id, templateName: "offer-letter" })
  }

  // Teams notification for major actions
  if (["Tiến Trực tiếp", "Gửi Offer", "Nhận việc"].includes(action_type)) {
    await sendWebhookNotification(
      "recruitment",
      `Cập nhật ứng viên: ${candidate.full_name}`,
      `${action_type}: ${candidate.full_name} — ${job?.title || ""}`,
      [{ name: "Điểm CV", value: String(candidate.cv_score || "—") }],
      `${appUrl}/tuyen-dung/${candidate_id}`
    )
  }

  // If hired, create employee record
  if (action_type === "Nhận việc") {
    await supabase.from("employees").insert({
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
      position: job?.title || null,
      office: (job?.office as "HCM" | "HN") || null,
      status: "Thử việc",
      probation_start_date: offer_start_date || null,
    })
  }

  return NextResponse.json({ success: true, status: newStatus })
}
