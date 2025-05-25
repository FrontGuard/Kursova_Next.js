import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      /** Роль користувача: USER або ADMIN */
      role: "USER" | "ADMIN";
      /** Email вже точно є */
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    email: string;
  }
}
