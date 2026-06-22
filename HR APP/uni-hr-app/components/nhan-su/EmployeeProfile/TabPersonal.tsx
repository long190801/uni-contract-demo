"use client"

import { useState } from "react"

interface Props {
  employee: Record<string, unknown>
  onUpdate: (updated: Record<string, unknown>) => void
}

const FIELDS: Array<{ label: string; key: string; type?: string; opts?: string[] }> = [
  { label: "Họ và tên", key: "full_name" },
  { label: "Giới tính", key: "gender", opts: ["", "Nam", "Nữ", "Khác"] },
  { label: "Ngày sinh", key: "date_of_birth", type: "date" },
  { label: "Quốc tịch", key: "nationality" },
  { label: "Điện thoại", key: "phone" },
  { label: "Email", key: "email", type: "email" },
  { label: "CMND/CCCD", key: "id_card_number" },
  { label: "Ngày cấp CMND", key: "id_card_issued_date", type: "date" },
  { label: "Nơi cấp CMND", key: "id_card_issued_place" },
  { label: "Địa chỉ", key: "address" },
  { label: "Mã NV", key: "staff_code" },
  { label: "Văn phòng", key: "office", opts: ["", "HCM", "HN"] },
  { label: "Chức vụ", key: "position" },
  { label: "Phòng ban", key: "department" },
  { label: "Cấp bậc", key: "level" },
  { label: "BHXH", key: "bhxh_number" },
  { label: "Nơi đăng ký KCB", key: "healthcare_place" },
  { label: "Mã số thuế", key: "tax_id" },
  { label: "Email Teams", key: "teams_email", type: "email" },
  { label: "Ghi chú", key: "notes" },
]

export default function TabPersonal({ employee, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(employee)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/nhan-su/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      onUpdate(data)
      setEditing(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Thông tin cá nhân</h3>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline">Chỉnh sửa</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setForm(employee) }}
              className="text-sm text-gray-500 hover:underline">Hủy</button>
            <button onClick={handleSave} disabled={saving}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Lưu..." : "Lưu"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        {FIELDS.map(({ label, key, type, opts }) => (
          <div key={key}>
            <label className="block text-xs font-medium text-gray-500 mb-0.5">{label}</label>
            {editing ? (
              opts ? (
                <select value={String(form[key] || "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {opts.map((o) => <option key={o} value={o}>{o || "— Chọn —"}</option>)}
                </select>
              ) : (
                <input type={type || "text"} value={String(form[key] || "")}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              )
            ) : (
              <p className="text-sm text-gray-800">{String(employee[key] || "—")}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
