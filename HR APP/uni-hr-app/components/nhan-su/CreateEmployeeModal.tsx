"use client"

import { useState } from "react"
import Modal from "@/components/ui/Modal"
import type { Employee } from "@/types/database"

interface Props {
  open: boolean
  onClose: () => void
  onCreated: (employee: Employee) => void
}

export default function CreateEmployeeModal({ open, onClose, onCreated }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", office: "HCM",
    position: "", department: "", contract_type: "HĐLĐ",
    status: "Đang làm việc", staff_code: "",
  })

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }))
  }

  async function handleCreate() {
    if (!form.full_name.trim()) return
    setLoading(true)
    const res = await fetch("/api/nhan-su/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      onCreated(data)
      onClose()
    }
  }

  const field = (label: string, field: string, type = "text") => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={(form as Record<string,string>)[field]}
        onChange={(e) => set(field, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  )

  const select = (label: string, f: string, opts: string[]) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select value={(form as Record<string,string>)[f]} onChange={(e) => set(f, e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        {opts.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <Modal open={open} onClose={onClose} title="Thêm nhân viên mới" size="md">
      <div className="grid grid-cols-2 gap-4">
        {field("Họ và tên *", "full_name")}
        {field("Mã nhân viên", "staff_code")}
        {field("Email", "email", "email")}
        {field("Điện thoại", "phone")}
        {field("Chức vụ", "position")}
        {field("Phòng ban", "department")}
        {select("Văn phòng", "office", ["HCM", "HN"])}
        {select("Loại hợp đồng", "contract_type", ["HĐLĐ", "Thử việc", "Cộng tác viên"])}
        {select("Trạng thái", "status", ["Đang làm việc", "Thử việc", "Nghỉ việc HCM", "Nghỉ việc HN"])}
      </div>
      <button onClick={handleCreate} disabled={loading || !form.full_name.trim()}
        className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm">
        {loading ? "Đang lưu..." : "Tạo nhân viên"}
      </button>
    </Modal>
  )
}
