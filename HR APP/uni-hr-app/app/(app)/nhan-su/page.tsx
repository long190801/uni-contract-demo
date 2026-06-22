import { createServerClient } from "@/lib/supabase/server"
import EmployeeList from "@/components/nhan-su/EmployeeList"
import RenewalReminders from "@/components/nhan-su/RenewalReminders"

export default async function NhanSuPage() {
  const supabase = createServerClient()

  // Fetch employees
  const { data: employees } = await supabase
    .from("employees")
    .select("*")
    .order("full_name")

  // Upcoming renewals (next 30 days)
  const today = new Date().toISOString().split("T")[0]
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
  const { data: expiringContracts } = await supabase
    .from("employees")
    .select("id, full_name, contract_type, contract_end_date, office")
    .eq("status", "Đang làm việc")
    .not("contract_end_date", "is", null)
    .gte("contract_end_date", today)
    .lte("contract_end_date", in30)
    .order("contract_end_date")

  const stats = {
    total: employees?.length || 0,
    active: employees?.filter((e) => e.status === "Đang làm việc").length || 0,
    probation: employees?.filter((e) => e.status === "Thử việc").length || 0,
    hcm: employees?.filter((e) => e.office === "HCM" && e.status !== "Nghỉ việc HCM").length || 0,
    hn: employees?.filter((e) => e.office === "HN" && e.status !== "Nghỉ việc HN").length || 0,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ nhân sự</h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Tổng nhân viên", value: stats.total, color: "bg-blue-50 text-blue-700" },
          { label: "Đang làm việc", value: stats.active, color: "bg-green-50 text-green-700" },
          { label: "Thử việc", value: stats.probation, color: "bg-yellow-50 text-yellow-700" },
          { label: "VP HCM", value: stats.hcm, color: "bg-purple-50 text-purple-700" },
          { label: "VP Hà Nội", value: stats.hn, color: "bg-orange-50 text-orange-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Renewal reminders */}
      {(expiringContracts?.length || 0) > 0 && (
        <RenewalReminders contracts={expiringContracts || []} />
      )}

      {/* Employee list */}
      <EmployeeList initialEmployees={employees || []} />
    </div>
  )
}
