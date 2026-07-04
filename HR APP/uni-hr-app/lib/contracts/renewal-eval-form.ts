// Nội dung SONG NGỮ Việt–Hàn cho form đánh giá tái ký hợp đồng.
// Dùng chung giữa trang form công khai và thông báo Teams để tránh lệch nội dung.
// File thuần dữ liệu + hàm pure — an toàn dùng ở cả client lẫn server.

export interface Bilingual {
  vi: string
  ko: string
}

// 5 tiêu chí chấm điểm (giữ nguyên như form cũ, bổ sung tiếng Hàn).
// viShort/koShort: nhãn rút gọn dùng riêng cho card Teams (giữ bảng gọn, dễ quét) —
// form công khai vẫn hiển thị vi/ko đầy đủ để người đánh giá hiểu rõ tiêu chí.
export const SCORE_CRITERIA: Array<{
  key: string
  vi: string
  ko: string
  viShort: string
  koShort: string
}> = [
  { key: "discipline", vi: "Tuân thủ kỷ luật, nội quy", ko: "규율 및 사내 규정 준수", viShort: "Kỷ luật", koShort: "규율" },
  { key: "performance", vi: "Hiệu quả công việc / KPI", ko: "업무 성과 / KPI", viShort: "KPI", koShort: "KPI" },
  { key: "attitude", vi: "Thái độ, tinh thần trách nhiệm", ko: "태도 및 책임감", viShort: "Thái độ", koShort: "태도" },
  { key: "teamwork", vi: "Phối hợp đồng đội", ko: "팀워크(협업)", viShort: "Teamwork", koShort: "협업" },
  { key: "growth", vi: "Tiến bộ & tiềm năng phát triển", ko: "발전 및 성장 잠재력", viShort: "Tiềm năng", koShort: "잠재력" },
]

// Đề xuất — VALUE giữ nguyên tiếng Việt để khớp ràng buộc `recommendation` trong DB
// (check in 'Tái ký','Không tái ký','Xem xét thêm').
export const RECOMMENDATIONS: Array<{ value: string; vi: string; ko: string }> = [
  { value: "Tái ký", vi: "Tái ký", ko: "재계약" },
  { value: "Xem xét thêm", vi: "Xem xét thêm", ko: "추가 검토" },
  { value: "Không tái ký", vi: "Không tái ký", ko: "재계약 안 함" },
]

// Nhãn song ngữ dùng chung trên form.
export const FORM_LABELS = {
  title: { vi: "Đánh giá tái ký hợp đồng", ko: "계약 재계약 평가" },
  evaluator: { vi: "Bạn là ai? (Người đánh giá)", ko: "평가자는 누구입니까? (평가자 정보)" },
  employee: { vi: "Nhân viên được đánh giá", ko: "평가 대상 직원" },
  chooseEvaluator: { vi: "— Chọn người đánh giá —", ko: "— 평가자 선택 —" },
  chooseEmployee: { vi: "— Chọn nhân viên —", ko: "— 직원 선택 —" },
  average: { vi: "Điểm trung bình", ko: "평균 점수" },
  recommendation: { vi: "Đề xuất", ko: "제안" },
  strengths: { vi: "Điểm mạnh", ko: "강점" },
  weaknesses: { vi: "Điểm cần cải thiện", ko: "개선할 점" },
  comments: { vi: "Nhận xét chung", ko: "종합 의견" },
  weak: { vi: "1 (Yếu)", ko: "1 (미흡)" },
  excellent: { vi: "10 (Xuất sắc)", ko: "10 (우수)" },
  submit: { vi: "Nộp đánh giá", ko: "평가 제출" },
  submitting: { vi: "Đang lưu…", ko: "저장 중…" },
  done: { vi: "Đã lưu đánh giá!", ko: "평가가 저장되었습니다!" },
} as const

// Loại HĐ (giá trị tiếng Việt trong DB) → tiếng Hàn cho câu thông báo.
export function contractTypeKo(type: string | null | undefined): string {
  const t = String(type ?? "").trim()
  if (t === "HĐLĐ") return "정규 계약"
  if (t === "Thử việc") return "수습 계약"
  if (t === "Cộng tác viên") return "협력자 계약"
  return t || "계약"
}

// Link form đánh giá chung (dùng chung cho mọi trường hợp — không token).
export function generalFormUrl(): string {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  return `${appUrl}/public/danh-gia-tai-ky`
}
