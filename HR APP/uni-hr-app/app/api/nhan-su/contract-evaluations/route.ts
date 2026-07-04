import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import {
  fetchEvaluators,
  announceRenewalToEvalChannel,
  dmRenewalToEvaluators,
  type RenewalEmployee,
} from "@/lib/contracts/renewal-eval"

// GET ?employee_id=… → danh sách đánh giá tái ký đã lưu của nhân viên (mới nhất trước).
export async function GET(req: NextRequest) {
  const employeeId = req.nextUrl.searchParams.get("employee_id")
  if (!employeeId) return NextResponse.json({ error: "Thiếu employee_id" }, { status: 400 })

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("contract_evaluations")
    .select(
      "id, evaluator_id, evaluator_name, evaluator_email, contract_type, contract_end_date, scores, overall_score, recommendation, strengths, weaknesses, comments, sent_at, submitted_at, created_at"
    )
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evaluations: data || [] })
}

// POST { employee_id } → đăng 1 thông báo song ngữ Việt–Hàn lên channel Teams "Evaluation 2"
// (kèm link form đánh giá chung). Danh sách người đánh giá đã gán chỉ để gợi ý trong tin nhắn.
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { employee_id } = await req.json()
  if (!employee_id) return NextResponse.json({ error: "Thiếu employee_id" }, { status: 400 })

  const { data: emp, error } = await supabase
    .from("employees")
    .select(
      "id, full_name, position, office, contract_type, contract_end_date, evaluator_ids, staff_code, attendance_records(*)"
    )
    .eq("id", employee_id)
    .single()

  if (error || !emp) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 })
  if (!emp.contract_end_date)
    return NextResponse.json({ error: "Nhân viên chưa có ngày hết hạn hợp đồng" }, { status: 400 })

  const evaluatorIds = Array.isArray(emp.evaluator_ids) ? (emp.evaluator_ids as string[]) : []
  const evaluators = evaluatorIds.length ? await fetchEvaluators(supabase, evaluatorIds) : []
  const names = evaluators.map((e) => e.full_name)

  const posted = await announceRenewalToEvalChannel(emp as RenewalEmployee, names)
  // Gửi DM riêng cho từng người đánh giá đã gán (best-effort; bỏ qua nếu chưa cấu hình flow DM).
  const dmed = await dmRenewalToEvaluators(emp as RenewalEmployee, evaluators)

  // Ghi renewal_reminders (đánh dấu đã thông báo cho chu kỳ HĐ này) — để cron KHÔNG gửi trùng
  // sau khi đã bấm nút thủ công. Idempotent: chỉ tạo nếu chưa có bản ghi chưa-resolved.
  const endDate = emp.contract_end_date as string
  const daysLeft = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000)
  const { data: existingReminder } = await supabase
    .from("renewal_reminders")
    .select("id, notified_at")
    .eq("employee_id", emp.id)
    .eq("contract_end_date", endDate)
    .eq("is_resolved", false)
    .maybeSingle()
  if (!existingReminder) {
    await supabase.from("renewal_reminders").insert({
      employee_id: emp.id,
      contract_end_date: endDate,
      days_before: daysLeft,
      reminder_type: "contract-renewal",
      notified_at: new Date().toISOString(),
      is_resolved: false,
    })
  } else if (!existingReminder.notified_at) {
    await supabase
      .from("renewal_reminders")
      .update({ notified_at: new Date().toISOString(), days_before: daysLeft })
      .eq("id", existingReminder.id)
  }

  return NextResponse.json({ posted, dmed, evaluators: names })
}
