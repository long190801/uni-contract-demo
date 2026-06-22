import clsx from "clsx"

type BadgeVariant = "blue" | "green" | "red" | "yellow" | "gray" | "purple" | "orange"

const variants: Record<BadgeVariant, string> = {
  blue:   "bg-blue-100 text-blue-800",
  green:  "bg-green-100 text-green-800",
  red:    "bg-red-100 text-red-800",
  yellow: "bg-yellow-100 text-yellow-800",
  gray:   "bg-gray-100 text-gray-700",
  purple: "bg-purple-100 text-purple-800",
  orange: "bg-orange-100 text-orange-800",
}

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ label, variant = "gray", className }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", variants[variant], className)}>
      {label}
    </span>
  )
}

// Status mappings
export function employeeStatusVariant(status: string): BadgeVariant {
  if (status === "Đang làm việc") return "green"
  if (status === "Thử việc") return "blue"
  if (status?.startsWith("Nghỉ việc")) return "red"
  return "gray"
}

export function candidateStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "Mới nộp": "gray",
    "Đang xem xét": "blue",
    "Mời PV Online": "blue",
    "Phỏng vấn Online": "purple",
    "Mời PV Trực tiếp": "blue",
    "Phỏng vấn Trực tiếp": "purple",
    "Offer": "yellow",
    "Đã nhận việc": "green",
    "Từ chối Online": "red",
    "Từ chối Trực tiếp": "red",
    "Rút đơn": "gray",
  }
  return map[status] || "gray"
}

export function equipmentStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    "Trong kho": "green",
    "Đang sử dụng": "blue",
    "Đang sửa chữa": "yellow",
    "Đã hủy": "red",
  }
  return map[status] || "gray"
}
