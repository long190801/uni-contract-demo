import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

// Column mapping from Excel headers → DB fields
const COLUMN_MAP: Record<string, string> = {
  "Full Name":          "full_name",
  "Office":             "office",
  "Position":           "position",
  "Level":              "level",
  "IDHD":               "contract_type",
  "Gender":             "gender",
  "Status":             "status",
  "Start Contract":     "contract_start_date",
  "End Contract":       "contract_end_date",
  "Email":              "email",
  "DOB":                "date_of_birth",
  "Phone No.":          "phone",
  "BHXH":               "bhxh_number",
  "Nơi Đăng Ký KCB":   "healthcare_place",
  "ID Card":            "id_card_number",
  "Address":            "address",
  "ID Card Date":       "id_card_issued_date",
  "Join date":          "contract_start_date",
  "Start probation date": "probation_start_date",
  "Probation salary":   "probation_salary",
  "Official Salary":    "official_salary",
  "Staff Code":         "staff_code",
  "Contract code":      "contract_code",
  "Quit date":          "quit_date",
  "Mã số thuế":         "tax_id",
  "Nationality":        "nationality",
}

function normalizeContractType(val: string): string {
  if (!val) return "HĐLĐ"
  const v = val.toLowerCase()
  if (v.includes("thử việc") || v.includes("probation")) return "Thử việc"
  if (v.includes("cộng tác") || v.includes("collaborator")) return "Cộng tác viên"
  return "HĐLĐ"
}

function normalizeStatus(val: string): string {
  if (!val) return "Đang làm việc"
  const v = val.toLowerCase()
  if (v.includes("quit hcm")) return "Nghỉ việc HCM"
  if (v.includes("quit hn") || v.includes("quit ha noi")) return "Nghỉ việc HN"
  if (v.includes("quit")) return "Nghỉ việc HCM"
  if (v.includes("probation")) return "Thử việc"
  return "Đang làm việc"
}

function excelDateToISO(val: unknown): string | null {
  if (!val) return null
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val)
    if (date) return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`
  }
  if (typeof val === "string" && val.trim()) {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.toISOString().split("T")[0]
  }
  return null
}

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const employees = rows.map((row) => {
    const emp: Record<string, unknown> = {}
    for (const [excelCol, dbCol] of Object.entries(COLUMN_MAP)) {
      const val = row[excelCol]
      if (dbCol.includes("date") || dbCol.includes("_date")) {
        emp[dbCol] = excelDateToISO(val)
      } else if (dbCol === "contract_type") {
        emp[dbCol] = normalizeContractType(String(val || ""))
      } else if (dbCol === "status") {
        emp[dbCol] = normalizeStatus(String(val || ""))
      } else if (dbCol === "probation_salary" || dbCol === "official_salary") {
        emp[dbCol] = val ? parseInt(String(val).replace(/[^0-9]/g, ""), 10) || null : null
      } else {
        emp[dbCol] = val || null
      }
    }
    // Ensure required field
    if (!emp.full_name) return null
    return emp
  }).filter(Boolean)

  if (employees.length === 0) {
    return NextResponse.json({ error: "No valid rows found" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("employees")
    .upsert(employees as never[], { onConflict: "staff_code", ignoreDuplicates: false })
    .select("id")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ imported: data?.length || employees.length })
}
