"use client"

import { useState } from "react"
import Link from "next/link"
import Tabs from "@/components/ui/Tabs"
import Badge, { employeeStatusVariant } from "@/components/ui/Badge"
import { tenure } from "@/lib/format"
import TabPersonal from "./TabPersonal"
import TabContract from "./TabContract"
import TabDocuments from "./TabDocuments"
import TabInterviewHistory from "./TabInterviewHistory"
import TabPerformance from "./TabPerformance"
import DocGenModal from "@/components/nhan-su/DocGenModal"
import type { Employee } from "@/types/database"

const TABS = [
  { id: "personal",  label: "Thông tin cá nhân", icon: "👤" },
  { id: "contract",  label: "Hợp đồng",           icon: "📄" },
  { id: "documents", label: "Tài liệu",            icon: "📁" },
  { id: "interview", label: "Lịch sử phỏng vấn",   icon: "💬" },
  { id: "perf",      label: "Hiệu suất",           icon: "📈" },
]

interface Props {
  employee: Record<string, unknown>
  candidateRecord: Record<string, unknown> | null
}

export default function EmployeeProfileClient({ employee, candidateRecord }: Props) {
  const [activeTab, setActiveTab] = useState("personal")
  const [emp, setEmp] = useState(employee)
  const [showDocGen, setShowDocGen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/nhan-su" className="hover:text-blue-600">Nhân sự</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{String(emp.full_name || "")}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {String(emp.full_name || "?")[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h1 className="text-2xl font-bold">{String(emp.full_name || "")}</h1>
                <button
                  onClick={() => setShowDocGen(true)}
                  title="Tạo văn bản tự động (HĐ, phụ lục…)"
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-3 py-1.5 rounded-lg flex-shrink-0">
                  📝 <span className="hidden sm:inline">Tạo văn bản</span>
                </button>
              </div>
              <p className="text-blue-100">{String(emp.position ?? "")} · {String(emp.office ?? "")}</p>
              <div className="flex items-center gap-3 mt-2">
                {emp.status ? (
                  <Badge label={String(emp.status)} variant={employeeStatusVariant(String(emp.status))} />
                ) : null}
                {emp.staff_code ? <span className="text-blue-200 text-sm">#{String(emp.staff_code)}</span> : null}
                {emp.teams_user_id ? <span className="text-blue-200 text-xs">Teams ✓</span> : null}
                {emp.join_date ? (
                  <span className="text-blue-100 text-xs bg-white/10 rounded-full px-2.5 py-0.5" suppressHydrationWarning>
                    ⏱️ Gắn bó: {tenure(emp.join_date as string | null, emp.quit_date as string | null)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "personal" && <TabPersonal employee={emp} onUpdate={setEmp} />}
          {activeTab === "contract" && <TabContract employee={emp} onUpdate={setEmp} />}
          {activeTab === "documents" && <TabDocuments employee={emp} />}
          {activeTab === "interview" && <TabInterviewHistory candidate={candidateRecord} />}
          {activeTab === "perf" && <TabPerformance employee={emp} />}
        </div>
      </div>

      <DocGenModal
        open={showDocGen}
        onClose={() => setShowDocGen(false)}
        employees={[emp as unknown as Employee]}
        initialEmployeeId={String(emp.id)}
      />
    </div>
  )
}
