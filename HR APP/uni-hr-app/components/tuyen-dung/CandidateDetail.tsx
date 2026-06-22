"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Badge, { candidateStatusVariant } from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import type { CandidateStatus } from "@/types/database"

interface Interviewer {
  id: string
  name: string
  email: string
}

interface Props {
  candidate: Record<string, unknown>
  interviewers: Interviewer[]
}

const ACTION_BUTTONS: Record<string, Array<{ label: string; action: string; color: string }>> = {
  "Mới nộp":               [{ label: "Mời PV Online", action: "Tiến Online", color: "blue" }, { label: "Từ chối", action: "Từ chối Online", color: "red" }],
  "Đang xem xét":          [{ label: "Mời PV Online", action: "Tiến Online", color: "blue" }, { label: "Từ chối", action: "Từ chối Online", color: "red" }],
  "Phỏng vấn Online":      [{ label: "Mời PV Trực tiếp", action: "Tiến Trực tiếp", color: "blue" }, { label: "Từ chối", action: "Từ chối Online", color: "red" }],
  "Phỏng vấn Trực tiếp":  [{ label: "Gửi Offer", action: "Gửi Offer", color: "green" }, { label: "Từ chối", action: "Từ chối Trực tiếp", color: "red" }],
  "Offer":                 [{ label: "Xác nhận nhận việc", action: "Nhận việc", color: "green" }],
}

