"use client"

import { useEffect, useMemo, useState } from "react"
import type { Employee } from "@/types/database"
import {
  type DocType, type TermType, type FieldDef, metaOf, fmtMoney, parseMoney,
} from "@/lib/contracts/config"

interface Props {
  docType: DocType
  employees: Employee[]
  initialEmployeeId?: string // mở từ hồ sơ -> khóa nhân viên
  onBack: () => void
  onClose: () => void
}

const isQuit = (e: Employee) =>
  e.status ? e.status.startsWith("Nghỉ việc") : e.work_status === "Đã nghỉ việc"

export default function ContractForm({ docType, employees, initialEmployeeId, onBack, onClose }: Props) {
  const meta = metaOf(docType)
  const [empId, setEmpId] = useState<string | null>(initialEmployeeId ?? null)
  const [term, setTerm] = useState<TermType>("XDTH")
  const [search, setSearch] = useState("")

  const [fields, setFields] = useState<FieldDef[]>([])
  const [values, setValues] = useState<Record<string, string>>({})
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{ web_url: string; doc_number: string } | null>(null)

  const lockedEmp = useMemo(() => employees.find((e) => e.id === empId) || null, [employees, empId])

  const candidates = useMemo(() => {
    const q = search.toLowerCase().trim()
    return employees
      .filter((e) => !isQuit(e))
      .filter((e) => !q || e.full_name.toLowerCase().includes(q) || (e.staff_code || "").toLowerCase().includes(q))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, "vi"))
  }, [employees, search])

  // Lấy giá trị mặc định khi đã chọn NV (và khi đổi loại thời hạn cho HĐLĐ).
  useEffect(() => {
    if (!empId) return
    let abort = false
    setLoadingPreview(true); setError("")
    fetch("/api/nhan-su/generate-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preview: true, doc_type: docType, term_type: term, employee_id: empId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (abort) return
        if (d.error) { setError(d.error); return }
        setFields(d.fields || [])
        setValues(d.defaults || {})
      })
      .catch(() => !abort && setError("Lỗi tải dữ liệu"))
      .finally(() => !abort && setLoadingPreview(false))
    return () => { abort = true }
  }, [empId, term, docType])

  function setVal(token: string, v: string) {
    setValues((prev) => {
      const next = { ...prev, [token]: v }
      // Phụ lục: tổng lương = lương cố định + phụ cấp (tự cộng khi sửa 2 ô kia).
      if (docType === "phuluc" && (token === "salary" || token === "allowance")) {
        next.total_salary = fmtMoney(parseMoney(next.salary) + parseMoney(next.allowance))
      }
      return next
    })
  }

  async function handleGenerate() {
    if (!empId) return
    setGenerating(true); setError("")
    try {
      const r = await fetch("/api/nhan-su/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType, term_type: term, employee_id: empId, values }),
      })
      const d = await r.json()
      if (r.ok) setResult({ web_url: d.web_url, doc_number: d.doc_number })
      else setError(d.error || `Lỗi ${r.status}`)
    } catch {
      setError("Lỗi kết nối")
    } finally {
      setGenerating(false)
    }
  }

  const auto = fields.filter((f) => f.group === "auto")
  const manual = fields.filter((f) => f.group === "manual")

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  // ----- KẾT QUẢ -----
  if (result) {
    return (
      <div className="py-4 space-y-4 text-center">
        <div className="text-4xl">✅</div>
        <div className="font-semibold text-gray-800">Đã tạo {meta.title} — số {result.doc_number}</div>
        <div className="text-sm text-gray-600">File đã lưu lên SharePoint & vào tab Tài liệu của nhân viên.</div>
        <div className="flex items-center justify-center gap-2 pt-1">
          <a href={result.web_url} target="_blank" rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            📝 Mở & chỉnh sửa trên Word Online
          </a>
          <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Đóng</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-blue-600">← Chọn loại văn bản khác</button>

      {/* Chọn nhân viên (ẩn khi mở từ hồ sơ) */}
      {!initialEmployeeId && !empId && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Chọn nhân viên</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã NV…" className={inputCls + " mb-2"} />
          <div className="border border-gray-300 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
            {candidates.map((e) => (
              <button key={e.id} onClick={() => setEmpId(e.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50/50 text-left">
                <span className="text-sm text-gray-800 truncate">{e.full_name}</span>
                <span className="text-xs text-gray-400 truncate">{e.staff_code ? `· ${e.staff_code}` : ""}{e.office ? ` · ${e.office}` : ""}</span>
              </button>
            ))}
            {candidates.length === 0 && <div className="px-3 py-6 text-center text-sm text-gray-400">Không tìm thấy nhân viên</div>}
          </div>
        </div>
      )}

      {empId && (
        <>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Nhân viên:</span>
            <span className="font-semibold text-gray-800">{lockedEmp?.full_name}</span>
            {!initialEmployeeId && (
              <button onClick={() => { setEmpId(null); setResult(null) }} className="text-xs text-blue-600 hover:underline ml-1">đổi</button>
            )}
          </div>

          {/* HĐLĐ: chọn loại thời hạn */}
          {meta.hasTerm && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Loại HĐLĐ:</span>
              {([["XDTH", "Xác định thời hạn"], ["KXDTH", "Không xác định thời hạn"]] as [TermType, string][]).map(([v, label]) => (
                <button key={v} onClick={() => setTerm(v)}
                  className={`text-xs px-3 py-1.5 rounded-full border ${term === v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {loadingPreview ? (
            <div className="py-8 text-center text-sm text-gray-400">Đang tải dữ liệu nhân viên…</div>
          ) : (
            <>
              {/* Nhóm cần nhập / kiểm tra */}
              {manual.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">✍️ Thông tin cần nhập / kiểm tra</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {manual.map((f) => (
                      <div key={f.token} className={f.wide ? "sm:col-span-2" : ""}>
                        <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                        <input value={values[f.token] ?? ""} onChange={(e) => setVal(f.token, e.target.value)} className={inputCls} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nhóm tự điền từ hồ sơ (vẫn sửa được) */}
              {auto.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-2">📋 Tự điền từ hồ sơ <span className="font-normal text-gray-400">(sửa được nếu cần)</span></div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {auto.map((f) => (
                      <div key={f.token} className={f.wide ? "sm:col-span-2" : ""}>
                        <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
                        <input value={values[f.token] ?? ""} onChange={(e) => setVal(f.token, e.target.value)}
                          className={inputCls + (values[f.token] ? "" : " bg-red-50 border-red-200")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}

              <button onClick={handleGenerate} disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm">
                {generating ? "Đang tạo & tải lên SharePoint…" : `Tạo ${meta.title} & lưu`}
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
