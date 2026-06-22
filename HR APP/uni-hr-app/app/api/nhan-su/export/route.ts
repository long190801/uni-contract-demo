import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import * as XLSX from "xlsx"

export async function GET() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("employees").select("*").order("full_name")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data || []).map((e) => ({
    "Mã NV": e.staff_code,
    "Họ và tên": e.full_name,
    "Giới tính": e.gender,
    "Ngày sinh": e.date_of_birth,
    "VP": e.office,
    "Chức vụ": e.position,
    "Phòng ban": e.department,
    "Loại HĐ": e.contract_type,
    "Trạng thái": e.status,
    "Ngày bắt đầu HĐ": e.contract_start_date,
    "Ngày kết thúc HĐ": e.contract_end_date,
    "Lương chính thức": e.official_salary,
    "Email": e.email,
    "Điện thoại": e.phone,
    "BHXH": e.bhxh_number,
    "MST": e.tax_id,
    "CMND/CCCD": e.id_card_number,
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, "Nhân viên")
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=nhan-vien.xlsx",
    },
  })
}
