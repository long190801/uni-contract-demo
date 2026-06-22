import { createServerClient } from "@/lib/supabase/server"
import RequestsDashboard from "@/components/thiet-bi/RequestsDashboard"

export default async function YeuCauPage() {
  const supabase = createServerClient()

  const [{ data: requests }, { data: items }, { data: employees }] = await Promise.all([
    supabase.from("equipment_requests").select(`
      *,
      equipment_items(name, equipment_code, category),
      employees!requested_by_employee(full_name, staff_code)
    `).order("requested_at", { ascending: false }),
    supabase.from("equipment_items").select("id, name, equipment_code, category").eq("status", "Trong kho"),
    supabase.from("employees").select("id, full_name, staff_code").eq("status", "Đang làm việc"),
  ])

  return <RequestsDashboard
    initialRequests={requests || []}
    availableItems={items || []}
    employees={employees || []}
  />
}
