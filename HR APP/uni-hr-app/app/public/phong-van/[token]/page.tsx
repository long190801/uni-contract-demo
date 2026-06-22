"use client"

import { useState, useEffect, use } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface SlotData {
  id: string
  interview_type: string
  slot_1: string | null
  slot_2: string | null
  slot_3: string | null
  candidate_response: string | null
  candidates: {
    full_name: string
    job_postings: { title: string } | null
  }
}

export default function CandidateResponsePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [slot, setSlot] = useState<SlotData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [response, setResponse] = useState<"Chấp nhận" | "Đề xuất khác" | "Từ chối">("Chấp nhận")
  const [chosenSlot, setChosenSlot] = useState("")
  const [proposedTime, setProposedTime] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/tuyen-dung/interview-slots/public/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setSlot(data)
        setLoading(false)
      })
  }, [token])

  async function handleSubmit() {
    setSaving(true)
    const res = await fetch("/api/tuyen-dung/interview-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        response,
        chosen_slot: response === "Chấp nhận" ? chosenSlot : null,
        proposed_time: response === "Đề xuất khác" ? proposedTime : null,
      }),
    })
    setSaving(false)
    if (res.ok) setSubmitted(true)
    else setError("Đã có lỗi xảy ra. Vui lòng thử lại.")
  }

  const formatSlot = (s: string) => format(new Date(s), "EEEE, dd/MM/yyyy HH:mm", { locale: vi })
  const slots = [slot?.slot_1, slot?.slot_2, slot?.slot_3].filter(Boolean) as string[]

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  if (!slot) return null

  if (submitted || slot.candidate_response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đã nhận phản hồi của bạn!</h2>
          <p className="text-gray-600">Phòng Nhân sự UNI sẽ liên hệ xác nhận sớm nhất.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">U</div>
          <h1 className="text-xl font-bold text-gray-800">Thư mời phỏng vấn</h1>
          <p className="text-gray-600 text-sm mt-1">
            Kính gửi <strong>{slot.candidates.full_name}</strong> — vị trí {slot.candidates.job_postings?.title || ""}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lựa chọn của bạn:</label>
            <div className="space-y-2">
              {(["Chấp nhận", "Đề xuất khác", "Từ chối"] as const).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="response" value={r} checked={response === r} onChange={() => setResponse(r)}
                    className="text-blue-600" />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
          </div>

          {response === "Chấp nhận" && slots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn khung giờ:</label>
              <div className="space-y-2">
                {slots.map((s, i) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer border rounded-lg p-3 hover:bg-blue-50">
                    <input type="radio" name="slot" value={s} checked={chosenSlot === s} onChange={() => setChosenSlot(s)}
                      className="text-blue-600" />
                    <span className="text-sm">Lựa chọn {i + 1}: <strong>{formatSlot(s)}</strong></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {response === "Đề xuất khác" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian đề xuất của bạn:</label>
              <input type="datetime-local" value={proposedTime} onChange={(e) => setProposedTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <button onClick={handleSubmit} disabled={saving ||
            (response === "Chấp nhận" && !chosenSlot) ||
            (response === "Đề xuất khác" && !proposedTime)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors">
            {saving ? "Đang gửi..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  )
}
