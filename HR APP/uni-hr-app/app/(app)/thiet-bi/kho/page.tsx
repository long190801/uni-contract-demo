import { createServerClient } from "@/lib/supabase/server"
import EquipmentInventory from "@/components/thiet-bi/EquipmentInventory"

export default async function KhoPage() {
  const supabase = createServerClient()
  const { data: items } = await supabase
    .from("equipment_items")
    .select("*, employees!current_user_id(full_name, staff_code)")
    .order("name")

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name, staff_code")
    .eq("status", "Đang làm việc")

  return <EquipmentInventory initialItems={items || []} employees={employees || []} />
}
