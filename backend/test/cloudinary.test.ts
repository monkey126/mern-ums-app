import CloudinaryService from "../src/lib/cloudinary";

// Mock Cloudinary for testing
jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn(),
    },
    api: {
      resource: jest.fn(),
    },
  },
}));

describe("CloudinaryService", () => {
  const mockBase64Image =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

  const mockCloudinaryResponse = {
    public_id: "ums/profile-pictures/test_image",
    secure_url:
      "https://res.cloudinary.com/test/image/upload/v123456/ums/profile-pictures/test_image.jpg",
    width: 400,
    height: 400,
    format: "jpg",
    resource_type: "image",
    bytes: 12345,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateBase64Image", () => {
    it("should validate correct base64 image format", () => {
      const validBase64 =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//Z";
      expect(CloudinaryService.validateBase64Image(validBase64)).toBe(true);
    });

    it("should reject invalid base64 format", () => {
      const invalidBase64 = "invalid-base64-string";
      expect(CloudinaryService.validateBase64Image(invalidBase64)).toBe(false);
    });

    it("should accept different image formats", () => {
      const formats = ["jpeg", "jpg", "png", "gif", "webp"];
      formats.forEach((format) => {
        const base64 = `data:image/${format};base64,/9j/4AAQSkZJRgABAQAAAQABAAD//Z`;
        expect(CloudinaryService.validateBase64Image(base64)).toBe(true);
      });
    });
  });

  describe("extractPublicId", () => {
    it("should extract public ID from Cloudinary URL", () => {
      const url =
        "https://res.cloudinary.com/test/image/upload/v123456/ums/profile-pictures/user_123.jpg";
      const publicId = CloudinaryService.extractPublicId(url);
      expect(publicId).toBe("ums/profile-pictures/user_123");
    });

    it("should handle URLs without file extension", () => {
      const url =
        "https://res.cloudinary.com/test/image/upload/v123456/ums/profile-pictures/user_123";
      const publicId = CloudinaryService.extractPublicId(url);
      expect(publicId).toBe("ums/profile-pictures/user_123");
    });

    it("should throw error for invalid URL format", () => {
      const invalidUrl = "https://example.com/invalid-url";
      expect(() => CloudinaryService.extractPublicId(invalidUrl)).toThrow(
        "Invalid Cloudinary URL format"
      );
    });
  });

  describe("uploadImage", () => {
    it("should upload image successfully", async () => {
      const { v2: cloudinary } = require("cloudinary");
      cloudinary.uploader.upload.mockResolvedValue(mockCloudinaryResponse);

      const result = await CloudinaryService.uploadImage(mockBase64Image);

      expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
        mockBase64Image,
        expect.objectContaining({
          folder: "ums/profile-pictures",
          resource_type: "image",
          transformation: expect.any(Array),
        })
      );

      expect(result).toEqual({
        public_id: mockCloudinaryResponse.public_id,
        secure_url: mockCloudinaryResponse.secure_url,
        width: mockCloudinaryResponse.width,
        height: mockCloudinaryResponse.height,
        format: mockCloudinaryResponse.format,
        resource_type: mockCloudinaryResponse.resource_type,
        bytes: mockCloudinaryResponse.bytes,
      });
    });

    it("should handle upload errors", async () => {
      const { v2: cloudinary } = require("cloudinary");
      cloudinary.uploader.upload.mockRejectedValue(new Error("Upload failed"));

      await expect(
        CloudinaryService.uploadImage(mockBase64Image)
      ).rejects.toThrow("Failed to upload image to cloud storage");
    });
  });

  describe("deleteImage", () => {
    it("should delete image successfully", async () => {
      const { v2: cloudinary } = require("cloudinary");
      cloudinary.uploader.destroy.mockResolvedValue({ result: "ok" });

      await expect(
        CloudinaryService.deleteImage("test_public_id")
      ).resolves.not.toThrow();

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
        "test_public_id"
      );
    });

    it("should handle delete errors", async () => {
      const { v2: cloudinary } = require("cloudinary");
      cloudinary.uploader.destroy.mockRejectedValue(new Error("Delete failed"));

      await expect(
        CloudinaryService.deleteImage("test_public_id")
      ).rejects.toThrow("Failed to delete image from cloud storage");
    });
  });
});
