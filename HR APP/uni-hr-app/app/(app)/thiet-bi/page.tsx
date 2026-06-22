import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function ThietBiPage() {
  const supabase = createServerClient()

  const [{ data: items }, { data: requests }] = await Promise.all([
    supabase.from("equipment_items").select("status, category, location"),
    supabase.from("equipment_requests").select("status, request_type").eq("status", "Chờ duyệt"),
  ])

  const stats = {
    total: items?.length || 0,
    inUse: items?.filter((i) => i.status === "Đang sử dụng").length || 0,
    inStock: items?.filter((i) => i.status === "Trong kho").length || 0,
    repairing: items?.filter((i) => i.status === "Đang sửa chữa").length || 0,
    pending: requests?.length || 0,
  }

  const REQUEST_TYPES = [
    { type: "Xin cấp mới", icon: "🆕", desc: "Yêu cầu cấp thiết bị mới" },
    { type: "Thiết bị hư hỏng", icon: "🔧", desc: "Báo cáo hỏng hóc" },
    { type: "Trả/thu hồi", icon: "↩️", desc: "Trả thiết bị" },
    { type: "Đổi người dùng", icon: "🔄", desc: "Chuyển thiết bị" },
    { type: "Mượn về nhà", icon: "🏠", desc: "Mượn tạm thời" },
    { type: "Nâng cấp", icon: "⬆️", desc: "Nâng cấp thiết bị" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Quản lý Trang thiết bị</h1>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Tổng thiết bị", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Đang sử dụng", value: stats.inUse, color: "bg-purple-50 text-purple-700" },
          { label: "Trong kho", value: stats.inStock, color: "bg-green-50 text-green-700" },
          { label: "Đang sửa chữa", value: stats.repairing, color: "bg-yellow-50 text-yellow-700" },
          { label: "Yêu cầu chờ duyệt", value: stats.pending, color: stats.pending > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/thiet-bi/kho"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow transition-all">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-semibold text-gray-800">Kho thiết bị</h3>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý toàn bộ thiết bị trong kho</p>
        </Link>
        <Link href="/thiet-bi/yeu-cau"
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow transition-all">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="font-semibold text-gray-800">Yêu cầu thiết bị</h3>
          <p className="text-sm text-gray-500 mt-1">Xem và xử lý các yêu cầu đang chờ duyệt</p>
          {stats.pending > 0 && (
            <span className="inline-block mt-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {stats.pending} chờ duyệt
            </span>
          )}
        </Link>
      </div>

      {/* Request types */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Tạo yêu cầu mới</h2>
        <div className="grid grid-cols-3 gap-3">
          {REQUEST_TYPES.map((rt) => (
            <Link key={rt.type} href={`/thiet-bi/yeu-cau?type=${encodeURIComponent(rt.type)}&new=1`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:border-blue-300 hover:shadow transition-all flex items-center gap-3">
              <span className="text-2xl">{rt.icon}</span>
              <div>
                <p className="font-medium text-sm text-gray-800">{rt.type}</p>
                <p className="text-xs text-gray-400">{rt.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
