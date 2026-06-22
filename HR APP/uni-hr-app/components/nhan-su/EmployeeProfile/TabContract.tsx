"use client"

import { useState } from "react"

interface Props {
  employee: Record<string, unknown>
  onUpdate: (updated: Record<string, unknown>) => void
}

export default function TabContract({ employee, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(employee)
  const [saving, setSaving] = useState(false)

  const contractFields = [
    { label: "Loại hợp đồng", key: "contract_type", opts: ["HĐLĐ", "Thử việc", "Cộng tác viên"] },
    { label: "Mã hợp đồng", key: "contract_code" },
    { label: "Ngày bắt đầu HĐ", key: "contract_start_date", type: "date" },
    { label: "Ngày kết thúc HĐ", key: "contract_end_date", type: "date" },
    { label: "Ngày bắt đầu thử việc", key: "probation_start_date", type: "date" },
    { label: "Ngày kết thúc thử việc", key: "probation_end_date", type: "date" },
    { label: "Ngày nghỉ việc", key: "quit_date", type: "date" },
    { label: "Lương thử việc (VND)", key: "probation_salary", type: "number" },
    { label: "Lương chính thức (VND)", key: "official_salary", type: "number" },
    { label: "Trạng thái", key: "status", opts: ["Đang làm việc", "Thử việc", "Nghỉ việc HCM", "Nghỉ việc HN"] },
  ]

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/nhan-su/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { onUpdate(data); setEditing(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Thông tin hợp đồng</h3>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="text-sm text-blue-600 hover:underline">Chỉnh sửa</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(employee) }} className="text-sm text-gray-500 hover:underline">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Lưu..." : "Lưu"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {contractFields.map(({ label, key, type, opts }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
            {editing ? (
              opts ? (
                <select value={String(form[key] || "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={type || "text"} value={String(form[key] || "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              )
            ) : (
              <p className="text-sm text-gray-800">
                {type === "number" && employee[key]
                  ? Number(employee[key]).toLocaleString("vi-VN") + " đ"
                  : String(employee[key] || "—")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
