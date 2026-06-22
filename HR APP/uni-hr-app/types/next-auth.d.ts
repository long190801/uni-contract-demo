import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken: string
    teamsUserId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}
