/// <reference types="next-auth" />
import NextAuth from "next-auth";

declare module "next-auth" {
interface Session {
user: {
name?: string | null;
email?: string | null;
image?: string | null;
role?: string | null; // Додано
};
}

interface User {
role?: string | null; // Додано
}
}