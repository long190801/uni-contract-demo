import NextAuth from "next-auth"
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id"

// HR module (Hồ sơ nhân sự) is restricted to these accounts ONLY.
// Tuyển dụng & Thiết bị are open to any authenticated company account.
const HR_EMAILS = new Set([
  "danglong@eximuni.com",
  "huy@eximuni.com",
  "byun@eximuni.com",
  "nga@eximuni.com",
])

export function isHrAllowed(...candidates: Array<string | null | undefined>): boolean {
  return candidates.some((c) => !!c && HR_EMAILS.has(c.toLowerCase().trim()))
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          scope:
            "openid profile email User.Read ChannelMessage.Send ChatMessage.Send Files.ReadWrite.All Sites.ReadWrite.All offline_access",
        },
      },
    }),
  ],
  callbacks: {
    // Any company Microsoft account may sign in (the single-tenant Azure app
    // already restricts to the org). Per-module access is enforced downstream.
    async signIn() {
      return true
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        // expires_at is in seconds; keep it in ms for easy comparison below.
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : undefined
      }
      if (profile) {
        const p = profile as { email?: string; preferred_username?: string; upn?: string }
        token.email = (p.email || p.preferred_username || p.upn || token.email) ?? undefined
      }

      // Token still valid (60s safety margin) — use as is.
      const expiresAt = token.expiresAt as number | undefined
      const refreshToken = token.refreshToken as string | undefined
      if (expiresAt && Date.now() < expiresAt - 60_000) return token
      // No refresh token (e.g. legacy session before offline_access) — can't refresh.
      if (!refreshToken) return token

      // Access token expired: refresh it so server-side Graph calls keep working.
      try {
        const res = await fetch(
          `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              client_id: process.env.AZURE_AD_CLIENT_ID!,
              client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
              refresh_token: refreshToken,
            }),
          }
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error_description || "refresh failed")
        token.accessToken = data.access_token
        token.expiresAt = Date.now() + Number(data.expires_in) * 1000
        // Azure rotates refresh tokens — keep the new one when provided.
        if (data.refresh_token) token.refreshToken = data.refresh_token
        token.error = undefined
      } catch {
        token.error = "RefreshAccessTokenError"
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.teamsUserId = token.sub as string
      session.error = token.error as string | undefined
      if (session.user) session.user.email = (token.email as string) ?? session.user.email
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
