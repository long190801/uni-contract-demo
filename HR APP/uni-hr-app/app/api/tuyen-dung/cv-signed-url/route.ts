import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const path = new URL(req.url).searchParams.get("path")
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 })

  const { data, error } = await supabase.storage.from("cvs").createSignedUrl(path, 300)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.redirect(data.signedUrl)
}
