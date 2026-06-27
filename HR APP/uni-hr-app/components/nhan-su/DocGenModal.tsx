"use client"

import { useMemo, useState } from "react"
import Modal from "@/components/ui/Modal"
import { fmtDate, toDateInput } from "@/lib/format"
import type { Employee } from "@/types/database"
import ContractForm from "./ContractForm"
import { CONTRACT_TYPES, type DocType } from "@/lib/contracts/config"

interface Props {
  open: boolean
  onClose: () => void
  employees: Employee[]
  initialEmployeeId?: string // mở từ hồ sơ nhân sự -> khóa nhân viên cho hợp đồng
}

// Các loại văn bản có thể tạo tự động. NDA + 4 loại hợp đồng (lấy từ config).
const DOC_TYPES = [
  { id: "nda", icon: "🔒", title: "Thỏa thuận bảo mật (NDA)", desc: "NDA dành cho người lao động — điền sẵn thông tin cá nhân", ready: true },
  ...CONTRACT_TYPES.map((c) => ({ id: c.id, icon: c.icon, title: c.title, desc: c.desc, ready: true })),
]

// 6 trường cá nhân của Bên Nhận Thông Tin mà NDA cần.
const NDA_FIELDS: { key: keyof Employee; label: string; date?: boolean }[] = [
  { key: "full_name", label: "Họ và tên" },
  { key: "date_of_birth", label: "Ngày sinh", date: true },
  { key: "id_card_number", label: "CMND/CCCD/Hộ chiếu" },
  { key: "id_card_issued_date", label: "Ngày cấp", date: true },
  { key: "id_card_issued_place", label: "Nơi cấp" },
  { key: "address", label: "Địa chỉ thường trú" },
]

const missingOf = (e: Employee) =>
  NDA_FIELDS.filter((f) => !String(e[f.key] ?? "").trim()).map((f) => f.label)

// Nhân viên đã nghỉ việc — không tạo NDA cho họ. `status` là nguồn chính (ô người
// dùng chỉnh ở tab Hợp đồng); thiếu status mới dựa vào work_status. Giữ logic này
// đồng bộ với EmployeeList.
const isQuit = (e: Employee) =>
  e.status ? e.status.startsWith("Nghỉ việc") : e.work_status === "Đã nghỉ việc"

interface GenResult {
  created: { name: string; missing: string[] }[]
  errors: { name: string; error: string }[]
}

