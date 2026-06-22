import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendWebhookNotification } from "@/lib/teams/webhook"

function verifyCron(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServerClient()
  const today = new Date()

  // Fetch active employees with upcoming contract end dates
  const in30 = new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0]
  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, contract_type, contract_end_date, office")
    .eq("status", "Đang làm việc")
    .not("contract_end_date", "is", null)
    .gte("contract_end_date", today.toISOString().split("T")[0])
    .lte("contract_end_date", in30)

  let notified = 0
  for (const emp of employees || []) {
    const daysLeft = Math.ceil((new Date(emp.contract_end_date!).getTime() - today.getTime()) / 86400000)
    const threshold = emp.contract_type === "HĐLĐ" ? 30 : 15
    if (daysLeft <= threshold) {
      await sendWebhookNotification(
        "recruitment",
        `⚠️ Hợp đồng sắp hết hạn: ${emp.full_name}`,
        `Hợp đồng ${emp.contract_type} còn ${daysLeft} ngày (${emp.contract_end_date})`,
        [{ name: "Văn phòng", value: emp.office || "—" }]
      )
      notified++
    }
  }

  return NextResponse.json({ notified })
}
