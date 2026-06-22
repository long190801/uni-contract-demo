import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const status = searchParams.get("status")
  const location = searchParams.get("location")
  const search = searchParams.get("search")

  let query = supabase
    .from("equipment_items")
    .select("*, employees!current_user_id(full_name, staff_code)")
    .order("name")

  if (category) query = query.eq("category", category)
  if (status) query = query.eq("status", status)
  if (location) query = query.eq("location", location)
  if (search) query = query.ilike("name", `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()
  const { data, error } = await supabase.from("equipment_items").insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
