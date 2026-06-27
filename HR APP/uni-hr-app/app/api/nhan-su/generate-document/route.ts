import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/auth"
import { resolveSiteFolder, uploadFileToFolder } from "@/lib/graph/sharepoint"
import { fillContract, DOCX_MIME } from "@/lib/contracts/fill"
import {
  type DocType, type TermType, buildDefaults, fieldsOf, metaOf, typeCode,
} from "@/lib/contracts/config"

const SP_SITE_URL = process.env.SHAREPOINT_SITE_URL
const SP_FOLDER = process.env.SHAREPOINT_FOLDER

const VALID: DocType[] = ["hdld", "hdtv", "hdctv", "phuluc"]
const todayIso = () => new Date().toISOString().slice(0, 10)
const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "_").trim()

async function getEmployee(supabase: ReturnType<typeof createServerClient>, id: string) {
  const { data, error } = await supabase.from("employees").select("*").eq("id", id).single()
  return error || !data ? null : data
}

// Đếm STT văn bản cùng loại đã tạo cho NV -> số tiếp theo.
async function nextSeq(
  supabase: ReturnType<typeof createServerClient>,
  employeeId: string,
  code: string
): Promise<number> {
  const { count } = await supabase
    .from("generated_documents")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("doc_type", code)
  return (count || 0) + 1
}

// GET /api/nhan-su/generate-document?employee_id=...  -> danh sách văn bản đã tạo
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const employeeId = req.nextUrl.searchParams.get("employee_id")
  if (!employeeId) return NextResponse.json({ error: "Thiếu employee_id" }, { status: 400 })
  const { data, error } = await supabase
    .from("generated_documents")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ documents: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json().catch(() => ({}))
  const { employee_id, preview } = body
  const doc_type = body.doc_type as DocType
  const term_type = body.term_type as TermType | undefined

  if (!employee_id || !VALID.includes(doc_type))
    return NextResponse.json({ error: "Thiếu/loại văn bản không hợp lệ" }, { status: 400 })

  const emp = await getEmployee(supabase, employee_id)
  if (!emp) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 })

  const code = typeCode(doc_type, term_type)
  const seq = await nextSeq(supabase, employee_id, code)
  const defaults = buildDefaults(doc_type, term_type, emp, seq, todayIso())

  // --- Chế độ xem trước: trả field + giá trị mặc định để render bảng sửa ---
  if (preview) {
    return NextResponse.json({
      fields: fieldsOf(doc_type),
      defaults,
      doc_title: metaOf(doc_type).title,
      employee_name: emp.full_name,
    })
  }

  // --- Chế độ tạo thật ---
  if (!SP_SITE_URL)
    return NextResponse.json({ error: "Chưa cấu hình site SharePoint (SHAREPOINT_SITE_URL)" }, { status: 500 })

  const session = await auth()
  const accessToken = session?.accessToken
  if (session?.error === "RefreshAccessTokenError" || !accessToken)
    return NextResponse.json(
      { error: "Phiên Microsoft đã hết hạn — đăng xuất rồi đăng nhập lại." },
      { status: 401 }
    )

  // Giá trị cuối = mặc định <- ghi đè bởi giá trị người dùng đã sửa.
  const values: Record<string, string> = { ...defaults, ...(body.values || {}) }
  const docNumber = values.contract_no || values.appendix_no || ""

  let buffer: Buffer
  try {
    buffer = await fillContract(doc_type, values)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi điền mẫu" }, { status: 500 })
  }

  const fileName = `${safeName(metaOf(doc_type).title)} - ${safeName(String(emp.full_name || "NV"))} - ${safeName(docNumber || "")}.docx`
  let webUrl: string
  try {
    const folder = await resolveSiteFolder(accessToken, SP_SITE_URL, SP_FOLDER)
    const uploaded = await uploadFileToFolder(accessToken, folder, fileName, buffer, DOCX_MIME)
    webUrl = uploaded.webUrl
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi tải lên SharePoint" }, { status: 502 })
  }

  // Lưu vào generated_documents (để đếm STT + liệt kê)...
  const { data: gen, error: genErr } = await supabase
    .from("generated_documents")
    .insert({
      employee_id,
      doc_type: code,
      doc_number: docNumber,
      title: `${metaOf(doc_type).title} - ${emp.full_name}`,
      web_url: webUrl,
      field_values: values,
      created_by: session?.user?.email ?? null,
    })
    .select()
    .single()
  if (genErr) return NextResponse.json({ error: genErr.message }, { status: 500 })

  // ...và employee_documents để hiện trong tab Tài liệu (link SharePoint).
  // doc_type bị giới hạn bởi CHECK constraint (CV/HĐLĐ/CMND/Ảnh/Khác): HĐ lao động,
  // thử việc, phụ lục đều là tài liệu lao động -> "HĐLĐ"; CTV là HĐ dịch vụ -> "Khác".
  const docCategory = doc_type === "hdctv" ? "Khác" : "HĐLĐ"
  await supabase.from("employee_documents").insert({
    employee_id,
    doc_type: docCategory,
    file_name: fileName,
    external_url: webUrl,
    source: "sharepoint",
    file_size: buffer.length,
  })

  return NextResponse.json({ document: gen, web_url: webUrl, doc_number: docNumber }, { status: 201 })
}
