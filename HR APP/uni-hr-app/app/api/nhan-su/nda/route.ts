import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"
import JSZip from "jszip"
import { createServerClient } from "@/lib/supabase/server"
import { auth } from "@/auth"
import { resolveSiteFolder, uploadFileToFolder } from "@/lib/graph/sharepoint"

const TEMPLATE_PATH = path.join(process.cwd(), "lib", "nda", "nda-template.docx")
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
// SharePoint site + folder where generated NDA files are stored.
const SP_SITE_URL = process.env.SHAREPOINT_SITE_URL
const SP_FOLDER = process.env.SHAREPOINT_FOLDER

// Các trường cá nhân của Bên Nhận Thông Tin cần điền vào NDA.
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "full_name", label: "Họ và tên" },
  { key: "date_of_birth", label: "Ngày sinh" },
  { key: "id_card_number", label: "CMND/CCCD/Hộ chiếu" },
  { key: "id_card_issued_date", label: "Ngày cấp" },
  { key: "id_card_issued_place", label: "Nơi cấp" },
  { key: "address", label: "Địa chỉ thường trú" },
]

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// YYYY-MM-DD (hoặc timestamp) -> dd/mm/yyyy. Trả "" nếu không có/không hợp lệ.
function toVNDate(value?: string | null): string {
  if (!value) return ""
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return ""
  return `${m[3]}/${m[2]}/${m[1]}`
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { employee_id, sign_date } = await req.json().catch(() => ({}))
  if (!employee_id) return NextResponse.json({ error: "Thiếu employee_id" }, { status: 400 })

  // SharePoint upload uses the logged-in user's delegated Graph token.
  if (!SP_SITE_URL) {
    return NextResponse.json({ error: "Chưa cấu hình site SharePoint (SHAREPOINT_SITE_URL)" }, { status: 500 })
  }
  const session = await auth()
  const accessToken = session?.accessToken
  if (session?.error === "RefreshAccessTokenError" || !accessToken) {
    return NextResponse.json(
      { error: "Phiên đăng nhập Microsoft đã hết hạn — vui lòng đăng xuất rồi đăng nhập lại." },
      { status: 401 }
    )
  }

  const { data: emp, error: empErr } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employee_id)
    .single()
  if (empErr || !emp) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 })

  // Cảnh báo (không chặn) nếu thiếu thông tin — chỗ thiếu để trống trên form.
  const missing = REQUIRED_FIELDS.filter((f) => !String(emp[f.key] ?? "").trim()).map((f) => f.label)

  // Ngày ký: dùng ngày người dùng chọn, tách thành ngày / tháng / năm.
  const signParts = toVNDate(sign_date).split("/") // [dd, mm, yyyy] hoặc []
  const tokens: Record<string, string> = {
    "{{full_name}}": String(emp.full_name ?? ""),
    "{{dob}}": toVNDate(emp.date_of_birth),
    "{{id_no}}": String(emp.id_card_number ?? ""),
    "{{id_date}}": toVNDate(emp.id_card_issued_date),
    "{{id_place}}": String(emp.id_card_issued_place ?? ""),
    "{{address}}": String(emp.address ?? ""),
    "{{sign_day}}": signParts[0] ?? "",
    "{{sign_month}}": signParts[1] ?? "",
    "{{sign_year}}": signParts[2] ?? "",
  }

  // Mở template, thay token trong document.xml (giữ nguyên toàn bộ phần còn lại).
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(await readFile(TEMPLATE_PATH))
  } catch {
    return NextResponse.json({ error: "Không đọc được template NDA" }, { status: 500 })
  }
  const docXmlFile = zip.file("word/document.xml")
  if (!docXmlFile) return NextResponse.json({ error: "Template NDA hỏng" }, { status: 500 })

  let xml = await docXmlFile.async("string")
  for (const [token, value] of Object.entries(tokens)) {
    xml = xml.split(token).join(xmlEscape(value))
  }
  zip.file("word/document.xml", xml)
  const buffer = await zip.generateAsync({ type: "nodebuffer" })

  // Tải file lên SharePoint (Legal7), không lưu trên Supabase Storage nữa.
  const fileName = `NDA - ${emp.full_name || "nhan-vien"}.docx`
  let webUrl: string
  try {
    const folder = await resolveSiteFolder(accessToken, SP_SITE_URL, SP_FOLDER)
    const uploaded = await uploadFileToFolder(accessToken, folder, fileName, buffer, DOCX_MIME)
    webUrl = uploaded.webUrl
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi tải lên SharePoint" }, { status: 502 })
  }

  // Ghi nhận trong bảng employee_documents dưới dạng tài liệu SharePoint (link ngoài).
  const { data: doc, error: dbError } = await supabase
    .from("employee_documents")
    .insert({
      employee_id,
      doc_type: "Khác",
      file_name: fileName,
      external_url: webUrl,
      source: "sharepoint",
      file_size: buffer.length,
    })
    .select()
    .single()
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ document: doc, missing }, { status: 201 })
}
