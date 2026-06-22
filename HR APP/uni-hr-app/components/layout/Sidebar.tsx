"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const nav = [
  {
    label: "TUYỂN DỤNG",
    items: [
      { href: "/tuyen-dung", label: "Danh sách ứng viên", icon: "👥" },
    ],
  },
  {
    label: "HỒ SƠ NHÂN SỰ",
    items: [
      { href: "/nhan-su", label: "Danh sách nhân viên", icon: "🧑‍💼" },
    ],
  },
  {
    label: "TRANG THIẾT BỊ",
    items: [
      { href: "/thiet-bi", label: "Dashboard", icon: "📊" },
      { href: "/thiet-bi/kho", label: "Tồn kho", icon: "📦" },
      { href: "/thiet-bi/yeu-cau", label: "Yêu cầu", icon: "📋" },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-[#003F87] text-white flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-blue-800">
        <div className="w-8 h-8 rounded-lg bg-white text-blue-800 font-bold flex items-center justify-center text-sm">
          U
        </div>
        <span className="font-semibold text-sm">UNI HR App</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6">
        {nav.map((section) => (
          <div key={section.label}>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider px-2 mb-2">
              {section.label}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active =
                  item.href === "/nhan-su"
                    ? pathname === "/nhan-su" || pathname.startsWith("/nhan-su/")
                    : item.href === "/tuyen-dung"
                    ? pathname === "/tuyen-dung" || pathname.startsWith("/tuyen-dung/")
                    : pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        active
                          ? "bg-blue-600 text-white font-medium"
                          : "text-blue-100 hover:bg-blue-800"
                      )}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Version */}
      <div className="px-5 py-3 border-t border-blue-800">
        <p className="text-blue-400 text-xs">v1.0.0</p>
      </div>
    </aside>
  )
}
