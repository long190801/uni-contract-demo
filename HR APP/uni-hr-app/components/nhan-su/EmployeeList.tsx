"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Employee } from "@/types/database"
import Badge, { employeeStatusVariant } from "@/components/ui/Badge"
import ImportModal from "@/components/nhan-su/ImportModal"
import CreateEmployeeModal from "@/components/nhan-su/CreateEmployeeModal"

interface Props {
  initialEmployees: Employee[]
}

export default function EmployeeList({ initialEmployees }: Props) {
  const [employees, setEmployees] = useState(initialEmployees)
  const [search, setSearch] = useState("")
  const [filterOffice, setFilterOffice] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterContract, setFilterContract] = useState("")
  const [showImport, setShowImport] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (search && !e.full_name.toLowerCase().includes(search.toLowerCase()) &&
          !e.staff_code?.toLowerCase().includes(search.toLowerCase())) return false
      if (filterOffice && e.office !== filterOffice) return false
      if (filterStatus && e.status !== filterStatus) return false
      if (filterContract && e.contract_type !== filterContract) return false
      return true
    })
  }, [employees, search, filterOffice, filterStatus, filterContract])

  function handleImported(newEmployees: Employee[]) {
    setEmployees((prev) => {
      const map = new Map(prev.map((e) => [e.id, e]))
      newEmployees.forEach((e) => map.set(e.id, e))
      return Array.from(map.values()).sort((a, b) => a.full_name.localeCompare(b.full_name))
    })
    setShowImport(false)
  }

  async function handleExport() {
    const res = await fetch("/api/nhan-su/export")
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "nhan-vien.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
        <input
          placeholder="Tìm tên, mã NV..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={filterOffice} onChange={(e) => setFilterOffice(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả văn phòng</option>
          <option value="HCM">HCM</option>
          <option value="HN">Hà Nội</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả trạng thái</option>
          <option value="Đang làm việc">Đang làm việc</option>
          <option value="Thử việc">Thử việc</option>
          <option value="Nghỉ việc HCM">Nghỉ việc HCM</option>
          <option value="Nghỉ việc HN">Nghỉ việc HN</option>
        </select>
        <select value={filterContract} onChange={(e) => setFilterContract(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả loại HĐ</option>
          <option value="HĐLĐ">HĐLĐ</option>
          <option value="Thử việc">Thử việc</option>
          <option value="Cộng tác viên">Cộng tác viên</option>
        </select>
        <div className="flex gap-2 ml-auto">
          <button onClick={() => setShowImport(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            Import Excel
          </button>
          <button onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            Export Excel
          </button>
          <button onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">
            + Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Họ và tên</th>
              <th className="px-4 py-3 text-left">Mã NV</th>
              <th className="px-4 py-3 text-left">Chức vụ</th>
              <th className="px-4 py-3 text-left">VP</th>
              <th className="px-4 py-3 text-left">Loại HĐ</th>
              <th className="px-4 py-3 text-left">Hết hạn HĐ</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-blue-50 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/nhan-su/${emp.id}`} className="font-medium text-blue-700 hover:underline">
                    {emp.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">{emp.staff_code || "—"}</td>
                <td className="px-4 py-3">{emp.position || "—"}</td>
                <td className="px-4 py-3">{emp.office || "—"}</td>
                <td className="px-4 py-3">{emp.contract_type || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{emp.contract_end_date || "—"}</td>
                <td className="px-4 py-3">
                  {emp.status && (
                    <Badge label={emp.status} variant={employeeStatusVariant(emp.status)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">Không tìm thấy nhân viên</div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        Hiển thị {filtered.length} / {employees.length} nhân viên
      </div>

      <ImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={handleImported}
      />
      <CreateEmployeeModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(e) => setEmployees((prev) => [...prev, e])}
      />
    </div>
  )
}