export default function DocGenModal({ open, onClose, employees, initialEmployeeId }: Props) {
  const [docType, setDocType] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [signDate, setSignDate] = useState(toDateInput(new Date().toISOString()))
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<GenResult | null>(null)
  const [error, setError] = useState("")

  // Chỉ liệt kê nhân viên đang làm việc — đã nghỉ việc thì bỏ qua (kể cả khi "Chọn tất cả").
  const sorted = useMemo(
    () => employees.filter((e) => !isQuit(e)).sort((a, b) => a.full_name.localeCompare(b.full_name, "vi")),
    [employees]
  )
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return sorted
    return sorted.filter(
      (e) => e.full_name.toLowerCase().includes(q) || (e.staff_code || "").toLowerCase().includes(q)
    )
  }, [sorted, search])

  const selectedEmps = useMemo(() => sorted.filter((e) => selected.has(e.id)), [sorted, selected])
  const allFilteredSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.id))
  const someFilteredSelected = filtered.some((e) => selected.has(e.id))
  const withMissingCount = selectedEmps.filter((e) => missingOf(e).length > 0).length

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleAllFiltered() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) filtered.forEach((e) => next.delete(e.id))
      else filtered.forEach((e) => next.add(e.id))
      return next
    })
  }

  function reset() {
    setDocType(null); setSelected(new Set()); setSearch(""); setResult(null); setError(""); setProgress(null)
    setSignDate(toDateInput(new Date().toISOString()))
  }
  function handleClose() { reset(); onClose() }

  async function handleGenerate() {
    if (selected.size === 0) return
    setError(""); setProgress({ done: 0, total: selectedEmps.length })
    const res: GenResult = { created: [], errors: [] }
    for (let i = 0; i < selectedEmps.length; i++) {
      const emp = selectedEmps[i]
      try {
        const r = await fetch("/api/nhan-su/nda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employee_id: emp.id, sign_date: signDate }),
        })
        const data = await r.json()
        if (r.ok) res.created.push({ name: emp.full_name, missing: data.missing || [] })
        else res.errors.push({ name: emp.full_name, error: data.error || `Lỗi ${r.status}` })
      } catch {
        res.errors.push({ name: emp.full_name, error: "Lỗi kết nối" })
      }
      setProgress({ done: i + 1, total: selectedEmps.length })
    }
    setProgress(null)
    setResult(res)
  }

  const loading = progress !== null

  return (
    <Modal open={open} onClose={handleClose} title="Tạo văn bản tự động" size="xl">
      {/* Bước 1: chọn loại văn bản */}
      {!docType && (
        <div className="grid sm:grid-cols-2 gap-3">
          {DOC_TYPES.map((d) => (
            <button
              key={d.id}
              disabled={!d.ready}
              onClick={() => setDocType(d.id)}
              className={`text-left border rounded-xl p-4 transition ${
                d.ready
                  ? "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
                  : "border-dashed border-gray-200 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="text-2xl mb-2">{d.icon}</div>
              <div className="font-semibold text-gray-800 text-sm">{d.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{d.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Hợp đồng (HĐLĐ/thử việc/CTV/phụ lục) — luồng riêng có bảng sửa */}
      {docType && docType !== "nda" && (
        <ContractForm
          docType={docType as DocType}
          employees={employees}
          initialEmployeeId={initialEmployeeId}
          onBack={() => setDocType(null)}
          onClose={handleClose}
        />
      )}

      {/* Bước 2: NDA — chọn 1 / nhiều / tất cả nhân viên + ngày ký */}
      {docType === "nda" && !result && (
        <div className="space-y-4">
          <button onClick={() => { setDocType(null); setSelected(new Set()); setError("") }}
            className="text-sm text-gray-500 hover:text-blue-600">← Chọn loại văn bản khác</button>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chọn nhân viên (Bên Nhận Thông Tin)</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã NV…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Hàng "Chọn tất cả" */}
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer select-none">
                <input type="checkbox" checked={allFilteredSelected}
                  ref={(el) => { if (el) el.indeterminate = !allFilteredSelected && someFilteredSelected }}
                  onChange={toggleAllFiltered}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Chọn tất cả{search ? " (kết quả lọc)" : ""}
                </span>
                <span className="ml-auto text-xs text-gray-500">{filtered.length} nhân viên đang làm việc</span>
              </label>

              {/* Danh sách có ô tích */}
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                {filtered.map((e) => {
                  const miss = missingOf(e)
                  return (
                    <label key={e.id} className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50/50 cursor-pointer">
                      <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggle(e.id)}
                        className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-gray-800 truncate">{e.full_name}</span>
                      <span className="text-xs text-gray-400 truncate">
                        {e.staff_code ? `· ${e.staff_code}` : ""}{e.office ? ` · ${e.office}` : ""}
                      </span>
                      {miss.length > 0 && (
                        <span className="ml-auto shrink-0 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                          ⚠️ thiếu {miss.length}
                        </span>
                      )}
                    </label>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm text-gray-400">Không tìm thấy nhân viên</div>
                )}
              </div>
            </div>

            {/* Tóm tắt lựa chọn */}
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2 flex-wrap">
              <span>Đã chọn <b className="text-gray-900">{selected.size}</b> nhân viên</span>
              {withMissingCount > 0 && (
                <span className="text-amber-700">· {withMissingCount} người thiếu thông tin (NDA vẫn tạo, ô thiếu để trống)</span>
              )}
            </div>
          </div>

          {/* Xem trước chi tiết khi chọn đúng 1 người */}
          {selectedEmps.length === 1 && (
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="text-xs font-semibold text-gray-600 mb-2">Thông tin sẽ điền vào NDA</div>
              <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                {NDA_FIELDS.map((f) => {
                  const raw = selectedEmps[0][f.key]
                  const val = f.date ? fmtDate(raw as string | null) : (raw ? String(raw) : "")
                  const empty = !String(raw ?? "").trim()
                  return (
                    <div key={String(f.key)} className="flex gap-1.5 min-w-0">
                      <span className="text-gray-500 shrink-0">{f.label}:</span>
                      <span className={`truncate ${empty ? "text-red-500 italic" : "text-gray-800 font-medium"}`}>
                        {empty ? "(thiếu)" : val}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Ngày ký</label>
            <input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

          <button onClick={handleGenerate} disabled={loading || selected.size === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm">
            {loading
              ? `Đang tạo NDA… (${progress?.done}/${progress?.total})`
              : `Tạo NDA cho ${selected.size || 0} nhân viên & lưu vào hồ sơ`}
          </button>
        </div>
      )}

      {/* Kết quả */}
      {result && (
        <div className="py-2 space-y-3">
          <div className="text-center">
            <div className="text-4xl">✅</div>
            <div className="font-semibold text-gray-800 mt-1">
              Đã tạo {result.created.length} NDA{result.errors.length > 0 ? `, ${result.errors.length} lỗi` : ""}
            </div>
            <div className="text-sm text-gray-600">File đã được lưu vào tab <b>Tài liệu</b> của từng nhân viên.</div>
          </div>

          {result.created.some((c) => c.missing.length > 0) && (
            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              <div className="font-semibold mb-1">⚠️ Một số NDA còn ô trống do thiếu thông tin:</div>
              <ul className="space-y-0.5">
                {result.created.filter((c) => c.missing.length > 0).map((c, i) => (
                  <li key={i}><b>{c.name}</b>: thiếu {c.missing.join(", ")}</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">
              <div className="font-semibold mb-1">Không tạo được:</div>
              <ul className="space-y-0.5">
                {result.errors.map((e, i) => <li key={i}><b>{e.name}</b>: {e.error}</li>)}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-1">
            <button onClick={() => { setResult(null); setSelected(new Set()) }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Tạo tiếp</button>
            <button onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Đóng</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
