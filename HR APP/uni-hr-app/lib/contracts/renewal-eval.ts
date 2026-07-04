// Đánh giá tái ký hợp đồng — tiện ích dùng chung cho cron (tự động) và route gửi thủ công.
//
// Luồng: nhân viên sắp hết hạn HĐ → với mỗi người đánh giá (employees.evaluator_ids)
// tạo 1 form token (bảng contract_evaluations) → gửi link cho họ qua Teams (webhook card có
// nút "Điền form" + DM nếu có access token) và email. Người đánh giá mở link, chấm điểm,
// đề xuất Tái ký / Không tái ký / Xem xét thêm.

import type { createServerClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/resend"
import { sendWebhookNotification, sendEvaluationDM } from "@/lib/teams/webhook"
import { sendTeamsDM, sendTeamsChannelMessage } from "@/lib/graph/messages"
import { fmtDate } from "@/lib/format"
import { computeAttendance } from "@/lib/nhan-su/attendance"
import type { AttendanceRecord } from "@/types/database"
import {
  generalFormUrl,
  contractTypeKo,
  SCORE_CRITERIA,
  RECOMMENDATIONS,
} from "@/lib/contracts/renewal-eval-form"

type Supabase = ReturnType<typeof createServerClient>

export interface RenewalEmployee {
  id: string
  full_name: string
  position?: string | null
  office?: string | null
  contract_type?: string | null
  contract_end_date?: string | null
  evaluator_ids?: string[] | null
  staff_code?: string | null
  attendance_records?: AttendanceRecord[] | null
}

export interface EvaluatorLite {
  id: string
  full_name: string
  email: string | null
  teams_user_id: string | null
}

export interface RenewalForm {
  id: string
  eval_token: string
  evaluator: EvaluatorLite
  formUrl: string
  isNew: boolean
}

export function renewalFormUrl(token: string): string {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${appUrl}/public/danh-gia-hop-dong/${token}`
}

// 4 chỉ số chấm công/hiệu suất (cùng công thức với tab Hiệu suất hồ sơ nhân viên) — cho
// người đánh giá tham khảo dữ liệu khách quan trước khi chấm điểm. Bỏ qua nếu chưa có
// attendance_records (không lấy được cột này, hoặc nhân viên chưa có dữ liệu chấm công).
function attendanceFacts(employee: RenewalEmployee): { name: string; value: string }[] {
  const records = employee.attendance_records || []
  if (!records.length) return []
  const { total } = computeAttendance(records, employee.staff_code)
  const f2 = (n: number) => n.toFixed(2)
  return [
    { name: "⏱️ Giờ TB/ngày / 평균 근무시간", value: `${f2(total.avg_hours_per_day)} giờ` },
    { name: "🔴 Đi muộn / 지각", value: `${total.late_count} lần (${f2(total.late_rate)}%)` },
    { name: "🌙 Giờ OT / 초과근무", value: `${f2(total.ot_hours)} giờ (${total.ot_days} ngày)` },
    { name: "📈 Tỉ lệ OT / 비율", value: `${f2(total.ot_rate)}%` },
  ]
}

// ---- Luồng MỚI: đăng 1 thông báo SONG NGỮ Việt–Hàn lên channel Teams "Evaluation 2" ----
// Qua Incoming Webhook (env TEAMS_EVALUATION_WEBHOOK_URL) nên chạy được cả từ cron
// (không cần phiên đăng nhập). Nút bấm trỏ tới FORM CHUNG (generalFormUrl) — mọi người
// đánh giá dùng chung 1 link, tự chọn mình + nhân viên khi mở form. Best-effort.
// Người LUÔN được @mention trong thông báo tái ký (post nhắc hẹn + comment kết quả):
// sếp BYUN + Lê Ngọc Huy. id = email/UPN (Teams giải ra đúng người để gửi thông báo).
export const ALWAYS_TAG_MENTIONS = [
  { id: "byun@eximuni.com", name: "SANG HYUN BYUN" },
  { id: "huy@eximuni.com", name: "Lê Ngọc Huy" },
]

export async function announceRenewalToEvalChannel(
  employee: RenewalEmployee,
  evaluatorNames: string[]
): Promise<boolean> {
  const endDateStr = employee.contract_end_date ? fmtDate(employee.contract_end_date) : "—"
  const typeVi = employee.contract_type || "HĐLĐ"
  const typeKo = contractTypeKo(employee.contract_type)
  const names = evaluatorNames.length ? evaluatorNames.join(", ") : "—"

  const title = `📝 Đánh giá tái ký hợp đồng / 계약 재계약 평가: ${employee.full_name}`
  // Giữ nguyên cụm "sắp hết hạn" — flow Power Automate #3 (reply kết quả) lọc đúng post
  // gốc bằng cách tìm cụm này CỘNG tên nhân viên (xem docs/teams-webhook-flow.md, Phần 3).
  // Bỏ cụm này sẽ làm mọi kết quả đánh giá rơi vào nhánh "không tìm thấy" → đăng post rời,
  // không reply đúng thread.
  const text =
    `🇻🇳 Hợp đồng sắp hết hạn — đề nghị hoàn thành đánh giá tái ký.\n\n` +
    `🇰🇷 계약이 곧 만료됩니다 — 재계약 평가를 완료해 주시기 바랍니다.`
  const facts = [
    { name: "Nhân viên / 직원", value: employee.full_name },
    { name: "Loại HĐ / 계약 유형", value: `${typeVi} / ${typeKo}` },
    { name: "Ngày hết hạn / 만료일", value: endDateStr },
    { name: "Người đánh giá / 평가자", value: names },
    ...attendanceFacts(employee),
  ]

  try {
    await sendWebhookNotification(
      "evaluation",
      title,
      text,
      facts,
      generalFormUrl(),
      "Điền form đánh giá tái ký / 재계약 평가 양식 작성",
      ALWAYS_TAG_MENTIONS
    )
    return true
  } catch {
    return false
  }
}

// Gửi TIN NHẮN RIÊNG (DM) song ngữ Việt–Hàn tới từng người đánh giá đã gán cho nhân viên
// (employees.evaluator_ids), theo EMAIL, qua flow DM riêng (env TEAMS_EVALUATION_DM_WEBHOOK_URL).
// Đi kèm luôn với post channel — mỗi người đánh giá nhận riêng lời nhắc + link form chung.
// Best-effort: bỏ qua nếu chưa cấu hình flow DM hoặc không ai có email.
export async function dmRenewalToEvaluators(
  employee: RenewalEmployee,
  evaluators: EvaluatorLite[]
): Promise<boolean> {
  const emails = evaluators
    .map((e) => e.email)
    .filter((e): e is string => !!e && e.includes("@"))
  if (emails.length === 0) return false

  const endDateStr = employee.contract_end_date ? fmtDate(employee.contract_end_date) : "—"
  const typeVi = employee.contract_type || "HĐLĐ"
  const typeKo = contractTypeKo(employee.contract_type)

  const title = `📝 Yêu cầu đánh giá tái ký / 재계약 평가 요청: ${employee.full_name}`
  const text =
    `🇻🇳 Bạn được đề nghị đánh giá tái ký cho ${employee.full_name}. Vui lòng mở form đánh giá.\n\n` +
    `🇰🇷 ${employee.full_name}님에 대한 재계약 평가를 요청드립니다. 양식을 열어 완료해 주시기 바랍니다.`
  const facts = [
    { name: "Nhân viên / 직원", value: employee.full_name },
    { name: "Loại HĐ / 계약 유형", value: `${typeVi} / ${typeKo}` },
    { name: "Ngày hết hạn / 만료일", value: endDateStr },
    ...attendanceFacts(employee),
  ]

  try {
    return await sendEvaluationDM(
      emails,
      title,
      text,
      facts,
      generalFormUrl(),
      "Điền form đánh giá tái ký / 재계약 평가 양식 작성"
    )
  } catch {
    return false
  }
}

// Emoji theo đề xuất — hiển thị trực quan trong card kết quả (Adaptive Card không tô màu
// chữ tùy ý nên dùng emoji thay cho màu xanh/vàng/đỏ).
const RECO_EMOJI: Record<string, string> = {
  "Tái ký": "✅",
  "Xem xét thêm": "🟡",
  "Không tái ký": "❌",
}

// Dựng nội dung card KẾT QUẢ đánh giá (song ngữ Việt–Hàn) — dùng chung cho reply vào post
// gốc lẫn fallback đăng post mới. Điểm từng tiêu chí + điểm TB + đề xuất nằm ở FactSet;
// điểm mạnh / cần cải thiện / nhận xét nằm ở phần chữ (chỉ hiện khi có nội dung).
export function buildEvaluationResultCard(args: {
  employeeName: string
  evaluatorName: string
  contractEndDate?: string | null
  scores?: Record<string, number> | null
  overallScore?: number | null
  recommendation?: string | null
  strengths?: string | null
  weaknesses?: string | null
  comments?: string | null
}): { title: string; text: string; facts: { name: string; value: string }[] } {
  const endDateStr = args.contractEndDate ? fmtDate(args.contractEndDate) : "—"
  const reco = (args.recommendation || "").trim()
  const recoKo = RECOMMENDATIONS.find((r) => r.value === reco)?.ko || ""
  const emoji = RECO_EMOJI[reco] || ""

  const title = `✅ Kết quả đánh giá tái ký / 재계약 평가 결과: ${args.employeeName}`

  const sections: string[] = []
  const addSection = (label: string, val?: string | null) => {
    const v = String(val ?? "").trim()
    if (v) sections.push(`**${label}**\n${v}`)
  }
  addSection("Điểm mạnh / 강점", args.strengths)
  addSection("Điểm cần cải thiện / 개선할 점", args.weaknesses)
  addSection("Nhận xét chung / 종합 의견", args.comments)
  const text = sections.join("\n\n")

  const facts: { name: string; value: string }[] = [
    { name: "Người đánh giá / 평가자", value: args.evaluatorName },
  ]
  const sc = args.scores || {}
  for (const c of SCORE_CRITERIA) {
    const v = sc[c.key]
    if (v != null) facts.push({ name: `${c.viShort} / ${c.koShort}`, value: `${v}/10` })
  }
  facts.push({
    name: "★ Điểm TB / 평균",
    value: args.overallScore != null ? `${args.overallScore}/10` : "—",
  })
  facts.push({
    name: "► Đề xuất / 제안",
    value: `${emoji} ${reco || "—"}${recoKo ? ` / ${recoKo}` : ""}`.trim(),
  })
  facts.push({ name: "Ngày hết hạn / 만료일", value: endDateStr })

  return { title, text, facts }
}

// Bản HTML của card kết quả — để flow reply dùng action "Reply with a message in a channel"
// (nhận HTML, thread đúng dưới post gốc). Cùng dữ liệu với buildEvaluationResultCard.
export function buildEvaluationResultHtml(args: {
  employeeName: string
  evaluatorName: string
  contractEndDate?: string | null
  scores?: Record<string, number> | null
  overallScore?: number | null
  recommendation?: string | null
  strengths?: string | null
  weaknesses?: string | null
  comments?: string | null
}): string {
  const endDateStr = args.contractEndDate ? fmtDate(args.contractEndDate) : "—"
  const reco = (args.recommendation || "").trim()
  const recoKo = RECOMMENDATIONS.find((r) => r.value === reco)?.ko || ""
  const emoji = RECO_EMOJI[reco] || ""
  const esc = (s: unknown) =>
    String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  const sc = args.scores || {}
  const scoreRows = SCORE_CRITERIA.filter((c) => sc[c.key] != null)
    .map((c) => `<li>${esc(c.viShort)} / ${esc(c.koShort)}: <b>${sc[c.key]}/10</b></li>`)
    .join("")

  const section = (label: string, val?: string | null) => {
    const v = String(val ?? "").trim()
    return v ? `<p><b>${esc(label)}</b><br>${esc(v)}</p>` : ""
  }

  return (
    `<p><b>✅ Kết quả đánh giá tái ký / 재계약 평가 결과: ${esc(args.employeeName)}</b></p>` +
    `<p><b>Người đánh giá / 평가자</b>: ${esc(args.evaluatorName)}</p>` +
    (scoreRows ? `<p><b>Điểm theo tiêu chí / 항목별 점수</b></p><ul>${scoreRows}</ul>` : "") +
    `<p>★ <b>Điểm trung bình / 평균</b>: ${args.overallScore != null ? `${args.overallScore}/10` : "—"}<br>` +
    `► <b>Đề xuất / 제안</b>: ${emoji} ${esc(reco || "—")}${recoKo ? ` / ${esc(recoKo)}` : ""}<br>` +
    `<b>Ngày hết hạn / 만료일</b>: ${esc(endDateStr)}</p>` +
    section("Điểm mạnh / 강점", args.strengths) +
    section("Điểm cần cải thiện / 개선할 점", args.weaknesses) +
    section("Nhận xét chung / 종합 의견", args.comments)
  )
}

// Lấy danh sách người đánh giá đủ điều kiện (đang làm việc) từ evaluator_ids.
export async function fetchEvaluators(
  supabase: Supabase,
  evaluatorIds: string[]
): Promise<EvaluatorLite[]> {
  if (!evaluatorIds?.length) return []
  const { data } = await supabase
    .from("employees")
    .select("id, full_name, email, teams_user_id, status")
    .in("id", evaluatorIds)
  return (data || [])
    .filter((e) => e.status === "Đang làm việc")
    .map((e) => ({
      id: e.id,
      full_name: e.full_name,
      email: e.email ?? null,
      teams_user_id: e.teams_user_id ?? null,
    }))
}

// Tạo (hoặc lấy lại) form đánh giá cho từng người đánh giá theo đúng chu kỳ HĐ.
// Idempotent: nếu đã có form chưa nộp cho cùng (employee, evaluator, contract_end_date)
// thì dùng lại token cũ thay vì tạo mới — tránh trùng khi cron chạy lại / gửi thủ công nhiều lần.
export async function ensureRenewalEvalForms(
  supabase: Supabase,
  employee: RenewalEmployee,
  evaluators: EvaluatorLite[]
): Promise<RenewalForm[]> {
  const out: RenewalForm[] = []
  for (const ev of evaluators) {
    const { data: existing } = await supabase
      .from("contract_evaluations")
      .select("id, eval_token, submitted_at")
      .eq("employee_id", employee.id)
      .eq("evaluator_id", ev.id)
      .eq("contract_end_date", employee.contract_end_date as string)
      .is("submitted_at", null)
      .maybeSingle()

    let row = existing
    if (!row) {
      const { data: created } = await supabase
        .from("contract_evaluations")
        .insert({
          employee_id: employee.id,
          evaluator_id: ev.id,
          evaluator_name: ev.full_name,
          evaluator_email: ev.email,
          contract_type: employee.contract_type ?? null,
          contract_end_date: employee.contract_end_date ?? null,
        })
        .select("id, eval_token, submitted_at")
        .single()
      row = created
    }

    if (row) {
      out.push({
        id: row.id,
        eval_token: row.eval_token,
        evaluator: ev,
        formUrl: renewalFormUrl(row.eval_token),
        isNew: !existing,
      })
    }
  }
  return out
}

// Gửi thông báo cho 1 người đánh giá: Teams webhook card (luôn) + email (nếu có) +
// DM Teams (nếu truyền accessToken và evaluator có teams_user_id). Best-effort — không ném lỗi.
export async function notifyRenewalEvaluator(
  supabase: Supabase,
  employee: RenewalEmployee,
  form: RenewalForm,
  accessToken?: string
): Promise<void> {
  const ev = form.evaluator
  const endDateStr = employee.contract_end_date ? fmtDate(employee.contract_end_date) : "—"
  const title = `📝 Đánh giá tái ký HĐ: ${employee.full_name}`
  const text = `Kính gửi ${ev.full_name}, hợp đồng của ${employee.full_name} sắp hết hạn. Vui lòng hoàn thành form đánh giá để bộ phận Nhân sự quyết định tái ký.`
  const facts = [
    { name: "Nhân viên", value: employee.full_name },
    { name: "Vị trí", value: employee.position || "—" },
    { name: "Loại HĐ", value: employee.contract_type || "—" },
    { name: "Ngày hết hạn", value: endDateStr },
  ]

  // 1) Teams webhook (kênh HR) — card có nút bấm mở form
  await sendWebhookNotification("hr", title, text, facts, form.formUrl, "Điền form đánh giá").catch(
    () => {}
  )

  // 2) Email
  if (ev.email) {
    await sendEmail({
      to: ev.email,
      subject: `UNI_Đánh giá tái ký hợp đồng: ${employee.full_name}`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px">
  <p>Kính gửi ${ev.full_name},</p>
  <p>Hợp đồng của <strong>${employee.full_name}</strong> (${employee.contract_type || "HĐLĐ"}) sẽ hết hạn vào <strong>${endDateStr}</strong>.</p>
  <p>Vui lòng hoàn thành form đánh giá để bộ phận Nhân sự quyết định việc tái ký:</p>
  <p><a href="${form.formUrl}" style="background:#0076D7;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Điền form đánh giá tái ký</a></p>
  <p><em>Link có hiệu lực trong 14 ngày.</em></p>
</div>`,
      templateName: "contract-renewal-eval",
    }).catch(() => {})
  }

  // 3) Teams DM (chỉ khi có delegated access token + teams_user_id)
  let dmStatus: "Sent" | "Failed" = "Sent"
  if (accessToken && ev.teams_user_id) {
    try {
      await sendTeamsDM(
        ev.teams_user_id,
        `<p>Kính gửi ${ev.full_name}, hợp đồng của <b>${employee.full_name}</b> sắp hết hạn.</p><p>Ngày hết hạn: <b>${endDateStr}</b></p><p><a href="${form.formUrl}">👉 Điền form đánh giá tái ký</a></p>`,
        accessToken
      )
    } catch {
      dmStatus = "Failed"
    }
  }

  // 4) Ghi log + đánh dấu đã gửi (lỗi Supabase trả qua { error }, không ném)
  await supabase.from("teams_message_logs").insert({
    recipient_teams_id: ev.teams_user_id || null,
    message_type: "contract-renewal-eval",
    status: dmStatus,
  })
  await supabase
    .from("contract_evaluations")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", form.id)
}

