export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    // Protect all routes except: static files, Next.js internals, public pages, API auth
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/tuyen-dung/interview-response|api/tuyen-dung/evaluations).*)",
  ],
}
