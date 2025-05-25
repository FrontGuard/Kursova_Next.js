import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";
import { prisma } from "../../../../lib/prisma"


export const authOptions: NextAuthOptions = {
adapter: PrismaAdapter(prisma),
session: {
strategy: "jwt",
},
providers: [
CredentialsProvider({
name: "Credentials",
credentials: {
email: { label: "Email", type: "text" },
password: { label: "Password", type: "password" },
},
async authorize(credentials) {
if (!credentials?.email || !credentials?.password) return null;
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) return null;

    const isValidPassword = await compare(
      credentials.password,
      user.password
    );

    if (!isValidPassword) return null;

    // Return only necessary user fields
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
}),
],
pages: {
signIn: "/login", // Якщо хочеш кастомну сторінку логіну
},
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };