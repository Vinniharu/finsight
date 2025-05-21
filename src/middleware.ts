import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/upload/:path*",
    "/api/query/:path*",
    "/api/queries/:path*",
  ],
} 