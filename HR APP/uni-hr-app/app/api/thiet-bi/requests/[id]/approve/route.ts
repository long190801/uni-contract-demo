import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()
  const { action, approved_by, rejection_reason } = await req.json()

  const newStatus = action === "approve" ? "Đã duyệt" : "Từ chối"

  const { data: req_ } = await supabase.from("equipment_requests").select("*").eq("id", id).single()
  if (!req_) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("equipment_requests")
    .update({
      status: newStatus,
      approved_by,
      approved_at: new Date().toISOString(),
      rejection_reason: rejection_reason || null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If approving equipment assignment, update equipment status
  if (action === "approve" && req_.equipment_id) {
    if (req_.request_type === "Xin cấp mới" || req_.request_type === "Đổi người dùng") {
      await supabase.from("equipment_items").update({
        status: "Đang sử dụng",
        current_user_id: req_.requested_by_employee,
        assigned_date: new Date().toISOString().split("T")[0],
      }).eq("id", req_.equipment_id)
    }
    if (req_.request_type === "Trả/thu hồi") {
      await supabase.from("equipment_items").update({
        status: "Trong kho",
        current_user_id: null,
        assigned_date: null,
      }).eq("id", req_.equipment_id)
    }
    if (req_.request_type === "Thiết bị hư hỏng") {
      await supabase.from("equipment_items").update({ status: "Đang sửa chữa" }).eq("id", req_.equipment_id)
    }

    // Log history
    await supabase.from("equipment_history").insert({
      equipment_id: req_.equipment_id,
      request_id: id,
      action: req_.request_type,
      to_user_id: req_.requested_by_employee,
      action_date: new Date().toISOString().split("T")[0],
      performed_by: approved_by,
    })
  }

  return NextResponse.json(data)
}
