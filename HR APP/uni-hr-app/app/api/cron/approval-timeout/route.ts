import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendWebhookNotification } from "@/lib/teams/webhook"

function verifyCron(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerClient()
  const { data: overdueActions } = await supabase
    .from("approval_actions")
    .select("id, candidate_id, action_type, candidates(full_name)")
    .lt("deadline_at", new Date().toISOString())
    .eq("reminder_sent", false)
    .is("decided_at", null)

  let reminded = 0
  for (const action of overdueActions || []) {
    const candidateName = (action.candidates as { full_name?: string } | null)?.full_name || "—"
    await sendWebhookNotification(
      "recruitment",
      `⏰ Chờ duyệt quá 48h: ${candidateName}`,
      `Yêu cầu "${action.action_type}" cho ứng viên ${candidateName} chưa được xử lý`,
      [],
      `${process.env.NEXTAUTH_URL}/tuyen-dung/${action.candidate_id}`,
      "Xem hồ sơ"
    )
    await supabase.from("approval_actions").update({ reminder_sent: true }).eq("id", action.id)
    reminded++
  }

  return NextResponse.json({ reminded })
}