export default function CandidateDetail({ candidate, interviewers }: Props) {
  const [status, setStatus] = useState(String(candidate.status || ""))
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [actionLoading, setActionLoading] = useState("")
  const [slots, setSlots] = useState({ slot_1: "", slot_2: "", slot_3: "", interview_type: "Online" as "Online" | "Trực tiếp" })
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])

  const job = candidate.job_postings as Record<string, unknown> | null
  const sessions = (candidate.interview_sessions as Record<string, unknown>[]) || []

  async function handleAction(action: string) {
    setActionLoading(action)
    const res = await fetch("/api/tuyen-dung/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate_id: candidate.id, action_type: action, decided_by: "HR" }),
    })
    const data = await res.json()
    setActionLoading("")
    if (res.ok) setStatus(data.status)
  }

  async function handleCreateSlots() {
    const res = await fetch("/api/tuyen-dung/interview-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidate.id,
        interview_type: slots.interview_type,
        slot_1: slots.slot_1 || null,
        slot_2: slots.slot_2 || null,
        slot_3: slots.slot_3 || null,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setStatus(data.candidate.status)
      setShowSlotModal(false)
    }
  }

  async function handleSendEvalForms() {
    // First create a session
    const sessionRes = await fetch("/api/tuyen-dung/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidate.id,
        interview_type: status.includes("Online") ? "Online" : "Trực tiếp",
      }),
    })
    const session = await sessionRes.json()

    await fetch("/api/tuyen-dung/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: session.id, interviewer_ids: selectedInterviewers }),
    })
    setShowEvalModal(false)
  }

  const actions = ACTION_BUTTONS[status] || []

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/tuyen-dung" className="hover:text-blue-600">Tuyển dụng</Link>
        <span>/</span>
        <span className="text-gray-800">{String(candidate.full_name)}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{String(candidate.full_name)}</h1>
            <p className="text-gray-500">{String(job?.title || "—")} · {String(candidate.email || "")} · {String(candidate.phone || "")}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge label={status} variant={candidateStatusVariant(status as CandidateStatus)} />
              {candidate.cv_score !== null && (
                <span className="text-blue-600 font-bold">Điểm CV: {String(candidate.cv_score)}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {actions.map((btn) => (
              <button key={btn.action}
                onClick={() => btn.action === "Tiến Online" || btn.action === "Tiến Trực tiếp"
                  ? setShowSlotModal(true)
                  : handleAction(btn.action)}
                disabled={actionLoading === btn.action}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors ${
                  btn.color === "red" ? "bg-red-600 hover:bg-red-700" : btn.color === "green" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                }`}>
                {actionLoading === btn.action ? "..." : btn.label}
              </button>
            ))}
            {["Phỏng vấn Online", "Phỏng vấn Trực tiếp"].includes(status) && (
              <button onClick={() => setShowEvalModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white">
                Gửi form đánh giá
              </button>
            )}
          </div>
        </div>

        {/* CV details */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100">
          {[
            { label: "Năm KN", value: candidate.years_experience },
            { label: "Số công ty", value: candidate.companies_count },
            { label: "Trường ĐH", value: candidate.university },
            { label: "Tiếng Anh", value: candidate.english_score },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium">{String(value || "—")}</p>
            </div>
          ))}
        </div>

        {candidate.cv_summary ? (
          <div className="mt-4 bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Tóm tắt CV (AI)</p>
            <p className="text-sm text-gray-700">{String(candidate.cv_summary)}</p>
          </div>
        ) : null}

        {candidate.cv_storage_path ? (
          <div className="mt-3">
            <a href={`/api/tuyen-dung/cv-signed-url?path=${encodeURIComponent(String(candidate.cv_storage_path))}`}
              target="_blank" className="text-sm text-blue-600 hover:underline">
              📄 Xem CV gốc
            </a>
          </div>
        ) : null}
      </div>

      {/* Interview sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Lịch sử phỏng vấn</h3>
          {sessions.map((session) => {
            const evals = (session.interview_evaluations as Record<string, unknown>[]) || []
            return (
              <div key={String(session.id)} className="border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Phỏng vấn {String(session.interview_type)}</h4>
                  <span className="text-sm text-gray-500">
                    {session.scheduled_at ? format(new Date(String(session.scheduled_at)), "dd/MM/yyyy HH:mm", { locale: vi }) : "—"}
                  </span>
                </div>
                {evals.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa có đánh giá</p>
                ) : (
                  <div className="space-y-2">
                    {evals.map((ev) => (
                      <div key={String(ev.id)} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-gray-500">{((ev.interviewers as Record<string,string>)?.name) || "—"}</span>
                          <span>Điểm: <strong>{String(ev.overall_score ?? "—")}</strong>/10</span>
                          <span className={`font-medium ${ev.recommendation === "Đậu" ? "text-green-600" : ev.recommendation === "Rớt" ? "text-red-600" : "text-yellow-600"}`}>
                            {String(ev.recommendation || "—")}
                          </span>
                        </div>
                        {ev.comments ? <p className="text-gray-600 mt-1">{String(ev.comments)}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Interview slots modal */}
      <Modal open={showSlotModal} onClose={() => setShowSlotModal(false)} title="Đặt lịch phỏng vấn" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại phỏng vấn</label>
            <div className="flex gap-2">
              {(["Online", "Trực tiếp"] as const).map((t) => (
                <button key={t} onClick={() => setSlots((s) => ({ ...s, interview_type: t }))}
                  className={`px-4 py-2 rounded-lg text-sm border ${slots.interview_type === t ? "bg-blue-600 text-white border-blue-600" : "text-gray-600 border-gray-300"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {["slot_1", "slot_2", "slot_3"].map((k, i) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lựa chọn {i + 1}</label>
              <input type="datetime-local" value={(slots as Record<string,string>)[k]}
                onChange={(e) => setSlots((s) => ({ ...s, [k]: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <button onClick={handleCreateSlots}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm">
            Gửi thư mời phỏng vấn
          </button>
        </div>
      </Modal>

      {/* Evaluation form modal */}
      <Modal open={showEvalModal} onClose={() => setShowEvalModal(false)} title="Gửi form đánh giá" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Chọn người phỏng vấn để gửi form đánh giá:</p>
          {interviewers.map((iv) => (
            <label key={iv.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedInterviewers.includes(iv.id)}
                onChange={(e) => setSelectedInterviewers((prev) =>
                  e.target.checked ? [...prev, iv.id] : prev.filter((x) => x !== iv.id))}
                className="text-blue-600" />
              <span className="text-sm">{iv.name} ({iv.email})</span>
            </label>
          ))}
          <button onClick={handleSendEvalForms} disabled={selectedInterviewers.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm">
            Gửi form đánh giá
          </button>
        </div>
      </Modal>
    </div>
  )
}
