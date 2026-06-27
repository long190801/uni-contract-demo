// Cấu hình tạo văn bản tự động (HĐ lao động / thử việc / CTV / phụ lục).
// File THUẦN dữ liệu + hàm pure — dùng được ở cả client (render form) lẫn server
// (tính giá trị mặc định). KHÔNG import gì từ server ở đây.

// ---- Hằng số công ty (Bên A) ----
export const COMPANY_HCM_ADDRESS =
  "Phòng 5.09, Lầu 5, Tòa nhà ST Moritz, Số 1014 Phạm Văn Đồng, Phường Hiệp Bình, Thành phố Hồ Chí Minh, Việt Nam"
export const ID_PLACE_FALLBACK = "Cục CSQLHCVTTXH"

// ---- Loại văn bản ----
export type DocType = "hdld" | "hdtv" | "hdctv" | "phuluc"
export type TermType = "XDTH" | "KXDTH" // chỉ áp dụng cho HĐLĐ

export interface DocTypeMeta {
  id: DocType
  icon: string
  title: string
  desc: string
  template: string // tên file trong lib/contracts/templates
  hasTerm?: boolean // HĐLĐ cần chọn xác định/không xác định thời hạn
}

export const CONTRACT_TYPES: DocTypeMeta[] = [
  { id: "hdld", icon: "📄", title: "Hợp đồng lao động", desc: "HĐLĐ xác định / không xác định thời hạn", template: "hdld.docx", hasTerm: true },
  { id: "hdtv", icon: "🧪", title: "Hợp đồng thử việc", desc: "Điền sẵn lương thử việc & sau thử việc", template: "hdtv.docx" },
  { id: "hdctv", icon: "🤝", title: "Hợp đồng cộng tác viên", desc: "HĐ dịch vụ cộng tác viên", template: "hdctv.docx" },
  { id: "phuluc", icon: "➕", title: "Phụ lục HĐ (điều chỉnh lương)", desc: "Điều chỉnh lương + phụ cấp", template: "phuluc.docx" },
]

export const metaOf = (t: DocType) => CONTRACT_TYPES.find((c) => c.id === t)!

// Mã loại HĐ dùng cho SỐ HỢP ĐỒNG và đếm STT.
export function typeCode(docType: DocType, term?: TermType): string {
  if (docType === "hdld") return term === "KXDTH" ? "HDLDKXDTH" : "HDLDXDTH"
  if (docType === "hdtv") return "HDTV"
  if (docType === "hdctv") return "HDCTV"
  return "PL"
}

// ---- Helpers định dạng ----
export function vnDate(value?: string | null): string {
  if (!value) return ""
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ""
}

