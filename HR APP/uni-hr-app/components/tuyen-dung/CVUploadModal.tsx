"use client"

import { useState, useRef } from "react"
import Modal from "@/components/ui/Modal"
import type { Candidate, JobPosting } from "@/types/database"

interface Props {
  open: boolean
  onClose: () => void
  jobPostings: JobPosting[]
  onUploaded: (candidate: Candidate) => void
}

interface ParsedResult {
  full_name: string
  email?: string
  phone?: string
  years_experience: number
  companies_count: number
  university: string
  english_score: string
  cv_summary: string
  cv_score: number
  score_breakdown: Record<string, unknown>
  cv_file_name: string
  cv_storage_path: string
  job_posting_id: string | null
}

export default function CVUploadModal({ open, onClose, jobPostings, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [selectedJobId, setSelectedJobId] = useState("")
  const [parsing, setParsing] = useState(false)
  const [parsed, setParsed] = useState<ParsedResult | null>(null)
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleParse() {
    if (!file) return
    setParsing(true)
    const form = new FormData()
    form.append("file", file)
    form.append("job_posting_id", selectedJobId || "")
    const job = jobPostings.find((j) => j.id === selectedJobId)
    form.append("required_exp_years", String(job?.required_exp_years || 0))

    const res = await fetch("/api/tuyen-dung/cv-upload", { method: "POST", body: form })
    const data = await res.json()
    setParsing(false)
    if (res.ok) setParsed(data)
  }

  async function handleSave() {
    if (!parsed) return
    setSaving(true)
    const res = await fetch("/api/tuyen-dung/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...parsed,
        job_posting_id: selectedJobId || null,
        status: "Mới nộp",
      }),
    })
    const candidate = await res.json()
    setSaving(false)
    if (res.ok) {
      onUploaded(candidate)
      setParsed(null)
      setFile(null)
    }
  }

  function handleClose() {
    setParsed(null)
    setFile(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Upload CV ứng viên" size="lg">
      {!parsed ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí tuyển dụng</label>
            <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">— Chọn vị trí —</option>
              {jobPostings.map((j) => (
                <option key={j.id} value={j.id}>{j.title} ({j.required_exp_years} năm KN)</option>
              ))}
            </select>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => inputRef.current?.click()}>
            <input ref={inputRef} type="file" accept=".pdf" className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <p className="text-3xl mb-2">📄</p>
            {file ? (
              <p className="font-medium text-blue-600">{file.name}</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium">Chọn file CV (PDF)</p>
                <p className="text-xs text-gray-400 mt-1">Tối đa 5MB</p>
              </>
            )}
          </div>

          <button onClick={handleParse} disabled={!file || parsing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium">
            {parsing ? "AI đang phân tích CV..." : "Phân tích CV với AI"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            ✅ AI đã trích xuất thông tin từ CV. Kiểm tra và lưu bên dưới.
          </div>

          {/* Score highlight */}
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium">Điểm CV</p>
            <p className="text-4xl font-bold text-blue-700">{parsed.cv_score}</p>
            <p className="text-xs text-gray-500 mt-1">{String(parsed.score_breakdown?.explanation || "")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Họ và tên", key: "full_name" },
              { label: "Năm kinh nghiệm", key: "years_experience" },
              { label: "Số công ty", key: "companies_count" },
              { label: "Trường ĐH", key: "university" },
              { label: "Tiếng Anh", key: "english_score" },
            ].map(({ label, key }) => (
              <div key={key}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="font-medium">{String((parsed as unknown as Record<string,unknown>)[key] ?? "—")}</p>
              </div>
            ))}
          </div>

          {parsed.cv_summary && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Tóm tắt profile</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{parsed.cv_summary}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setParsed(null)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
              Chọn lại
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
              {saving ? "Đang lưu..." : "Lưu ứng viên"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
