"use client"

import { useState, useMemo } from "react"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import type { EquipmentRequest } from "@/types/database"

const REQUEST_TYPES = ["Xin cấp mới","Thiết bị hư hỏng","Trả/thu hồi","Đổi người dùng","Mượn về nhà","Nâng cấp"]
const STATUS_COLORS: Record<string, "blue"|"yellow"|"green"|"red"|"gray"> = {
  "Chờ duyệt": "yellow",
  "Đã duyệt": "green",
  "Từ chối": "red",
  "Đang xử lý": "blue",
  "Hoàn thành": "green",
}

interface Employee { id: string; full_name: string; staff_code: string | null }
interface Item { id: string; name: string; equipment_code: string; category: string }

interface Props {
  initialRequests: (EquipmentRequest & {
    equipment_items: { name: string; equipment_code: string } | null
    employees: { full_name: string } | null
  })[]
  availableItems: Item[]
  employees: Employee[]
}

export default function RequestsDashboard({ initialRequests, availableItems, employees }: Props) {
  const [requests, setRequests] = useState(initialRequests)
  const [filterType, setFilterType] = useState("")
  const [filterStatus, setFilterStatus] = useState("Chờ duyệt")
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({
    request_type: "Xin cấp mới" as EquipmentRequest["request_type"],
    notes: "",
    requested_by_employee: "",
    equipment_id: "",
    loan_return_date: "",
    new_user_id: "",
    requested_specs: {} as Record<string, string>,
  })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => requests.filter((r) => {
    if (filterType && r.request_type !== filterType) return false
    if (filterStatus && r.status !== filterStatus) return false
    return true
  }), [requests, filterType, filterStatus])

  async function handleApprove(id: string, action: "approve" | "reject", reason?: string) {
    const res = await fetch(`/api/thiet-bi/requests/${id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, approved_by: "HR", rejection_reason: reason }),
    })
    const data = await res.json()
    if (res.ok) setRequests((prev) => prev.map((r) => r.id === id ? { ...r, ...data } : r))
  }

  async function handleCreate() {
    setSaving(true)
    const res = await fetch("/api/thiet-bi/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_type: newForm.request_type,
        notes: newForm.notes,
        requested_by_employee: newForm.requested_by_employee || null,
        equipment_id: newForm.equipment_id || null,
        loan_return_date: newForm.loan_return_date || null,
        new_user_id: newForm.new_user_id || null,
      }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setRequests((prev) => [data, ...prev]); setShowNew(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Yêu cầu thiết bị</h1>
        <button onClick={() => setShowNew(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Tạo yêu cầu
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả loại yêu cầu</option>
            {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            {["Chờ duyệt","Đã duyệt","Từ chối","Đang xử lý","Hoàn thành"].map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-sm text-gray-500 self-center">{filtered.length} yêu cầu</span>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((req) => (
            <div key={req.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">{req.request_type}</span>
                  <Badge label={req.status} variant={STATUS_COLORS[req.status] || "gray"} />
                </div>
                <p className="text-sm text-gray-600">
                  <strong>{(req.employees as { full_name?: string })?.full_name || "—"}</strong>
                  {req.equipment_items && ` · ${(req.equipment_items as { name?: string })?.name}`}
                </p>
                {req.notes && <p className="text-xs text-gray-400 mt-0.5">{req.notes}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(req.requested_at).toLocaleDateString("vi-VN", { dateStyle: "short" })}</p>
              </div>
              {req.status === "Chờ duyệt" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleApprove(req.id, "approve")}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium">
                    Duyệt
                  </button>
                  <button onClick={() => { const r = prompt("Lý do từ chối:"); if (r !== null) handleApprove(req.id, "reject", r) }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium">
                    Từ chối
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Không có yêu cầu nào</div>}
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Tạo yêu cầu thiết bị" size="md">
        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loại yêu cầu</label>
            <select value={newForm.request_type}
              onChange={(e) => setNewForm((f) => ({ ...f, request_type: e.target.value as EquipmentRequest["request_type"] }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {REQUEST_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Người yêu cầu</label>
            <select value={newForm.requested_by_employee}
              onChange={(e) => setNewForm((f) => ({ ...f, requested_by_employee: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Chọn nhân viên —</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          {(newForm.request_type !== "Xin cấp mới" && newForm.request_type !== "Nâng cấp") && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thiết bị</label>
              <select value={newForm.equipment_id}
                onChange={(e) => setNewForm((f) => ({ ...f, equipment_id: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Chọn thiết bị —</option>
                {availableItems.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.equipment_code})</option>)}
              </select>
            </div>
          )}
          {newForm.request_type === "Mượn về nhà" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ngày trả</label>
              <input type="date" value={newForm.loan_return_date}
                onChange={(e) => setNewForm((f) => ({ ...f, loan_return_date: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ghi chú</label>
            <textarea value={newForm.notes} onChange={(e) => setNewForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={handleCreate} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium">
            {saving ? "Đang lưu..." : "Tạo yêu cầu"}
          </button>
        </div>
      </Modal>
    </div>
  )
}
