import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { User, UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "TestPass123!",
  confirmPassword: "TestPass123!",
};

export const testAdmin = {
  name: "Test Admin",
  email: "admin@example.com",
  password: "AdminPass123!",
  role: "ADMIN" as UserRole,
};

// Helper to create unique test data
export const createUniqueTestUser = (base = testUser) => ({
  ...base,
  email: base.email.replace(
    "@",
    `+${Date.now()}+${Math.random().toString(36).substr(2, 5)}@`
  ),
});

export const createUniqueTestAdmin = (base = testAdmin) => ({
  ...base,
  email: base.email.replace(
    "@",
    `+${Date.now()}+${Math.random().toString(36).substr(2, 5)}@`
  ),
});

export async function cleanupDatabase() {
  try {
    // Delete in correct order due to foreign key constraints
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.error("Database cleanup error:", error);
  }
}

export async function createTestUser(userData = testUser): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: (userData as any).role || "CLIENT",
      status: "ACTIVE",
    },
  });
}

export function generateTestToken(user: User): string {
  const secret = process.env["JWT_SECRET"] || "test-secret";
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret, {
    expiresIn: "1h",
  });
}

export const expectSuccessResponse = (response: any) => {
  expect(response.body.success).toBe(true);
  if (response.body.data) {
    expect(response.body).toHaveProperty("data");
  }
  if (response.body.message) {
    expect(response.body.message).toBeString();
  }
};

export const expectErrorResponse = (response: any, statusCode: number) => {
  expect(response.status).toBe(statusCode);
  expect(response.body).toHaveProperty("success", false);
  expect(response.body).toHaveProperty("message");
};
