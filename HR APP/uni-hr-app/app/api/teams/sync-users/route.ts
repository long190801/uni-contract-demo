import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { listAllM365Users } from "@/lib/graph/users"

export async function POST() {
  const supabase = createServerClient()

  const m365Users = await listAllM365Users()
  if (!m365Users.length) return NextResponse.json({ synced: 0 })

  // Build email → Teams ID map
  const emailToId: Record<string, string> = {}
  for (const u of m365Users) {
    if (u.mail) emailToId[u.mail.toLowerCase()] = u.id
    if (u.userPrincipalName) emailToId[u.userPrincipalName.toLowerCase()] = u.id
  }

  // Fetch employees
  const { data: employees } = await supabase.from("employees").select("id, email, teams_email")
  let synced = 0

  for (const emp of employees || []) {
    const email = (emp.teams_email || emp.email || "").toLowerCase()
    const teamsId = emailToId[email]
    if (teamsId) {
      await supabase.from("employees").update({ teams_user_id: teamsId }).eq("id", emp.id)
      synced++
    }
  }

  return NextResponse.json({ synced, total: employees?.length || 0 })
}
