import { createServiceGraphClient } from "./client"

export interface M365User {
  id: string
  displayName: string
  mail: string
  userPrincipalName: string
}

export async function listAllM365Users(): Promise<M365User[]> {
  const graph = await createServiceGraphClient()
  const users: M365User[] = []
  let response = await graph
    .api("/users")
    .filter("accountEnabled eq true")
    .select("id,displayName,mail,userPrincipalName")
    .top(999)
    .get()

  users.push(...(response.value || []))

  while (response["@odata.nextLink"]) {
    response = await graph.api(response["@odata.nextLink"]).get()
    users.push(...(response.value || []))
  }

  return users
}

export async function getUserByEmail(email: string): Promise<M365User | null> {
  try {
    const graph = await createServiceGraphClient()
    const response = await graph
      .api("/users")
      .filter(`mail eq '${email}' or userPrincipalName eq '${email}'`)
      .select("id,displayName,mail,userPrincipalName")
      .get()
    return response.value?.[0] ?? null
  } catch {
    return null
  }
}
