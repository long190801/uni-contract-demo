import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { renewalThresholdDays, RENEWAL_CONTRACT_TYPES } from "@/lib/contracts/config"
import {
  fetchEvaluators,
  announceRenewalToEvalChannel,
  dmRenewalToEvaluators,
  type RenewalEmployee,
} from "@/lib/contracts/renewal-eval"

function verifyCron(req: NextRequest) {
  return req.headers.get("Authorization") === `Bearer ${process.env.CRON_SECRET}`
}

// Chủ động: tìm nhân viên sắp hết hạn HĐ → đăng 1 thông báo SONG NGỮ Việt–Hàn lên channel
// Teams "Evaluation 2" (kèm link form đánh giá chung). Idempotent theo chu kỳ HĐ: mỗi
// (nhân viên + ngày hết hạn) chỉ đăng 1 lần nhờ bảng renewal_reminders (dù cron chạy mỗi ngày).
async function run() {
  const supabase = createServerClient()
  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]
  // Cửa sổ rộng nhất = 30 ngày (ngưỡng HĐLĐ). Ngưỡng cụ thể lọc trong vòng lặp.
  const in30 = new Date(today.getTime() + 30 * 86400000).toISOString().split("T")[0]

  const { data: employees } = await supabase
    .from("employees")
    .select(
      "id, full_name, position, office, contract_type, contract_end_date, evaluator_ids, status, work_status, staff_code, attendance_records(*)"
    )
    .in("contract_type", RENEWAL_CONTRACT_TYPES)
    .not("contract_end_date", "is", null)
    .gte("contract_end_date", todayStr)
    .lte("contract_end_date", in30)

  let notified = 0

  for (const emp of employees || []) {
    // Bỏ qua người đã nghỉ việc.
    if (String(emp.status ?? "").startsWith("Nghỉ việc") || emp.work_status === "Đã nghỉ việc") continue
    const endDate = emp.contract_end_date as string
    const daysLeft = Math.ceil((new Date(endDate).getTime() - today.getTime()) / 86400000)
    // Ngưỡng theo loại HĐ: HĐLĐ 30 ngày, Thử việc/CTV 15 ngày (loại khác bỏ qua).
    const threshold = renewalThresholdDays(emp.contract_type)
    if (threshold == null || daysLeft > threshold) continue

    // Đã xử lý chu kỳ HĐ này chưa? (renewal_reminders chưa resolved + đã notified)
    const { data: existingReminder } = await supabase
      .from("renewal_reminders")
      .select("id, notified_at")
      .eq("employee_id", emp.id)
      .eq("contract_end_date", endDate)
      .eq("is_resolved", false)
      .maybeSingle()
    if (existingReminder?.notified_at) continue

    // Đã có người NỘP đánh giá cho chu kỳ HĐ này rồi → coi như đang được xử lý, bỏ qua nhắc
    // (tránh nhắc lại người đã đánh giá xong, kể cả khi post nhắc trước đó tạo bằng nút thủ công
    // nên không để lại renewal_reminders). Ghi luôn 1 bản ghi đã-notified để cron sau bỏ qua nhanh.
    const { count: submittedCount } = await supabase
      .from("contract_evaluations")
      .select("id", { count: "exact", head: true })
      .eq("employee_id", emp.id)
      .eq("contract_end_date", endDate)
      .not("submitted_at", "is", null)
    if (submittedCount && submittedCount > 0) {
      if (!existingReminder) {
        await supabase.from("renewal_reminders").insert({
          employee_id: emp.id,
          contract_end_date: endDate,
          days_before: daysLeft,
          reminder_type: "contract-renewal",
          notified_at: new Date().toISOString(),
          is_resolved: false,
        })
      }
      continue
    }

    // 1) Đăng thông báo song ngữ lên channel Evaluation 2 (kèm danh sách người đánh giá đã gán).
    const evaluatorIds = Array.isArray(emp.evaluator_ids) ? (emp.evaluator_ids as string[]) : []
    const evaluators = evaluatorIds.length ? await fetchEvaluators(supabase, evaluatorIds) : []
    await announceRenewalToEvalChannel(
      emp as RenewalEmployee,
      evaluators.map((e) => e.full_name)
    )
    // 1b) Gửi DM riêng cho từng người đánh giá đã gán (qua flow DM theo email — best-effort,
    //     tự bỏ qua nếu chưa cấu hình TEAMS_EVALUATION_DM_WEBHOOK_URL).
    await dmRenewalToEvaluators(emp as RenewalEmployee, evaluators)

    // 2) Ghi nhận đã xử lý chu kỳ này (cron ngày sau bỏ qua)
    if (existingReminder?.id) {
      await supabase
        .from("renewal_reminders")
        .update({ notified_at: new Date().toISOString(), days_before: daysLeft })
        .eq("id", existingReminder.id)
    } else {
      await supabase.from("renewal_reminders").insert({
        employee_id: emp.id,
        contract_end_date: endDate,
        days_before: daysLeft,
        reminder_type: "contract-renewal",
        notified_at: new Date().toISOString(),
        is_resolved: false,
      })
    }
    notified++
  }

  return { notified }
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json(await run())
}

// Vercel Cron gọi bằng GET — hỗ trợ cả hai.
export async function GET(req: NextRequest) {
  if (!verifyCron(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json(await run())
}
