import { createServerClient } from "@/lib/supabase/server"
import CandidateList from "@/components/tuyen-dung/CandidateList"

export default async function TuyenDungPage() {
  const supabase = createServerClient()

  const [{ data: candidates }, { data: jobPostings }] = await Promise.all([
    supabase.from("candidates").select("*, job_postings(id, title, required_exp_years)").order("created_at", { ascending: false }),
    supabase.from("job_postings").select("*").eq("status", "Mở").order("created_at", { ascending: false }),
  ])

  const stats = {
    total: candidates?.length || 0,
    new: candidates?.filter((c) => c.status === "Mới nộp").length || 0,
    interviewing: candidates?.filter((c) => ["Phỏng vấn Online", "Phỏng vấn Trực tiếp"].includes(c.status)).length || 0,
    offer: candidates?.filter((c) => c.status === "Offer").length || 0,
    hired: candidates?.filter((c) => c.status === "Đã nhận việc").length || 0,
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Tuyển dụng</h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Tổng ứng viên", value: stats.total, color: "bg-gray-50 text-gray-700" },
          { label: "Mới nộp", value: stats.new, color: "bg-blue-50 text-blue-700" },
          { label: "Đang phỏng vấn", value: stats.interviewing, color: "bg-purple-50 text-purple-700" },
          { label: "Offer", value: stats.offer, color: "bg-yellow-50 text-yellow-700" },
          { label: "Đã nhận việc", value: stats.hired, color: "bg-green-50 text-green-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <CandidateList initialCandidates={candidates || []} jobPostings={jobPostings || []} />
    </div>
  )
}
