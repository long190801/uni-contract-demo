"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { fmtDate } from "@/lib/format"
import type { Employee } from "@/types/database"
import ImportModal from "@/components/nhan-su/ImportModal"
import CreateEmployeeModal from "@/components/nhan-su/CreateEmployeeModal"
import DocGenModal from "@/components/nhan-su/DocGenModal"

// Filter option sets
const WORK_STATUSES = ["HĐLĐ KXDTH", "HĐLĐ", "Thử việc", "Cộng tác viên", "Đã nghỉ việc"]
const CONTRACT_TYPES = ["HĐLĐ", "Thử việc", "Cộng tác viên"]
const OFFICES = ["HCM", "HN"]

// Bosses get a crown decoration. Ordering is by tenure (see cmp) — only the
// CEO is force-pinned to the very top; everyone else (incl. Sếp) sorts by tenure.
const VIPS: Record<string, { decor: string; label: string }> = {
  "byun@eximuni.com": { decor: "👑", label: "CEO" },
  "huy@eximuni.com": { decor: "👑", label: "Sếp" },
}
const vipOf = (e: Employee) => VIPS[(e.email || "").toLowerCase().trim()]

// BYUN SANG HYUN is always pinned to the highest position.
const PINNED_TOP_EMAIL = "byun@eximuni.com"
const isPinnedTop = (e: Employee) => (e.email || "").toLowerCase().trim() === PINNED_TOP_EMAIL

// Whether an employee counts as "đã nghỉ việc". `status` is the source of truth
// (đó là ô người dùng chỉnh ở tab Hợp đồng); chỉ khi thiếu status mới dựa vào work_status.
const isQuit = (e: Employee) =>
  e.status ? e.status.startsWith("Nghỉ việc") : e.work_status === "Đã nghỉ việc"

interface Props {
  initialEmployees: Employee[]
}

