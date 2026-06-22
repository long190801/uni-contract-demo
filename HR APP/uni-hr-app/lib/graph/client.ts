import { Client } from "@microsoft/microsoft-graph-client"

// Create Graph client from user's delegated access token (from NextAuth session)
export function createGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}

// Create Graph client using client credentials (service account / app-only)
// Used for: listing users, getting presence, activity reports, creating meetings
export async function createServiceGraphClient(): Promise<Client> {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.GRAPH_SERVICE_CLIENT_ID!,
    client_secret: process.env.GRAPH_SERVICE_CLIENT_SECRET!,
    scope: "https://graph.microsoft.com/.default",
  })
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })
  const data = await response.json()
  return Client.init({
    authProvider: (done) => done(null, data.access_token),
  })
}