// Đăng MỘT tin nhắn vào kênh Teams HR qua Microsoft Graph (không cần webhook).
// Dùng delegated token của HR (khi bấm gửi thủ công) hoặc token notifier (cron).
// Cần TEAMS_HR_TEAM_ID + TEAMS_HR_CHANNEL_ID (lấy từ link kênh Teams). Best-effort.
export async function announceRenewalToChannel(
  employee: RenewalEmployee,
  forms: RenewalForm[],
  accessToken: string
): Promise<boolean> {
  const teamId = process.env.TEAMS_HR_TEAM_ID
  const channelId = process.env.TEAMS_HR_CHANNEL_ID
  if (!teamId || !channelId || !accessToken || forms.length === 0) return false

  const endDateStr = employee.contract_end_date ? fmtDate(employee.contract_end_date) : "—"
  const rows = forms
    .map(
      (f) =>
        `<li><b>${f.evaluator.full_name}</b>: <a href="${f.formUrl}">Điền form đánh giá tái ký</a></li>`
    )
    .join("")
  const html =
    `<h3>📝 Đánh giá tái ký hợp đồng: ${employee.full_name}</h3>` +
    `<p>Hợp đồng ${employee.contract_type || "HĐLĐ"} sắp hết hạn (ngày hết hạn: <b>${endDateStr}</b>). ` +
    `Đề nghị những người đánh giá dưới đây hoàn thành form để bộ phận Nhân sự quyết định tái ký:</p>` +
    `<ul>${rows}</ul>`

  try {
    await sendTeamsChannelMessage(teamId, channelId, html, accessToken)
    return true
  } catch {
    return false
  }
}
