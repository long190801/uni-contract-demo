import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendWebhookNotification } from "@/lib/teams/webhook"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  let query = supabase
    .from("equipment_requests")
    .select(`
      *,
      equipment_items(name, equipment_code, category),
      employees!requested_by_employee(full_name, staff_code)
    `)
    .order("requested_at", { ascending: false })

  if (status) query = query.eq("status", status)
  if (type) query = query.eq("request_type", type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase.from("equipment_requests").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify via Teams webhook
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  await sendWebhookNotification(
    "equipment",
    `Yêu cầu thiết bị mới: ${body.request_type}`,
    `Có yêu cầu mới cần xử lý`,
    [{ name: "Loại yêu cầu", value: body.request_type }],
    `${appUrl}/thiet-bi/yeu-cau`
  )

  return NextResponse.json(data, { status: 201 })
}
