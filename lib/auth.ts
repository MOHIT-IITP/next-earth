import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import GitHub from "next-auth/providers/github"
import NextAuth from "next-auth"
import { redirect } from "next/navigation"

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
  callbacks: {
    async session({session, user}){
      if(session.user){
        session.user.id = user.id;
      }
      return session;
    }
  },
  session: {
    strategy: "database",
  },
})


export const RegisteredUser =  async () => {
  const session = await auth();
  if(!session?.user){
    redirect('/')
  }
  return session;
}