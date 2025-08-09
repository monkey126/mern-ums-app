import request from "supertest";
import { app } from "../src/server";
import {
  cleanupDatabase,
  createTestUser,
  generateTestToken,
  testUser,
  createUniqueTestUser,
  expectSuccessResponse,
  expectErrorResponse,
} from "./helpers";

describe("User Management", () => {
  let authToken: string;

  beforeEach(async () => {
    await cleanupDatabase();
    // Create a regular user
    const user = await createTestUser(createUniqueTestUser());
    authToken = generateTestToken(user);
  });

  describe("Profile Management", () => {
    it("should get user profile successfully", async () => {
      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.user.email).toContain("test");
      expect(response.body.data.user.email).toContain("example.com");
    });

    it("should update profile successfully", async () => {
      const updateData = {
        name: "Updated Name",
        phone: "1234567890",
      };

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.phone).toBe(updateData.phone);
    });

    it("should validate profile update data", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "a" }) // Too short name
        .expect(400);

      expectErrorResponse(response, 400);
    });
  });

  describe("Password Management", () => {
    it("should change password successfully", async () => {
      const passwordData = {
        currentPassword: testUser.password,
        newPassword: "NewPass123!",
        confirmPassword: "NewPass123!",
      };

      const response = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expectSuccessResponse(response);
    });

    it("should validate password change data", async () => {
      const response = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "weak",
          confirmPassword: "weak",
        })
        .expect(400);

      expectErrorResponse(response, 400);
    });

    it("should reject incorrect current password", async () => {
      const response = await request(app)
        .put("/api/users/change-password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "WrongPass123!",
          newPassword: "NewPass123!",
          confirmPassword: "NewPass123!",
        })
        .expect(401);

      expectErrorResponse(response, 401);
    });
  });

  describe("Profile Picture Upload", () => {
    const validBase64Image =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

    // Mock Cloudinary for tests
    beforeEach(() => {
      jest.mock("../src/lib/cloudinary", () => ({
        default: {
          uploadImage: jest.fn().mockResolvedValue({
            public_id: "ums/profile-pictures/user_test_profile",
            secure_url:
              "https://res.cloudinary.com/test/image/upload/v123456/ums/profile-pictures/user_test_profile.jpg",
            width: 400,
            height: 400,
            format: "jpg",
            resource_type: "image",
            bytes: 12345,
          }),
          deleteImage: jest.fn().mockResolvedValue(undefined),
          extractPublicId: jest
            .fn()
            .mockReturnValue("ums/profile-pictures/user_test_profile"),
        },
      }));
    });

    it("should upload profile picture successfully", async () => {
      const response = await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ profilePicture: validBase64Image })
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.message).toBe(
        "Profile picture updated successfully"
      );
      expect(response.body.data.user).toHaveProperty("profilePicture");
    });

    it("should validate profile picture format", async () => {
      const response = await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ profilePicture: "invalid-base64" })
        .expect(400);

      expectErrorResponse(response, 400);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should require profile picture", async () => {
      const response = await request(app)
        .post("/api/users/profile-picture")
        .set("Authorization", `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expectErrorResponse(response, 400);
    });
  });

  describe("Activity Logs", () => {
    it("should get user activity logs", async () => {
      const response = await request(app)
        .get("/api/activity")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data).toHaveProperty("activities");
      expect(response.body.data).toHaveProperty("pagination");
    });

    it("should paginate activity logs", async () => {
      const response = await request(app)
        .get("/api/activity")
        .query({ page: 1, limit: 5 })
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });
});
