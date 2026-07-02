// Auto-generated types for Supabase tables
// Run: npx supabase gen types typescript --project-id <id> > types/database.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any

export interface Employee {
  id: string
  full_name: string
  gender: "Nam" | "Nữ" | "Khác" | null
  date_of_birth: string | null
  nationality: string | null
  phone: string | null
  id_card_number: string | null
  id_card_issued_date: string | null
  id_card_issued_place: string | null
  address: string | null
  email: string | null
  office: "HCM" | "HN" | null
  position: string | null
  department: string | null
  level: string | null
  staff_code: string | null
  contract_type: "HĐLĐ" | "Thử việc" | "Cộng tác viên" | null
  contract_start_date: string | null
  contract_end_date: string | null
  probation_start_date: string | null
  probation_end_date: string | null
  quit_date: string | null
  contract_code: string | null
  probation_salary: number | null
  official_salary: number | null
  bhxh_number: string | null
  healthcare_place: string | null
  tax_id: string | null
  status: "Đang làm việc" | "Nghỉ việc HCM" | "Nghỉ việc HN" | "Thử việc" | null
  teams_user_id: string | null
  teams_email: string | null
  avatar_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Chấm công theo NGÀY (dữ liệu thô từ máy chấm công). Các chỉ số muộn/OT/tổng hợp
// được suy ra ở tầng hiển thị (xem lib/nhan-su/attendance.ts).
export interface AttendanceRecord {
  id: string
  employee_id: string
  record_date: string        // "YYYY-MM-DD"
  check_in: string | null    // giờ vào đầu tiên "HH:MM:SS"
  check_out: string | null   // giờ ra cuối cùng "HH:MM:SS"
  work_hours: number | null  // tổng giờ làm trong ngày (đã trừ nghỉ trưa)
  status: string | null
  notes: string | null
  created_at: string
}

export interface Candidate {
  id: string
  job_posting_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  years_experience: number | null
  companies_count: number | null
  university: string | null
  english_score: string | null
  cv_summary: string | null
  cv_score: number | null
  score_breakdown: Record<string, unknown> | null
  cv_file_name: string | null
  cv_storage_path: string | null
  teams_meeting_url: string | null
  status: CandidateStatus
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export type CandidateStatus =
  | "Mới nộp"
  | "Đang xem xét"
  | "Mời PV Online"
  | "Phỏng vấn Online"
  | "Mời PV Trực tiếp"
  | "Phỏng vấn Trực tiếp"
  | "Offer"
  | "Đã nhận việc"
  | "Từ chối Online"
  | "Từ chối Trực tiếp"
  | "Rút đơn"

export interface JobPosting {
  id: string
  title: string
  office: "HCM" | "HN" | "Cả hai" | null
  required_exp_years: number
  description: string | null
  requirements: string | null
  status: "Mở" | "Đóng" | "Tạm dừng"
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface InterviewSlot {
  id: string
  candidate_id: string
  interview_type: "Online" | "Trực tiếp"
  slot_1: string | null
  slot_2: string | null
  slot_3: string | null
  chosen_slot: string | null
  candidate_response: "Chấp nhận" | "Đề xuất khác" | "Từ chối" | null
  proposed_time: string | null
  response_token: string
  token_expires_at: string
  invitation_sent_at: string | null
  confirmation_sent_at: string | null
  created_at: string
}

export interface InterviewEvaluation {
  id: string
  session_id: string
  interviewer_id: string | null
  scores: Record<string, number> | null
  overall_score: number | null
  recommendation: "Đậu" | "Rớt" | "Xem xét thêm" | null
  comments: string | null
  eval_token: string
  token_expires_at: string
  submitted_at: string | null
  created_at: string
}

export interface EquipmentItem {
  id: string
  equipment_code: string
  name: string
  serial_number: string | null
  category: "Laptop" | "Màn hình" | "Điện thoại" | "Máy in" | "Phụ kiện" | "Khác"
  status: "Trong kho" | "Đang sử dụng" | "Đang sửa chữa" | "Đã hủy"
  current_user_id: string | null
  assigned_date: string | null
  specs: Record<string, string> | null
  condition: "Tốt" | "Khá" | "Trung bình" | "Hỏng" | null
  location: "HCM" | "HN" | null
  purchase_date: string | null
  warranty_expiry: string | null
  purchase_value: number | null
  current_value: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type EquipmentRequestType =
  | "Xin cấp mới"
  | "Thiết bị hư hỏng"
  | "Trả/thu hồi"
  | "Đổi người dùng"
  | "Mượn về nhà"
  | "Nâng cấp"

export interface EquipmentRequest {
  id: string
  request_type: EquipmentRequestType
  equipment_id: string | null
  requested_by_employee: string | null
  requested_by_user: string | null
  requested_at: string
  requested_specs: Record<string, unknown> | null
  status: "Chờ duyệt" | "Đã duyệt" | "Từ chối" | "Đang xử lý" | "Hoàn thành"
  approved_by: string | null
  approved_at: string | null
  rejection_reason: string | null
  loan_return_date: string | null
  loan_returned_at: string | null
  loan_extended_to: string | null
  new_user_id: string | null
  document_type: string | null
  document_path: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
