import request from "supertest";
import { app } from "../src/server";
import { prisma } from "../src/lib/prisma";

describe("Refresh Token", () => {
  let testUser: any;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: { email: "refreshtest@example.com" },
    });
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    }
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user and return tokens", async () => {
      const userData = {
        name: "Refresh Test User",
        email: "refreshtest@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        phone: "+1234567890",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user).toHaveProperty("id");

      testUser = response.body.data.user;
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should refresh access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.id).toBe(testUser.id);

      // Update tokens for subsequent tests
      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken: "invalid-token" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain(
        "Invalid or expired refresh token"
      );
    });

    it("should fail with missing refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh-token")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout user and invalidate refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Logged out successfully");

      // Try to use the refresh token after logout - should fail
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken })
        .expect(401);

      expect(refreshResponse.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and get new tokens", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "refreshtest@example.com",
          password: "Password123!",
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");

      accessToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });
  });

  describe("POST /api/auth/logout-all", () => {
    it("should logout from all devices", async () => {
      const response = await request(app)
        .post("/api/auth/logout-all")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Logged out from all devices successfully"
      );

      // Try to use the refresh token after logout-all - should fail
      const refreshResponse = await request(app)
        .post("/api/auth/refresh-token")
        .send({ refreshToken })
        .expect(401);

      expect(refreshResponse.body.success).toBe(false);
    });
  });
});
