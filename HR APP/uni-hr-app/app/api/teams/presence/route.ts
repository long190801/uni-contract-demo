import { NextRequest, NextResponse } from "next/server"
import { getUsersPresence } from "@/lib/graph/presence"

export async function POST(req: NextRequest) {
  const { userIds } = await req.json()
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json([])
  }
  const presence = await getUsersPresence(userIds)
  return NextResponse.json(presence)
}
