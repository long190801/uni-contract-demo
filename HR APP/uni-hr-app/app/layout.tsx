import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "UNI HR App",
  description: "Hệ thống quản lý nhân sự UNI Consulting",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
