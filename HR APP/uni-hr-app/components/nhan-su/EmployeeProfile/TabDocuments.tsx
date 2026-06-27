"use client"

import { useState, useRef } from "react"
import { fmtDate } from "@/lib/format"

interface Document {
  id: string
  doc_type: string
  file_name: string
  storage_path: string | null
  external_url?: string | null
  source?: string | null
  uploaded_at: string
}

interface Props {
  employee: Record<string, unknown>
}

export default function TabDocuments({ employee }: Props) {
  const docs = (employee.employee_documents as Document[]) || []
  const [documents, setDocuments] = useState(docs)
  const [uploading, setUploading] = useState(false)
  const [otherType, setOtherType] = useState("Khác")   // loại cho mục "Tài liệu khác"
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingType = useRef("HĐLĐ")                    // loại cho lần upload đang chờ chọn file

  // Mở hộp thoại chọn file, ghi nhớ sẽ upload vào mục nào (HĐLĐ = Hợp đồng).
  function pickFile(docType: string) {
    pendingType.current = docType
    inputRef.current?.click()
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    form.append("employee_id", String(employee.id))
    form.append("doc_type", pendingType.current)

    const res = await fetch("/api/nhan-su/documents", { method: "POST", body: form })
    const data = await res.json()
    setUploading(false)
    if (res.ok) setDocuments((prev) => [...prev, data])
  }

  async function handleDelete(docId: string, storagePath: string | null) {
    if (!confirm("Xóa tài liệu này?")) return
    await fetch(`/api/nhan-su/documents/${docId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storage_path: storagePath }),
    })
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  // Open the document inline in a new browser tab (preview, no forced download).
  // SharePoint docs link straight out; Supabase docs need a signed URL.
  // Open the blank tab synchronously inside the click handler so popup blockers
  // don't kill it while we fetch the signed URL.
  async function handleOpen(doc: Document) {
    if (doc.external_url) { window.open(doc.external_url, "_blank"); return }
    const w = window.open("", "_blank")
    const res = await fetch(`/api/nhan-su/documents/signed-url?path=${encodeURIComponent(doc.storage_path!)}`)
    const { url } = await res.json()
    if (w) w.location.href = url
    else window.open(url, "_blank")
  }

  async function handleDownload(doc: Document) {
    if (doc.external_url) { window.open(doc.external_url, "_blank"); return }
    const res = await fetch(`/api/nhan-su/documents/signed-url?path=${encodeURIComponent(doc.storage_path!)}`)
    const { url } = await res.json()
    const a = document.createElement("a")
    a.href = url
    a.download = doc.file_name
    a.click()
  }

  // Split into two sections: contracts (HĐLĐ) and everything else.
  const contracts = documents.filter((d) => d.doc_type === "HĐLĐ")
  const others = documents.filter((d) => d.doc_type !== "HĐLĐ")

  const docRow = (doc: Document) => (
    <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100">
      <button onClick={() => handleOpen(doc)} title="Mở tài liệu trong tab mới"
        className="flex items-center gap-3 text-left flex-1 min-w-0 group">
        <span className="text-2xl">{doc.source === "sharepoint" ? "🔗" : "📄"}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 group-hover:underline truncate">{doc.file_name}</p>
          <p className="text-xs text-gray-500">
            {doc.doc_type} · {fmtDate(doc.uploaded_at)}{doc.source === "sharepoint" ? " · SharePoint" : ""}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-1 ml-2 shrink-0">
        <button onClick={() => handleDownload(doc)} title={doc.source === "sharepoint" ? "Mở trên SharePoint" : "Tải về"}
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-blue-600 hover:bg-blue-50">⬇️</button>
        <button onClick={() => handleDelete(doc.id, doc.storage_path)} title="Xóa"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50">🗑️</button>
      </div>
    </div>
  )

  const section = (icon: string, title: string, list: Document[], emptyText: string, action: React.ReactNode) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <h4 className="font-semibold text-gray-700 text-sm">{title}</h4>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">{list.length}</span>
        <div className="ml-auto">{action}</div>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-6 text-gray-300 text-sm border border-dashed border-gray-200 rounded-lg">{emptyText}</div>
      ) : (
        <div className="space-y-2">{list.map(docRow)}</div>
      )}
    </div>
  )

  const uploadBtnCls = "bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"

  // Nút upload riêng cho mục Hợp đồng — luôn lưu dưới loại "HĐLĐ".
  const contractUpload = (
    <button onClick={() => pickFile("HĐLĐ")} disabled={uploading} className={uploadBtnCls}>
      {uploading ? "Đang tải..." : "+ Tải lên hợp đồng"}
    </button>
  )

  // Nút upload cho mục Tài liệu khác — kèm chọn loại (CV/CMND/Ảnh/Khác).
  const otherUpload = (
    <div className="flex items-center gap-2">
      <select value={otherType} onChange={(e) => setOtherType(e.target.value)}
        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
        {["CV", "CMND", "Ảnh", "Khác"].map((t) => <option key={t}>{t}</option>)}
      </select>
      <button onClick={() => pickFile(otherType)} disabled={uploading} className={uploadBtnCls}>
        {uploading ? "Đang tải..." : "+ Tải lên"}
      </button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-800">Tài liệu</h3>
      </div>

      {/* Một input file ẩn dùng chung; pickFile() quyết định upload vào mục nào. */}
      <input ref={inputRef} type="file" className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); e.target.value = "" }} />

      <div className="space-y-6">
        {section("📑", "Hợp đồng", contracts, "Chưa có hợp đồng", contractUpload)}
        {section("📁", "Tài liệu khác", others, "Chưa có tài liệu khác", otherUpload)}
      </div>
    </div>
  )
}
