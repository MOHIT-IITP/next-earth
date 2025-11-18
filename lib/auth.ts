// import NextAuth from "next-auth"
// import GitHub from "next-auth/providers/github"
//
// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [GitHub],
// })

import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import NextAuth from "next-auth"

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!
    })
  ],
  session: {
    strategy: "database",
  },
})



