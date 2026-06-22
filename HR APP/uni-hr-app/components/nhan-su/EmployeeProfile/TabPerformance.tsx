"use client"

import { useState } from "react"

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

export default function TabPerformance({ employee }: Props) {
  const snapshots = ((employee.teams_activity_snapshots as ActivitySnapshot[]) || [])
    .sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month))

  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    await fetch("/api/teams/sync-users", { method: "POST" })
    setSyncing(false)
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Hiệu suất làm việc</h3>
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
    </div>
  )
}
