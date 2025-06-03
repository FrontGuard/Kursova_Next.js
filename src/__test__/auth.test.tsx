
// Create mock functions that we can reference
const mockCompare = jest.fn();
const mockGetServerSession = jest.fn();
const mockFindUnique = jest.fn();

// Mock bcryptjs
jest.mock("bcryptjs", () => ({
  compare: mockCompare,
}));

// Mock next-auth
jest.mock("next-auth/next", () => ({
  getServerSession: mockGetServerSession,
}));

// Mock the prisma module completely
jest.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}));

import { authOptions, auth } from "../lib/auth";
import { compare } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { prisma } from "../lib/prisma";
import { User } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import { Account, Profile, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

describe("auth.test.tsx", () => {
  describe("authOptions", () => {
    it("should have PrismaAdapter configured with prisma client", () => {
      expect(authOptions.adapter).toBeDefined();
    });

    it("should have jwt session strategy", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
    });    describe("CredentialsProvider", () => {      beforeEach(() => {
        mockFindUnique.mockReset();
        mockCompare.mockReset();
      });

      it("should return null if email or password is not provided", async () => {
        const credentialsProvider = authOptions.providers?.find(
          (provider) => provider.type === "credentials"
        ) as any;

        const result1 = await credentialsProvider?.authorize(null);
        expect(result1).toBeNull();

        const result2 = await credentialsProvider?.authorize({ email: "test@example.com" });
        expect(result2).toBeNull();

        const result3 = await credentialsProvider?.authorize({ password: "password123" });
        expect(result3).toBeNull();
      });      it("should return null if user is not found", async () => {        mockFindUnique.mockResolvedValue(null);
        mockCompare.mockResolvedValue(true);

        const credentialsProvider = authOptions.providers?.find(
          (provider) => provider.type === "credentials"
        ) as any;

        const result = await credentialsProvider?.authorize({
          email: "test@example.com",
          password: "password123",
        });        expect(mockFindUnique).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
        });
        expect(mockCompare).not.toHaveBeenCalled();
        expect(result).toBeNull();
      });

      it("should return null if password does not match", async () => {
        const mockUser: User = {
          id: "user-id",
          name: "Test User",
          email: "test@example.com",
          password: "hashedPassword",
          createdAt: new Date(),
          role: "USER",        };        mockFindUnique.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(false);

        const credentialsProvider = authOptions.providers?.find(
          (provider) => provider.type === "credentials"
        ) as any;

        const result = await credentialsProvider?.authorize({
          email: "test@example.com",
          password: "wrongPassword",        });        expect(mockFindUnique).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
        });
        expect(mockCompare).toHaveBeenCalledWith("wrongPassword", "hashedPassword");
        expect(result).toBeNull();
      });

      it("should return user object if credentials are valid", async () => {
        const mockUser: User = {
          id: "user-id",
          name: "Test User",
          email: "test@example.com",
          password: "hashedPassword",
          createdAt: new Date(),
          role: "ADMIN",        };        mockFindUnique.mockResolvedValue(mockUser);
        mockCompare.mockResolvedValue(true);

        const credentialsProvider = authOptions.providers?.find(
          (provider) => provider.type === "credentials"
        ) as any;

        const result = await credentialsProvider?.authorize({
          email: "test@example.com",
          password: "password123",        });        expect(mockFindUnique).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
        });
        expect(mockCompare).toHaveBeenCalledWith("password123", "hashedPassword");
        expect(result).toEqual({
          id: "user-id",
          name: "Test User",
          email: "test@example.com",
          role: "ADMIN",
        });
      });
    });
  });

  describe("callbacks", () => {
    describe("jwt", () => {
      it("should add user id and role to token if user exists", async () => {
        const token: JWT = { id: undefined, role: undefined };
        const user = { id: "user-id", role: "admin" } as AdapterUser;

        const result = await authOptions.callbacks?.jwt({
          token,
          user,
          account: {} as Account,
          profile: {} as Profile,
          isNewUser: false,
        });

        expect(result).toEqual({ id: "user-id", role: "admin" });
      });

      it("should return original token if no user", async () => {
        const token: JWT = { sub: "123", id: undefined, role: undefined };

        const result = await authOptions.callbacks?.jwt({
          token,
          user: undefined,
          account: {} as Account,
          profile: {} as Profile,
          isNewUser: false,
        });

        expect(result).toEqual({ sub: "123", id: undefined, role: undefined });
      });
    });

    describe("session", () => {
      it("should add id and role to session if session.user and token exist", async () => {
        const session: Session = {
          user: { id: "", role: "" },
          expires: new Date().toISOString(),
        };
        const token: JWT = { id: "token-id", role: "user" };

        const result = await authOptions.callbacks?.session({
          session,
          token,
          user: {} as AdapterUser,
          newSession: undefined,
          trigger: undefined,
        });

        expect(result).toEqual({
          user: { id: "token-id", role: "user" },
          expires: session.expires,
        });
      });

      it("should return original session if session.user is undefined", async () => {
        const session: Session = {
          user: undefined,
          expires: new Date().toISOString(),
        };
        const token: JWT = { id: "token-id", role: "user" };

        const result = await authOptions.callbacks?.session({
          session,
          token,
          user: {} as AdapterUser,
          newSession: undefined,
          trigger: undefined,
        });

        expect(result).toEqual({ expires: session.expires });
      });

      it("should return original session if token is undefined", async () => {
        const session: Session = {
          user: { name: "Test", id: "", role: "" },
          expires: new Date().toISOString(),
        };

        const result = await authOptions.callbacks?.session({
          session,
          token: undefined,
          user: {} as AdapterUser,
          newSession: undefined,
          trigger: undefined,
        });

        expect(result).toEqual({
          user: { name: "Test", id: "", role: "" },
          expires: session.expires,
        });
      });
    });
  });

  describe("auth function", () => {
    it("should call getServerSession with authOptions", async () => {
      const mockSession: Session = {
        user: { name: "Authenticated User", id: "", role: "" },
        expires: new Date().toISOString(),
      };      mockGetServerSession.mockResolvedValue(mockSession);

      const session = await auth();

      expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
      expect(session).toEqual(mockSession);
    });
  });
});
