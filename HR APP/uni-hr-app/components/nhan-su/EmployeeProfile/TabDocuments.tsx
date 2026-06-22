"use client"

import { useState, useRef } from "react"

interface Document {
  id: string
  doc_type: string
  file_name: string
  storage_path: string
  uploaded_at: string
}

interface Props {
  employee: Record<string, unknown>
}

export default function TabDocuments({ employee }: Props) {
  const docs = (employee.employee_documents as Document[]) || []
  const [documents, setDocuments] = useState(docs)
  const [uploading, setUploading] = useState(false)
  const [docType, setDocType] = useState("CV")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    form.append("employee_id", String(employee.id))
    form.append("doc_type", docType)

    const res = await fetch("/api/nhan-su/documents", { method: "POST", body: form })
    const data = await res.json()
    setUploading(false)
    if (res.ok) setDocuments((prev) => [...prev, data])
  }

  async function handleDelete(docId: string, storagePath: string) {
    if (!confirm("Xóa tài liệu này?")) return
    await fetch(`/api/nhan-su/documents/${docId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storage_path: storagePath }),
    })
    setDocuments((prev) => prev.filter((d) => d.id !== docId))
  }

  async function handleDownload(storagePath: string, fileName: string) {
    const res = await fetch(`/api/nhan-su/documents/signed-url?path=${encodeURIComponent(storagePath)}`)
    const { url } = await res.json()
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Tài liệu</h3>
        <div className="flex items-center gap-2">
          <select value={docType} onChange={(e) => setDocType(e.target.value)}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            {["CV", "HĐLĐ", "CMND", "Ảnh", "Khác"].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input ref={inputRef} type="file" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {uploading ? "Đang tải..." : "+ Upload"}
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-400">Chưa có tài liệu nào</div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.file_name}</p>
                  <p className="text-xs text-gray-500">{doc.doc_type} · {new Date(doc.uploaded_at).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDownload(doc.storage_path, doc.file_name)}
                  className="text-sm text-blue-600 hover:underline">Tải về</button>
                <button onClick={() => handleDelete(doc.id, doc.storage_path)}
                  className="text-sm text-red-500 hover:underline">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
