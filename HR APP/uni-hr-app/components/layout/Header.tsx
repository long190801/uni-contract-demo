"use client"

import { signOut } from "next-auth/react"
import type { Session } from "next-auth"

interface HeaderProps {
  user: Session["user"]
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user?.name || user?.email}</span>
        {user?.image && (
          <img src={user.image} alt="avatar" className="w-8 h-8 rounded-full" />
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    </header>
  )
}
