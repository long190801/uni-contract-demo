"use client"

import { useState } from "react"
import { computeAttendance } from "@/lib/nhan-su/attendance"
import type { AttendanceRecord } from "@/types/database"

interface ActivitySnapshot {
  snapshot_month: string
  messages_sent: number
  meetings_attended: number
  call_minutes: number
  active_days: number
}

interface Props {
  employee: Record<string, unknown>
}

const f2 = (n: number) => n.toFixed(2)
const monthLabel = (m: string) => {
  const [y, mo] = m.split("-")
  return `T${parseInt(mo, 10)}/${y}`
}

export default function TabPerformance({ employee }: Props) {
  const snapshots = ((employee.teams_activity_snapshots as ActivitySnapshot[]) || [])
    .sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month))

  const records = (employee.attendance_records as AttendanceRecord[]) || []
  const { monthly, total } = computeAttendance(records, employee.staff_code as string | null)

  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    await fetch("/api/teams/sync-users", { method: "POST" })
    setSyncing(false)
    window.location.reload()
  }

  const firstMonth = monthly[0]?.month
  const lastMonth = monthly[monthly.length - 1]?.month

  return (
    <div className="space-y-8">
      {/* ============ CHẤM CÔNG / HIỆU SUẤT VĂN PHÒNG ============ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Chấm công &amp; hiệu suất văn phòng</h3>
          {monthly.length > 0 && (
            <span className="text-xs text-gray-500">
              {monthLabel(firstMonth!)}
              {lastMonth && lastMonth !== firstMonth ? ` – ${monthLabel(lastMonth)}` : ""} ·{" "}
              {monthly.length} tháng
            </span>
          )}
        </div>

        {monthly.length === 0 ? (
          <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-lg">
            <p>Chưa có dữ liệu chấm công</p>
            <p className="text-xs mt-1">Dữ liệu được cập nhật hàng tháng từ máy chấm công văn phòng</p>
          </div>
        ) : (
          <>
            {/* Thẻ tổng hợp toàn bộ các tháng */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: "⏱️",
                  value: f2(total.avg_hours_per_day),
                  unit: "giờ/ngày",
                  label: "Giờ làm TB/ngày",
                  sub: `${total.work_days} ngày công · ${f2(total.total_hours)} giờ`,
                  color: "text-blue-600",
                },
                {
                  icon: "🔴",
                  value: String(total.late_count),
                  unit: "lần",
                  label: "Đi muộn",
                  sub: `Tỉ lệ ${f2(total.late_rate)}%`,
                  color: "text-red-600",
                },
                {
                  icon: "🌙",
                  value: f2(total.ot_hours),
                  unit: "giờ",
                  label: "Tổng giờ OT",
                  sub: `${total.ot_days} ngày có OT`,
                  color: "text-amber-600",
                },
                {
                  icon: "📈",
                  value: f2(total.ot_rate),
                  unit: "%",
                  label: "Tỉ lệ OT / ngày công",
                  sub: `${total.ot_days}/${total.work_days} ngày`,
                  color: "text-emerald-600",
                },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-2xl mb-1">{m.icon}</p>
                  <p className={`text-2xl font-bold ${m.color}`}>
                    {m.value}
                    <span className="text-sm font-medium text-gray-400 ml-1">{m.unit}</span>
                  </p>
                  <p className="text-xs font-medium text-gray-600 mt-1">{m.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Bảng chi tiết từng tháng */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <th className="text-left px-3 py-2 font-medium">Tháng</th>
                    <th className="text-right px-3 py-2 font-medium">Ngày công</th>
                    <th className="text-right px-3 py-2 font-medium">Giờ TB/ngày</th>
                    <th className="text-right px-3 py-2 font-medium">Đi muộn</th>
                    <th className="text-right px-3 py-2 font-medium">Tỉ lệ muộn</th>
                    <th className="text-right px-3 py-2 font-medium">Giờ OT</th>
                    <th className="text-right px-3 py-2 font-medium">Tỉ lệ OT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {monthly
                    .slice()
                    .sort((a, b) => b.month.localeCompare(a.month))
                    .map((s) => (
                      <tr key={s.month} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-700">{monthLabel(s.month)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{s.work_days}</td>
                        <td className="px-3 py-2 text-right text-gray-800 font-medium">
                          {f2(s.avg_hours_per_day)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span className={s.late_count > 0 ? "text-red-600 font-medium" : "text-gray-400"}>
                            {s.late_count}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600">{f2(s.late_rate)}%</td>
                        <td className="px-3 py-2 text-right text-amber-700 font-medium">{f2(s.ot_hours)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{f2(s.ot_rate)}%</td>
                      </tr>
                    ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold text-gray-800 border-t-2 border-gray-200">
                    <td className="px-3 py-2">Tổng hợp</td>
                    <td className="px-3 py-2 text-right">{total.work_days}</td>
                    <td className="px-3 py-2 text-right">{f2(total.avg_hours_per_day)}</td>
                    <td className="px-3 py-2 text-right text-red-600">{total.late_count}</td>
                    <td className="px-3 py-2 text-right">{f2(total.late_rate)}%</td>
                    <td className="px-3 py-2 text-right text-amber-700">{f2(total.ot_hours)}</td>
                    <td className="px-3 py-2 text-right">{f2(total.ot_rate)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              Giờ vào/tan mặc định 08:00–17:00. Đi muộn tính khi vào sau giờ vào 10 phút; OT tính khi ra sau
              giờ tan 15 phút (số giờ OT tính từ mốc giờ tan + 15 phút). Giờ làm đã trừ nghỉ trưa 12:00–13:00.
            </p>
          </>
        )}
      </section>

      {/* ============ HOẠT ĐỘNG TEAMS ============ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Hoạt động Microsoft Teams</h3>
          <button onClick={handleSync} disabled={syncing}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50">
            {syncing ? "Đang sync..." : "Đồng bộ Teams"}
          </button>
        </div>

        {!employee.teams_user_id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            Nhân viên chưa được liên kết với tài khoản Teams. Nhấn &quot;Đồng bộ Teams&quot; để liên kết.
          </div>
        )}

        {snapshots.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>Chưa có dữ liệu hoạt động Teams</p>
            <p className="text-xs mt-1">Cần Admin Microsoft 365 cấp quyền Reports.Read.All để thu thập dữ liệu</p>
          </div>
        ) : (
          <div className="space-y-4">
            {snapshots.map((s) => (
              <div key={s.snapshot_month} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-3">
                  {new Date(s.snapshot_month).toLocaleDateString("vi-VN", { year: "numeric", month: "long" })}
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Tin nhắn gửi", value: s.messages_sent, icon: "💬" },
                    { label: "Cuộc họp", value: s.meetings_attended, icon: "🤝" },
                    { label: "Phút gọi", value: s.call_minutes, icon: "📞" },
                    { label: "Ngày hoạt động", value: s.active_days, icon: "📅" },
                  ].map((m) => (
                    <div key={m.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-2xl mb-1">{m.icon}</p>
                      <p className="text-xl font-bold text-blue-600">{m.value}</p>
                      <p className="text-xs text-gray-500">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
