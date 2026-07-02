// Quy tắc tính hiệu suất chấm công (Văn phòng Hà Nội) — nguồn sự thật duy nhất.
//
// - Giờ làm mặc định: 08:00–17:00. Ngoại lệ (làm 08:30–17:30): Phí Đăng Long
//   (HN00009) và Nguyễn Thị Khánh Linh (HN00030).
// - Đi muộn: giờ vào (check_in) > giờ vào chuẩn + 10 phút.
// - OT: giờ ra cuối (check_out) > giờ tan + 15 phút. Số giờ OT tính từ mốc
//   (giờ tan + 15 phút).
// - Ngày công: mỗi bản ghi chấm công là 1 ngày công.
// - Giờ làm/ngày dùng cột work_hours (đã trừ nghỉ trưa 12:00–13:00).

import type { AttendanceRecord } from "@/types/database"

const LATE_GRACE_MIN = 10
const OT_GRACE_MIN = 15

// Nhân viên có lịch 08:30–17:30 (theo staff_code chuẩn, đã chuẩn hóa bỏ ký tự đặc biệt)
const LATE_SCHEDULE_CODES = new Set(["HN00009", "HN00030"])

function normCode(code: string | null | undefined): string {
  if (!code) return ""
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

/** Trả về {start, end} tính bằng phút kể từ 00:00 theo lịch của nhân viên. */
function schedule(staffCode: string | null | undefined) {
  const special = LATE_SCHEDULE_CODES.has(normCode(staffCode))
  return {
    start: 8 * 60 + (special ? 30 : 0),
    end: 17 * 60 + (special ? 30 : 0),
  }
}

/** "HH:MM[:SS]" -> số phút kể từ 00:00, hoặc null nếu không hợp lệ. */
function toMinutes(t: string | null | undefined): number | null {
  if (!t) return null
  const m = /^(\d{1,2}):(\d{2})/.exec(t.trim())
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

export interface AttendanceMetrics {
  work_days: number
  total_hours: number
  avg_hours_per_day: number
  late_count: number
  late_rate: number // %
  ot_days: number
  ot_hours: number
  ot_rate: number // % (số ngày OT / ngày công)
}

export interface MonthlyAttendance extends AttendanceMetrics {
  month: string // "YYYY-MM"
}

function emptyMetrics(): AttendanceMetrics {
  return {
    work_days: 0, total_hours: 0, avg_hours_per_day: 0,
    late_count: 0, late_rate: 0, ot_days: 0, ot_hours: 0, ot_rate: 0,
  }
}

function derive(m: {
  work_days: number; total_hours: number; late_count: number; ot_days: number; ot_hours: number
}): AttendanceMetrics {
  return {
    work_days: m.work_days,
    total_hours: m.total_hours,
    avg_hours_per_day: m.work_days > 0 ? m.total_hours / m.work_days : 0,
    late_count: m.late_count,
    late_rate: m.work_days > 0 ? (m.late_count / m.work_days) * 100 : 0,
    ot_days: m.ot_days,
    ot_hours: m.ot_hours,
    ot_rate: m.work_days > 0 ? (m.ot_days / m.work_days) * 100 : 0,
  }
}

/**
 * Tính chỉ số chấm công theo từng tháng + tổng hợp, từ các bản ghi theo ngày.
 * staffCode dùng để xác định lịch làm việc (08:00 hay 08:30).
 */
export function computeAttendance(
  records: AttendanceRecord[],
  staffCode: string | null | undefined
): { monthly: MonthlyAttendance[]; total: AttendanceMetrics } {
  const { start, end } = schedule(staffCode)
  const byMonth = new Map<string, { work_days: number; total_hours: number; late_count: number; ot_days: number; ot_hours: number }>()

  for (const r of records) {
    if (!r.record_date) continue
    const month = r.record_date.slice(0, 7) // "YYYY-MM"
    const acc = byMonth.get(month) ?? { work_days: 0, total_hours: 0, late_count: 0, ot_days: 0, ot_hours: 0 }

    acc.work_days += 1
    acc.total_hours += typeof r.work_hours === "number" ? r.work_hours : 0

    const inMin = toMinutes(r.check_in)
    if (inMin !== null && inMin > start + LATE_GRACE_MIN) acc.late_count += 1

    const outMin = toMinutes(r.check_out)
    if (outMin !== null && outMin > end + OT_GRACE_MIN) {
      acc.ot_days += 1
      acc.ot_hours += (outMin - (end + OT_GRACE_MIN)) / 60
    }

    byMonth.set(month, acc)
  }

  const monthly: MonthlyAttendance[] = [...byMonth.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, m]) => ({ month, ...derive(m) }))

  const totalRaw = monthly.reduce(
    (a, m) => ({
      work_days: a.work_days + m.work_days,
      total_hours: a.total_hours + m.total_hours,
      late_count: a.late_count + m.late_count,
      ot_days: a.ot_days + m.ot_days,
      ot_hours: a.ot_hours + m.ot_hours,
    }),
    { work_days: 0, total_hours: 0, late_count: 0, ot_days: 0, ot_hours: 0 }
  )

  return {
    monthly,
    total: monthly.length ? derive(totalRaw) : emptyMetrics(),
  }
}
