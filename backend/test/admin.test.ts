import request from "supertest";
import { app } from "../src/server";
import {
  cleanupDatabase,
  createTestUser,
  generateTestToken,
  testAdmin,
  createUniqueTestUser,
  createUniqueTestAdmin,
  expectSuccessResponse,
  expectErrorResponse,
} from "./helpers";

describe("Admin Management", () => {
  let adminToken: string;
  let userId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const admin = await createTestUser({
      ...createUniqueTestAdmin(),
      confirmPassword: testAdmin.password,
    });
    const user = await createTestUser(createUniqueTestUser());
    userId = user.id;
    adminToken = generateTestToken(admin);
  });

  describe("User Management", () => {
    it("should get all users", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.users).toBeArray();
      expect(response.body.data.pagination).toBeDefined();
    });

    it("should get user by id", async () => {
      const response = await request(app)
        .get(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.user.id).toBe(userId);
    });

    it("should update user", async () => {
      const updateData = {
        name: "Updated By Admin",
        status: "INACTIVE",
      };

      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.status).toBe(updateData.status);
    });

    it("should validate user update data", async () => {
      const response = await request(app)
        .put(`/api/admin/users/${userId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "INVALID_STATUS" })
        .expect(400);

      expectErrorResponse(response, 400);
    });
  });

  describe("Activity Management", () => {
    it("should get all activity logs", async () => {
      const response = await request(app)
        .get("/api/admin/activity-logs")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.activities).toBeArray();
      expect(response.body.data.pagination).toBeDefined();
    });

    it("should filter activity logs by user", async () => {
      const response = await request(app)
        .get("/api/admin/activity-logs")
        .query({ userId })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response);
      const activities = response.body.data.activities;
      activities.forEach((activity: any) => {
        expect(activity.userId).toBe(userId);
      });
    });
  });

  describe("Statistics", () => {
    it("should get system stats", async () => {
      const response = await request(app)
        .get("/api/admin/stats")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.stats).toHaveProperty("totalUsers");
      expect(response.body.data.stats.byStatus).toHaveProperty("active");
      expect(response.body.data.stats.byStatus).toHaveProperty("inactive");
      expect(response.body.data).toHaveProperty("recentActivities");
    });
  });

  describe("Authorization", () => {
    let userToken: string;

    beforeEach(async () => {
      const regularUser = await createTestUser(createUniqueTestUser());
      userToken = generateTestToken(regularUser);
    });

    it("should prevent non-admin users from accessing admin routes", async () => {
      const response = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expectErrorResponse(response, 403);
    });

    it("should prevent unauthorized access to admin routes", async () => {
      const response = await request(app).get("/api/admin/users").expect(401);

      expectErrorResponse(response, 401);
    });
  });
});
