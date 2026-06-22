import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const formData = await req.formData()
  const file = formData.get("file") as File
  const employeeId = formData.get("employee_id") as string
  const docType = formData.get("doc_type") as string

  if (!file || !employeeId) return NextResponse.json({ error: "Missing file or employee_id" }, { status: 400 })

  const ext = file.name.split(".").pop()
  const storagePath = `${employeeId}/${Date.now()}-${docType}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("employee-docs")
    .upload(storagePath, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabase.from("employee_documents").insert({
    employee_id: employeeId,
    doc_type: docType,
    file_name: file.name,
    storage_path: storagePath,
    file_size: file.size,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
