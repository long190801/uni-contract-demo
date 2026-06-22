import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { session_id, interviewer_ids } = await req.json()

  const { data: session } = await supabase
    .from("interview_sessions")
    .select("*, candidates(full_name)")
    .eq("id", session_id)
    .single()

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })

  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  const results = []

  for (const interviewerId of (interviewer_ids as string[])) {
    const { data: interviewer } = await supabase
      .from("interviewers")
      .select("*")
      .eq("id", interviewerId)
      .single()

    if (!interviewer) continue

    const { data: eval_ } = await supabase
      .from("interview_evaluations")
      .insert({ session_id, interviewer_id: interviewerId })
      .select()
      .single()

    if (!eval_) continue

    const formUrl = `${appUrl}/public/danh-gia/${eval_.eval_token}`
    const candidateName = (session.candidates as { full_name?: string })?.full_name || ""

    await sendEmail({
      to: interviewer.email,
      subject: `UNI_Form đánh giá phỏng vấn: ${candidateName}`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px">
  <p>Kính gửi ${interviewer.name},</p>
  <p>Vui lòng điền form đánh giá cho buổi phỏng vấn với ứng viên <strong>${candidateName}</strong>:</p>
  <p><a href="${formUrl}" style="background:#0076D7;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Điền form đánh giá</a></p>
  <p><em>Link có hiệu lực trong 7 ngày.</em></p>
</div>`,
      templateName: "evaluation-form",
    })

    results.push({ eval_id: eval_.id, interviewer_id: interviewerId, form_url: formUrl })
  }

  return NextResponse.json({ sent: results.length, results })
}
