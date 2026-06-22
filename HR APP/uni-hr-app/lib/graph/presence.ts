import { createServiceGraphClient } from "./client"

export interface UserPresence {
  id: string
  availability: string
  activity: string
}

export async function getUsersPresence(userIds: string[]): Promise<UserPresence[]> {
  if (userIds.length === 0) return []
  const graph = await createServiceGraphClient()
  const response = await graph.api("/communications/getPresencesByUserId").post({
    ids: userIds.slice(0, 650), // API limit
  })
  return response.value || []
}