/** Số nguyên -> "15.000.000". Nhận number/string; trả "" nếu rỗng. */
export function fmtMoney(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return ""
  const digits = String(value).replace(/[^\d]/g, "")
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

/** Lấy số nguyên từ chuỗi tiền đã định dạng ("15.000.000" -> 15000000). */
export function parseMoney(value?: string | null): number {
  return Number(String(value ?? "").replace(/[^\d]/g, "")) || 0
}

// Số tháng giữa 2 ngày YYYY-MM-DD (làm tròn, tối thiểu 1) — cho HĐ CTV.
export function monthsBetween(startIso?: string | null, endIso?: string | null): string {
  if (!startIso || !endIso) return ""
  const a = String(startIso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  const b = String(endIso).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!a || !b) return ""
  let m = (Number(b[1]) - Number(a[1])) * 12 + (Number(b[2]) - Number(a[2]))
  if (Number(b[3]) >= Number(a[3])) m += 0
  return String(Math.max(1, m))
}

// ---- Định nghĩa field hiển thị trên bảng (chung cho client + server) ----
export type FieldGroup = "auto" | "manual"
export interface FieldDef {
  token: string // tên token trong template ({{token}})
  label: string
  group: FieldGroup // auto = điền từ hồ sơ; manual = cần nhập/kiểm tra
  wide?: boolean // chiếm cả hàng (địa chỉ, nơi làm việc)
}

// Thứ tự field theo từng loại. Token khớp với mẫu đã chuẩn hóa.
const PERSONAL: FieldDef[] = [
  { token: "full_name", label: "Họ và tên", group: "auto" },
  { token: "dob", label: "Ngày sinh", group: "auto" },
  { token: "gender", label: "Giới tính", group: "auto" },
  { token: "id_no", label: "Số CMND/CCCD", group: "auto" },
  { token: "id_date", label: "Ngày cấp", group: "auto" },
  { token: "id_place", label: "Nơi cấp", group: "auto" },
  { token: "address", label: "Địa chỉ thường trú", group: "auto", wide: true },
]
const SIGN_DMY: FieldDef[] = [
  { token: "sign_day", label: "Ngày ký (ngày)", group: "manual" },
  { token: "sign_month", label: "Ngày ký (tháng)", group: "manual" },
  { token: "sign_year", label: "Ngày ký (năm)", group: "manual" },
]

export function fieldsOf(docType: DocType): FieldDef[] {
  if (docType === "hdld")
    return [
      { token: "contract_no", label: "Số hợp đồng", group: "manual" },
      { token: "contract_term_type", label: "Loại HĐ (chữ trong văn bản)", group: "manual" },
      ...PERSONAL,
      { token: "position", label: "Vị trí công việc", group: "auto" },
      { token: "work_place", label: "Nơi làm việc", group: "manual", wide: true },
      { token: "start_date", label: "Từ ngày", group: "auto" },
      { token: "end_date", label: "Đến ngày", group: "auto" },
      { token: "salary", label: "Lương hàng tháng (VNĐ)", group: "auto" },
      { token: "insurance_salary", label: "Lương đóng bảo hiểm (VNĐ)", group: "auto" },
      ...SIGN_DMY,
    ]
  if (docType === "hdtv")
    return [
      { token: "contract_no", label: "Số hợp đồng", group: "manual" },
      ...PERSONAL,
      { token: "position", label: "Chức danh chuyên môn", group: "auto" },
      { token: "work_place", label: "Nơi làm việc", group: "manual", wide: true },
      { token: "start_date", label: "Thử việc từ ngày", group: "auto" },
      { token: "end_date", label: "Đến ngày", group: "auto" },
      { token: "probation_salary", label: "Lương thử việc (VNĐ)", group: "auto" },
      { token: "official_salary", label: "Lương sau thử việc (VNĐ)", group: "auto" },
      ...SIGN_DMY,
    ]
  if (docType === "hdctv")
    return [
      { token: "contract_no", label: "Số hợp đồng", group: "manual" },
      ...PERSONAL,
      { token: "position", label: "Vị trí cộng tác viên", group: "auto" },
      { token: "duration_months", label: "Thời hạn (số tháng)", group: "manual" },
      { token: "start_date", label: "Từ ngày", group: "auto" },
      { token: "end_date", label: "Đến ngày", group: "auto" },
      { token: "salary", label: "Chi phí dịch vụ (VNĐ/tháng)", group: "auto" },
      ...SIGN_DMY,
    ]
  // phuluc
  return [
    { token: "appendix_no", label: "Số phụ lục", group: "manual" },
    { token: "base_contract_no", label: "Số HĐLĐ đang hiệu lực", group: "manual" },
    { token: "base_contract_date", label: "Ngày ký HĐLĐ đó", group: "manual" },
    ...PERSONAL,
    { token: "salary", label: "Mức lương cố định mới (VNĐ)", group: "manual" },
    { token: "allowance", label: "Phụ cấp chức vụ (VNĐ)", group: "manual" },
    { token: "total_salary", label: "Tổng lương (VNĐ)", group: "manual" },
    { token: "effective_date", label: "Ngày hiệu lực điều chỉnh", group: "manual" },
    { token: "sign_date", label: "Ngày ký phụ lục", group: "manual" },
  ]
}

// ---- Tính giá trị mặc định cho mọi token từ hồ sơ nhân viên ----
// emp: bản ghi employees. seq: STT (đã +1). today: YYYY-MM-DD.
export function buildDefaults(
  docType: DocType,
  term: TermType | undefined,
  emp: Record<string, unknown>,
  seq: number,
  todayIso: string
): Record<string, string> {
  const s = (k: string) => String(emp[k] ?? "").trim()
  const code = s("staff_code") || "NV"
  const stt = String(seq).padStart(2, "0")
  const contractNo = `${typeCode(docType, term)}/${code}-${stt}`
  const t = vnDate(todayIso).split("/") // [dd,mm,yyyy]

  const personal: Record<string, string> = {
    full_name: s("full_name"),
    dob: vnDate(s("date_of_birth")),
    gender: s("gender"),
    id_no: s("id_card_number"),
    id_date: vnDate(s("id_card_issued_date")),
    id_place: s("id_card_issued_place") || ID_PLACE_FALLBACK,
    address: s("address"),
  }
  const signDmy = { sign_day: t[0] || "", sign_month: t[1] || "", sign_year: t[2] || "" }

  if (docType === "hdld")
    return {
      ...personal, ...signDmy,
      contract_no: contractNo,
      contract_term_type: term === "KXDTH" ? "Không xác định thời hạn" : "Xác định thời hạn",
      position: s("position"),
      work_place: COMPANY_HCM_ADDRESS,
      start_date: vnDate(s("contract_start_date")),
      end_date: term === "KXDTH" ? "" : vnDate(s("contract_end_date")),
      salary: fmtMoney(s("official_salary")),
      insurance_salary: fmtMoney(s("insurance_salary") || s("official_salary")),
    }
  if (docType === "hdtv")
    return {
      ...personal, ...signDmy,
      contract_no: contractNo,
      position: s("position"),
      work_place: COMPANY_HCM_ADDRESS,
      start_date: vnDate(s("probation_start_date")),
      end_date: vnDate(s("probation_end_date")),
      probation_salary: fmtMoney(s("probation_salary")),
      official_salary: fmtMoney(s("official_salary")),
    }
  if (docType === "hdctv")
    return {
      ...personal, ...signDmy,
      contract_no: contractNo,
      position: s("position"),
      duration_months: monthsBetween(s("contract_start_date"), s("contract_end_date")),
      start_date: vnDate(s("contract_start_date")),
      end_date: vnDate(s("contract_end_date")),
      salary: fmtMoney(s("official_salary")),
    }
  // phuluc
  const newSalary = fmtMoney(s("official_salary"))
  return {
    ...personal,
    appendix_no: contractNo, // PL/<code>-NN
    base_contract_no: s("contract_code"),
    base_contract_date: vnDate(s("contract_start_date")),
    salary: newSalary,
    allowance: "",
    total_salary: newSalary,
    effective_date: vnDate(todayIso),
    sign_date: vnDate(todayIso),
  }
}