export default function EmployeeList({ initialEmployees }: Props) {
  const router = useRouter()
  const [employees, setEmployees] = useState(initialEmployees)
  const [showImport, setShowImport] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showDocGen, setShowDocGen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggleGroup = (key: string) => setExpanded((p) => ({ ...p, [key]: !p[key] }))

  // Per-column filters
  const [f, setF] = useState({ name: "", code: "", pos: "", office: "", contract: "", end: "", status: "" })
  const upd = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }))

  const filtered = useMemo(() => {
    const has = (s: string | null | undefined, q: string) => (s || "").toLowerCase().includes(q.toLowerCase())
    return employees.filter((e) => {
      if (f.name && !has(e.full_name, f.name)) return false
      if (f.code && !has(e.staff_code, f.code)) return false
      if (f.pos && !has(e.position, f.pos)) return false
      if (f.office && e.office !== f.office) return false
      if (f.contract && e.contract_type !== f.contract) return false
      if (f.end && !has(e.contract_end_date, f.end)) return false
      if (f.status && (e.work_status || "") !== f.status) return false
      return true
    })
  }, [employees, f])

  // 4 priority groups (driven by office + quit), sorted by seniority with bosses pinned.
  const groups = useMemo(() => {
    const defs = [
      { key: "hcm", title: "HCM Office", sub: "Đang làm việc tại HCM", accent: "bg-blue-600",
        collapsible: false, match: (e: Employee) => e.office === "HCM" && !isQuit(e) },
      { key: "hn", title: "HN Office", sub: "Đang làm việc tại Hà Nội", accent: "bg-emerald-600",
        collapsible: false, match: (e: Employee) => e.office === "HN" && !isQuit(e) },
      { key: "quit-hcm", title: "Quit job — HCM", sub: "Đã nghỉ việc tại HCM", accent: "bg-gray-500",
        collapsible: true, match: (e: Employee) => e.office === "HCM" && isQuit(e) },
      { key: "quit-hn", title: "Quit job — HN", sub: "Đã nghỉ việc tại Hà Nội", accent: "bg-gray-500",
        collapsible: true, match: (e: Employee) => e.office === "HN" && isQuit(e) },
    ]
    const joinTime = (e: Employee) => {
      const t = e.join_date ? new Date(e.join_date).getTime() : NaN
      return Number.isNaN(t) ? Infinity : t
    }
    const cmp = (a: Employee, b: Employee) => {
      // BYUN luôn ở vị trí cao nhất.
      const pa = isPinnedTop(a), pb = isPinnedTop(b)
      if (pa !== pb) return pa ? -1 : 1
      // Sau đó sắp theo thời gian gắn bó: vào công ty sớm hơn (join_date nhỏ hơn)
      // = gắn bó lâu hơn = đứng trên. Người thiếu join_date xếp cuối.
      const ta = joinTime(a), tb = joinTime(b)
      if (ta !== tb) return ta - tb
      return a.full_name.localeCompare(b.full_name, "vi")
    }
    // running offset → continuous STT across groups (last number = grand total)
    let offset = 0
    return defs.map((d) => {
      const rows = filtered.filter(d.match).sort(cmp)
      const o = offset
      offset += rows.length
      return { ...d, rows, offset: o }
    })
  }, [filtered])

  const totalShown = filtered.length

  // Compact headline stats (whole dataset, not affected by filters)
  const overview = useMemo(() => {
    const active = employees.filter((e) => !isQuit(e))
    return {
      total: employees.length,
      active: active.length,
      probation: employees.filter((e) => e.work_status === "Thử việc").length,
      hcm: active.filter((e) => e.office === "HCM").length,
      hn: active.filter((e) => e.office === "HN").length,
    }
  }, [employees])

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

  // Both row-click and the pencil open the detail page (fields there are click-to-edit).
  const openDetail = (id: string) => router.push(`/nhan-su/${id}`)

  async function handleDelete(emp: Employee) {
    if (!confirm(`Xóa nhân viên "${emp.full_name}"?\n\nHành động này KHÔNG THỂ hoàn tác và sẽ xóa cả tài liệu, lịch sử hợp đồng đính kèm.`)) return
    const res = await fetch(`/api/nhan-su/employees/${emp.id}`, { method: "DELETE" })
    if (res.ok) setEmployees((prev) => prev.filter((e) => e.id !== emp.id))
    else alert("Xóa thất bại: " + ((await res.json().catch(() => ({}))).error || res.status))
  }

  const filterCls = "w-full border border-gray-200 rounded px-1.5 py-0.5 text-xs leading-tight focus:outline-none focus:ring-1 focus:ring-blue-400"
  const tdCls = "px-3 py-1.5 text-gray-700 truncate"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-x-3 gap-y-1 text-xs text-gray-600 flex-wrap">
          <span><b className="text-gray-900 text-sm">{overview.total}</b> nhân viên</span>
          <span className="text-gray-300">·</span>
          <span><b className="text-green-700">{overview.active}</b> đang làm</span>
          <span><b className="text-yellow-700">{overview.probation}</b> thử việc</span>
          <span className="text-gray-300">·</span>
          <span><b className="text-purple-700">{overview.hcm}</b> HCM</span>
          <span><b className="text-orange-700">{overview.hn}</b> HN</span>
          {totalShown !== overview.total && <span className="text-blue-600">· đang lọc: {totalShown}</span>}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => setShowDocGen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm font-medium">📝 Tạo văn bản tự động</button>
          <button onClick={() => setShowImport(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">Import Excel</button>
          <button onClick={handleExport}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">Export Excel</button>
          <button onClick={() => setShowCreate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">+ Thêm nhân viên</button>
        </div>
      </div>

      {/* Grouped table (read-only — click a row to view, ✏️ to edit) */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1000px]">
          <thead className="bg-gray-50 text-gray-600 text-xs">
            <tr className="uppercase">
              <th className="px-3 py-1.5 text-left w-12">STT</th>
              <th className="px-3 py-1.5 text-left">Họ và tên</th>
              <th className="px-3 py-1.5 text-left">Mã NV</th>
              <th className="px-3 py-1.5 text-left">Chức vụ</th>
              <th className="px-3 py-1.5 text-left w-20">VP</th>
              <th className="px-3 py-1.5 text-left w-32">Loại HĐ</th>
              <th className="px-3 py-1.5 text-left w-32">Hết hạn HĐ</th>
              <th className="px-3 py-1.5 text-left w-40">Trạng thái</th>
              <th className="px-3 py-1.5 text-center w-20">Thao tác</th>
            </tr>
            {/* Per-column filter row */}
            <tr className="border-t border-gray-200">
              <th className="px-2 py-1"></th>
              <th className="px-2 py-1"><input value={f.name} onChange={(e) => upd("name", e.target.value)} placeholder="Lọc tên…" className={filterCls} /></th>
              <th className="px-2 py-1"><input value={f.code} onChange={(e) => upd("code", e.target.value)} placeholder="Lọc mã…" className={filterCls} /></th>
              <th className="px-2 py-1"><input value={f.pos} onChange={(e) => upd("pos", e.target.value)} placeholder="Lọc chức vụ…" className={filterCls} /></th>
              <th className="px-2 py-1">
                <select value={f.office} onChange={(e) => upd("office", e.target.value)} className={filterCls}>
                  <option value="">Tất cả</option>{OFFICES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </th>
              <th className="px-2 py-1">
                <select value={f.contract} onChange={(e) => upd("contract", e.target.value)} className={filterCls}>
                  <option value="">Tất cả</option>{CONTRACT_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </th>
              <th className="px-2 py-1"><input value={f.end} onChange={(e) => upd("end", e.target.value)} placeholder="YYYY-MM…" className={filterCls} /></th>
              <th className="px-2 py-1">
                <select value={f.status} onChange={(e) => upd("status", e.target.value)} className={filterCls}>
                  <option value="">Tất cả</option>{WORK_STATUSES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          {groups.map((g) => {
            const isOpen = g.collapsible ? !!expanded[g.key] : true
            return (
              <tbody key={g.key} className="divide-y divide-gray-100">
                <tr>
                  <td colSpan={9} className="px-0 py-0">
                    <div onClick={g.collapsible ? () => toggleGroup(g.key) : undefined}
                      className={`flex items-center gap-2 px-4 py-2 bg-gray-50 border-y border-gray-200 ${g.collapsible ? "cursor-pointer hover:bg-gray-100 select-none" : ""}`}>
                      {g.collapsible && <span className={`text-gray-400 text-xs transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>}
                      <span className={`inline-block w-1.5 h-4 rounded ${g.accent}`} />
                      <span className="font-semibold text-gray-800">{g.title}</span>
                      <span className="text-xs text-gray-400">· {g.sub}</span>
                      <span className="ml-auto text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-full px-2 py-0.5">{g.rows.length} người</span>
                    </div>
                  </td>
                </tr>
                {isOpen && g.rows.map((emp, i) => {
                  const vip = vipOf(emp)
                  return (
                    <tr key={emp.id} onClick={() => openDetail(emp.id)} title="Bấm để xem chi tiết"
                      className={`cursor-pointer ${vip ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-blue-50/60"}`}>
                      <td className="px-3 py-1.5 text-gray-400 text-xs text-center">{g.offset + i + 1}</td>
                      <td className={tdCls + " font-medium text-gray-900"}>
                        <span className="flex items-center gap-1">
                          {vip && <span title={vip.label}>{vip.decor}</span>}
                          {emp.full_name || "—"}
                        </span>
                      </td>
                      <td className={tdCls}>{emp.staff_code || "—"}</td>
                      <td className={tdCls}>{emp.position || "—"}</td>
                      <td className={tdCls}>{emp.office || "—"}</td>
                      <td className={tdCls}>{emp.contract_type || "—"}</td>
                      <td className={tdCls}>{fmtDate(emp.contract_end_date)}</td>
                      <td className={tdCls}>{emp.work_status || "—"}</td>
                      <td className="px-2 py-1.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openDetail(emp.id)}
                          title="Mở hồ sơ để xem/sửa"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Xóa nhân viên"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {isOpen && g.rows.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-4 text-center text-gray-300 text-xs">Không có nhân viên trong nhóm này</td></tr>
                )}
              </tbody>
            )
          })}
        </table>
        {totalShown === 0 && <div className="text-center py-12 text-gray-400">Không tìm thấy nhân viên</div>}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        Hiển thị {totalShown} / {employees.length} nhân viên
      </div>

      <ImportModal open={showImport} onClose={() => setShowImport(false)} onImported={handleImported} />
      <CreateEmployeeModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={(e) => setEmployees((prev) => [...prev, e])} />
      <DocGenModal open={showDocGen} onClose={() => setShowDocGen(false)} employees={employees} />
    </div>
  )
}
