"use client"

import { useState, useMemo } from "react"
import Badge, { equipmentStatusVariant } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import type { EquipmentItem } from "@/types/database"

interface Employee { id: string; full_name: string; staff_code: string | null }

interface Props {
  initialItems: (EquipmentItem & { employees: { full_name: string } | null })[]
  employees: Employee[]
}

export default function EquipmentInventory({ initialItems, employees }: Props) {
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Partial<EquipmentItem>>({ category: "Laptop", status: "Trong kho", location: "HCM", condition: "Tốt" })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => items.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.equipment_code.toLowerCase().includes(search.toLowerCase())) return false
    if (filterCategory && i.category !== filterCategory) return false
    if (filterStatus && i.status !== filterStatus) return false
    if (filterLocation && i.location !== filterLocation) return false
    return true
  }), [items, search, filterCategory, filterStatus, filterLocation])

  async function handleAdd() {
    setSaving(true)
    const res = await fetch("/api/thiet-bi/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) { setItems((prev) => [...prev, data]); setShowAdd(false) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kho thiết bị</h1>
        <button onClick={() => setShowAdd(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Thêm thiết bị
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3">
          <input placeholder="Tìm tên, mã thiết bị..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {[
            { val: filterCategory, set: setFilterCategory, opts: ["Laptop","Màn hình","Điện thoại","Máy in","Phụ kiện","Khác"], placeholder: "Loại thiết bị" },
            { val: filterStatus, set: setFilterStatus, opts: ["Trong kho","Đang sử dụng","Đang sửa chữa","Đã hủy"], placeholder: "Trạng thái" },
            { val: filterLocation, set: setFilterLocation, opts: ["HCM","HN"], placeholder: "Văn phòng" },
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">{f.placeholder}</option>
              {f.opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Thiết bị</th>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Tình trạng</th>
                <th className="px-4 py-3 text-left">VP</th>
                <th className="px-4 py-3 text-left">Bảo hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.equipment_code}</td>
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">
                    <Badge label={item.status} variant={equipmentStatusVariant(item.status)} />
                  </td>
                  <td className="px-4 py-3">{(item as never as { employees: { full_name: string } | null }).employees?.full_name || "—"}</td>
                  <td className="px-4 py-3">{item.condition || "—"}</td>
                  <td className="px-4 py-3">{item.location || "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.warranty_expiry || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Không có thiết bị</div>}
          <div className="px-4 py-3 border-t text-xs text-gray-500">{filtered.length} thiết bị</div>
        </div>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Thêm thiết bị mới" size="md">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Tên thiết bị *", key: "name" },
            { label: "Mã thiết bị *", key: "equipment_code" },
            { label: "Serial Number", key: "serial_number" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input value={String((form as Record<string,unknown>)[key] || "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {[
            { label: "Loại", key: "category", opts: ["Laptop","Màn hình","Điện thoại","Máy in","Phụ kiện","Khác"] },
            { label: "Trạng thái", key: "status", opts: ["Trong kho","Đang sử dụng","Đang sửa chữa"] },
            { label: "Tình trạng", key: "condition", opts: ["Tốt","Khá","Trung bình","Hỏng"] },
            { label: "Văn phòng", key: "location", opts: ["HCM","HN"] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <select value={String((form as Record<string,unknown>)[key] || "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[
            { label: "Ngày mua", key: "purchase_date", type: "date" },
            { label: "Hết bảo hành", key: "warranty_expiry", type: "date" },
            { label: "Giá trị (VND)", key: "purchase_value", type: "number" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input type={type}
                value={String((form as Record<string,unknown>)[key] || "")}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value || null }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>
        <button onClick={handleAdd} disabled={saving || !form.name || !form.equipment_code}
          className="mt-5 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm">
          {saving ? "Đang lưu..." : "Thêm thiết bị"}
        </button>
      </Modal>
    </div>
  )
}
