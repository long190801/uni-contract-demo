// Điền giá trị token {{...}} vào mẫu .docx đã chuẩn hóa (server-only).
// Dùng JSZip thay chuỗi trong word/document.xml — giữ nguyên phần còn lại.
import { readFile } from "fs/promises"
import path from "path"
import JSZip from "jszip"
import type { DocType } from "./config"
import { metaOf } from "./config"

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// values: { full_name: "Nguyễn Văn A", salary: "15.000.000", ... } (KHÔNG có {{ }})
export async function fillContract(docType: DocType, values: Record<string, string>): Promise<Buffer> {
  const tplPath = path.join(process.cwd(), "lib", "contracts", "templates", metaOf(docType).template)
  const zip = await JSZip.loadAsync(await readFile(tplPath))
  const docXml = zip.file("word/document.xml")
  if (!docXml) throw new Error("Mẫu hợp đồng hỏng (thiếu document.xml)")

  let xml = await docXml.async("string")
  for (const [key, val] of Object.entries(values)) {
    xml = xml.split(`{{${key}}}`).join(xmlEscape(val ?? ""))
  }
  // Dọn token còn sót (không có giá trị) -> để trống.
  xml = xml.replace(/\{\{[a-z_]+\}\}/g, "")
  zip.file("word/document.xml", xml)
  return zip.generateAsync({ type: "nodebuffer" })
}

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
