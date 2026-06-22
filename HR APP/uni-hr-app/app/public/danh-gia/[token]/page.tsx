"use client"

import { useState, useEffect, use } from "react"

interface EvalData {
  id: string
  submitted_at: string | null
  interview_sessions: {
    interview_type: string
    candidates: {
      full_name: string
      job_postings: { title: string } | null
    }
  }
  interviewers: { name: string }
}

const SCORE_CRITERIA = [
  { key: "professional", label: "Năng lực chuyên môn" },
  { key: "communication", label: "Kỹ năng giao tiếp" },
  { key: "attitude", label: "Thái độ / Motivation" },
  { key: "english", label: "Tiếng Anh" },
  { key: "culture_fit", label: "Phù hợp văn hoá công ty" },
]

export default function EvaluationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [evalData, setEvalData] = useState<EvalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [recommendation, setRecommendation] = useState<"Đậu" | "Rớt" | "Xem xét thêm">("Xem xét thêm")
  const [comments, setComments] = useState("")
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch(`/api/tuyen-dung/evaluations/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setEvalData(data)
        setLoading(false)
      })
  }, [token])

  const overallScore = Object.values(scores).length > 0
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) * 10) / 10
    : 0

  async function handleSubmit() {
    setSaving(true)
    const res = await fetch(`/api/tuyen-dung/evaluations/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, overall_score: overallScore, recommendation, comments }),
    })
    setSaving(false)
    if (res.ok) setSubmitted(true)
    else setError("Đã có lỗi xảy ra.")
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  if (!evalData) return null

  if (submitted || evalData.submitted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold">Đã lưu đánh giá!</h2>
          <p className="text-gray-600 mt-2">Cảm ơn {evalData.interviewers.name} đã hoàn thành form đánh giá.</p>
        </div>
      </div>
    )
  }

  const session = evalData.interview_sessions
  const candidate = session?.candidates

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">U</div>
          <h1 className="text-xl font-bold text-gray-800">Form đánh giá phỏng vấn</h1>
          <p className="text-gray-600 text-sm mt-1">
            Ứng viên: <strong>{candidate?.full_name}</strong> — {candidate?.job_postings?.title || ""}
          </p>
          <p className="text-gray-500 text-xs">Người đánh giá: {evalData.interviewers.name} · Vòng {session.interview_type}</p>
        </div>

        <div className="space-y-5">
          {SCORE_CRITERIA.map((c) => (
            <div key={c.key}>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-1">
                <span>{c.label}</span>
                <span className="text-blue-600 font-bold">{scores[c.key] ?? "—"}/10</span>
              </label>
              <input type="range" min={1} max={10} step={1}
                value={scores[c.key] || 5}
                onChange={(e) => setScores((s) => ({ ...s, [c.key]: parseInt(e.target.value) }))}
                className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 (Yếu)</span><span>10 (Xuất sắc)</span>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-sm text-gray-600">Điểm trung bình</p>
            <p className="text-3xl font-bold text-blue-600">{overallScore || "—"}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kết quả</label>
            <div className="flex gap-3">
              {(["Đậu", "Xem xét thêm", "Rớt"] as const).map((r) => (
                <button key={r} onClick={() => setRecommendation(r)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    recommendation === r
                      ? r === "Đậu" ? "bg-green-600 text-white border-green-600"
                      : r === "Rớt" ? "bg-red-600 text-white border-red-600"
                      : "bg-yellow-500 text-white border-yellow-500"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}>{r}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhận xét chi tiết</label>
            <textarea value={comments} onChange={(e) => setComments(e.target.value)}
              rows={4} placeholder="Nhận xét, điểm mạnh, điểm cần cải thiện..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <button onClick={handleSubmit} disabled={saving || Object.keys(scores).length < SCORE_CRITERIA.length}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium">
            {saving ? "Đang lưu..." : "Nộp đánh giá"}
          </button>
        </div>
      </div>
    </div>
  )
}
