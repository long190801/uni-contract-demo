"use client"

import { useState, useRef } from "react"
import Modal from "@/components/ui/Modal"
import type { Employee } from "@/types/database"

interface Props {
  open: boolean
  onClose: () => void
  onImported: (employees: Employee[]) => void
}

export default function ImportModal({ open, onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setResult("")
    const form = new FormData()
    form.append("file", file)
    const res = await fetch("/api/nhan-su/import", { method: "POST", body: form })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setResult(`Đã import ${data.imported} nhân viên thành công!`)
      // Refresh: fetch all employees
      const empRes = await fetch("/api/nhan-su/employees")
      const employees = await empRes.json()
      onImported(employees)
    } else {
      setResult(`Lỗi: ${data.error}`)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import nhân viên từ Excel" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload file Excel <strong>Thông tin nhân sự.xlsx</strong>. Hệ thống sẽ tự động map các cột và upsert dữ liệu.
        </p>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <p className="text-sm font-medium text-blue-600">{file.name}</p>
          ) : (
            <p className="text-sm text-gray-500">Chọn file Excel (.xlsx)</p>
          )}
        </div>
        {result && (
          <p className={`text-sm font-medium ${result.startsWith("Lỗi") ? "text-red-600" : "text-green-600"}`}>
            {result}
          </p>
        )}
        <button
          onClick={handleImport}
          disabled={!file || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {loading ? "Đang import..." : "Import"}
        </button>
      </div>
    </Modal>
  )
}
