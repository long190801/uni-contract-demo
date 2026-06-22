interface EvalRecord {
  id: string
  overall_score: number | null
  recommendation: string | null
  comments: string | null
  submitted_at: string | null
}

interface Session {
  id: string
  interview_type: string
  scheduled_at: string | null
  interview_evaluations: EvalRecord[]
}

interface Props {
  candidate: Record<string, unknown> | null
}

export default function TabInterviewHistory({ candidate }: Props) {
  if (!candidate) {
    return (
      <div className="text-center py-8 text-gray-400">
        Nhân viên này không có hồ sơ ứng tuyển hoặc chưa được liên kết
      </div>
    )
  }

  const sessions = (candidate.interview_sessions as Session[]) || []

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs text-gray-500">Vị trí ứng tuyển</p>
          <p className="font-medium">{(candidate.job_postings as Record<string,string>)?.title || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Điểm CV</p>
          <p className="font-medium text-blue-600">{String(candidate.cv_score || "—")}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Trường đại học</p>
          <p className="font-medium">{String(candidate.university || "—")}</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-6 text-gray-400">Không có dữ liệu buổi phỏng vấn</div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Phỏng vấn {session.interview_type}</h4>
                <span className="text-sm text-gray-500">
                  {session.scheduled_at
                    ? new Date(session.scheduled_at).toLocaleDateString("vi-VN", { dateStyle: "medium" })
                    : "Chưa xác định"}
                </span>
              </div>
              {session.interview_evaluations.map((ev) => (
                <div key={ev.id} className="bg-gray-50 rounded p-3 text-sm">
                  <div className="flex gap-4">
                    <span>Điểm: <strong>{ev.overall_score ?? "—"}</strong>/10</span>
                    <span>Kết quả: <strong className={
                      ev.recommendation === "Đậu" ? "text-green-600" : ev.recommendation === "Rớt" ? "text-red-600" : "text-yellow-600"
                    }>{ev.recommendation || "—"}</strong></span>
                  </div>
                  {ev.comments && <p className="text-gray-600 mt-1">{ev.comments}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
