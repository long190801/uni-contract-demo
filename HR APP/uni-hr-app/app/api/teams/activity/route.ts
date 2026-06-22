import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getTeamsActivityReport } from "@/lib/graph/activity"

function verifyCron(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerClient()
  const records = await getTeamsActivityReport()

  // Get employees with teams_user_id mapped
  const { data: employees } = await supabase
    .from("employees")
    .select("id, teams_user_id, teams_email, email")

  const emailToEmployeeId: Record<string, string> = {}
  for (const emp of employees || []) {
    if (emp.teams_email) emailToEmployeeId[emp.teams_email.toLowerCase()] = emp.id
    if (emp.email) emailToEmployeeId[emp.email.toLowerCase()] = emp.id
  }

  const now = new Date()
  const snapshotMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  let saved = 0

  for (const record of records) {
    const empId = emailToEmployeeId[record.userPrincipalName.toLowerCase()]
    if (!empId) continue

    await supabase.from("teams_activity_snapshots").upsert(
      {
        employee_id: empId,
        snapshot_month: snapshotMonth,
        messages_sent: record.teamChatMessageCount + record.privateChatMessageCount,
        meetings_attended: record.meetingCount,
        call_minutes: Math.round(record.meetingMinutes),
        active_days: record.activeDaysInReportingPeriod,
        channel_messages: record.teamChatMessageCount,
        chat_messages: record.privateChatMessageCount,
      },
      { onConflict: "employee_id,snapshot_month" }
    )
    saved++
  }

  return NextResponse.json({ saved, total: records.length })
}
