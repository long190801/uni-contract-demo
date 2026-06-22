"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    await signIn("microsoft-entra-id", { callbackUrl: "/nhan-su" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-900">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center">
        {/* Logo / Brand */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-3">
            U
          </div>
          <h1 className="text-2xl font-bold text-gray-800">UNI HR App</h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý nhân sự</p>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {/* Microsoft logo */}
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
            <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
            <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
            <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
          </svg>
          {loading ? "Đang chuyển hướng..." : "Đăng nhập bằng Microsoft"}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          Dùng tài khoản Microsoft 365 của công ty
        </p>
      </div>
    </div>
  )
}
