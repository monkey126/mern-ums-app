import request from "supertest";
import { app } from "../src/server";
import {
  cleanupDatabase,
  createTestUser,
  createUniqueTestUser,
} from "./helpers";

describe("Auth Routes", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "TestPass123!",
    confirmPassword: "TestPass123!",
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.role).toBe("CLIENT");
      expect(response.body.data.user.status).toBe("ACTIVE");
      expect(response.body.data.user.emailVerified).toBe(false);
    });

    it("should return error for invalid email", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...testUser,
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should return error for weak password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          ...testUser,
          password: "weak",
          confirmPassword: "weak",
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("POST /api/auth/login", () => {
    let loginUser: any;

    beforeEach(async () => {
      // Create a test user with unique email
      loginUser = createUniqueTestUser();
      await createTestUser(loginUser);
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: loginUser.email,
          password: loginUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.data).toHaveProperty("token");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user).toHaveProperty("id");
      expect(response.body.data.user.email).toBe(loginUser.email);
    });

    it("should return error for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: loginUser.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });
});
