"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Candidate, JobPosting, CandidateStatus } from "@/types/database"
import Badge, { candidateStatusVariant } from "@/components/ui/Badge"
import CVUploadModal from "@/components/tuyen-dung/CVUploadModal"

const KANBAN_COLS: Array<{ id: CandidateStatus | "active"; label: string; statuses: CandidateStatus[] }> = [
  { id: "Mới nộp", label: "Mới nộp", statuses: ["Mới nộp", "Đang xem xét"] },
  { id: "Phỏng vấn Online", label: "PV Online", statuses: ["Mời PV Online", "Phỏng vấn Online"] },
  { id: "Phỏng vấn Trực tiếp", label: "PV Trực tiếp", statuses: ["Mời PV Trực tiếp", "Phỏng vấn Trực tiếp"] },
  { id: "Offer", label: "Offer", statuses: ["Offer"] },
  { id: "Đã nhận việc", label: "Nhận việc", statuses: ["Đã nhận việc"] },
]

interface Props {
  initialCandidates: (Candidate & { job_postings: JobPosting | null })[]
  jobPostings: JobPosting[]
}

export default function CandidateList({ initialCandidates, jobPostings }: Props) {
  const [candidates, setCandidates] = useState(initialCandidates)
  const [view, setView] = useState<"list" | "kanban">("list")
  const [search, setSearch] = useState("")
  const [filterJob, setFilterJob] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)

  const filtered = useMemo(() => candidates.filter((c) => {
    if (search && !c.full_name.toLowerCase().includes(search.toLowerCase())) return false
    if (filterJob && c.job_posting_id !== filterJob) return false
    if (filterStatus && c.status !== filterStatus) return false
    return true
  }), [candidates, search, filterJob, filterStatus])

  function handleUploaded(newCandidate: Candidate) {
    setCandidates((prev) => [newCandidate as Candidate & { job_postings: JobPosting | null }, ...prev])
    setShowUpload(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
        <input placeholder="Tìm tên ứng viên..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <select value={filterJob} onChange={(e) => setFilterJob(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả vị trí</option>
          {jobPostings.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Tất cả trạng thái</option>
          {["Mới nộp","Đang xem xét","Mời PV Online","Phỏng vấn Online","Mời PV Trực tiếp","Phỏng vấn Trực tiếp","Offer","Đã nhận việc","Từ chối Online","Từ chối Trực tiếp"].map((s) =>
            <option key={s}>{s}</option>
          )}
        </select>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView("list")}
            className={`px-3 py-2 text-sm rounded-lg ${view === "list" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}>
            ☰ Danh sách
          </button>
          <button onClick={() => setView("kanban")}
            className={`px-3 py-2 text-sm rounded-lg ${view === "kanban" ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"}`}>
            ▦ Kanban
          </button>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
          + Upload CV
        </button>
      </div>

      {/* List view */}
      {view === "list" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Ứng viên</th>
                <th className="px-4 py-3 text-left">Vị trí</th>
                <th className="px-4 py-3 text-left">Điểm CV</th>
                <th className="px-4 py-3 text-left">KN (năm)</th>
                <th className="px-4 py-3 text-left">Trường ĐH</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ngày nộp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-blue-50 cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/tuyen-dung/${c.id}`} className="font-medium text-blue-700 hover:underline">
                      {c.full_name}
                    </Link>
                    {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </td>
                  <td className="px-4 py-3">{c.job_postings?.title || "—"}</td>
                  <td className="px-4 py-3">
                    {c.cv_score !== null ? (
                      <span className="font-bold text-blue-600">{c.cv_score}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">{c.years_experience ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.university || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge label={c.status} variant={candidateStatusVariant(c.status)} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(c.created_at).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Không có ứng viên</div>}
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {filtered.length} ứng viên
          </div>
        </div>
      )}

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="p-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            {KANBAN_COLS.map((col) => {
              const colCandidates = filtered.filter((c) => col.statuses.includes(c.status as CandidateStatus))
              return (
                <div key={col.id} className="w-56 flex-shrink-0">
                  <div className="bg-gray-100 rounded-lg p-2 mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-600">{col.label}</span>
                    <span className="text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded-full">{colCandidates.length}</span>
                  </div>
                  <div className="space-y-2">
                    {colCandidates.map((c) => (
                      <Link key={c.id} href={`/tuyen-dung/${c.id}`}
                        className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition-all">
                        <p className="font-medium text-sm text-gray-800">{c.full_name}</p>
                        <p className="text-xs text-gray-400">{c.job_postings?.title || "—"}</p>
                        {c.cv_score !== null && (
                          <p className="text-xs font-bold text-blue-600 mt-1">Điểm: {c.cv_score}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <CVUploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        jobPostings={jobPostings}
        onUploaded={handleUploaded}
      />
    </div>
  )
}
