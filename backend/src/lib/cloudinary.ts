import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"] || "",
  api_key: process.env["CLOUDINARY_API_KEY"] || "",
  api_secret: process.env["CLOUDINARY_API_SECRET"] || "",
});

// Validate Cloudinary configuration
if (
  !process.env["CLOUDINARY_CLOUD_NAME"] ||
  !process.env["CLOUDINARY_API_KEY"] ||
  !process.env["CLOUDINARY_API_SECRET"]
) {
  logger.warn(
    "Cloudinary configuration is incomplete. Image upload functionality will be disabled."
  );
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Upload image to Cloudinary
   * @param base64Image - Base64 encoded image string
   * @param folder - Cloudinary folder to upload to
   * @param publicId - Optional public ID for the image
   * @returns Promise<CloudinaryUploadResult>
   */
  static async uploadImage(
    base64Image: string,
    folder: string = "ums/profile-pictures",
    publicId?: string
  ): Promise<CloudinaryUploadResult> {
    // Check if Cloudinary is properly configured
    if (
      !process.env["CLOUDINARY_CLOUD_NAME"] ||
      !process.env["CLOUDINARY_API_KEY"] ||
      !process.env["CLOUDINARY_API_SECRET"]
    ) {
      throw new Error(
        "Cloudinary is not properly configured. Please check your environment variables."
      );
    }

    try {
      const uploadOptions: any = {
        folder,
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
        uploadOptions.overwrite = true;
      }

      const result = await cloudinary.uploader.upload(
        base64Image,
        uploadOptions
      );

      logger.info(
        {
          publicId: result.public_id,
          secureUrl: result.secure_url,
          bytes: result.bytes,
        },
        "Image uploaded to Cloudinary successfully"
      );

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      };
    } catch (error) {
      logger.error({ error }, "Failed to upload image to Cloudinary");
      throw new Error("Failed to upload image to cloud storage");
    }
  }

  /**
   * Delete image from Cloudinary
   * @param publicId - Public ID of the image to delete
   * @returns Promise<void>
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        logger.info({ publicId }, "Image deleted from Cloudinary successfully");
      } else {
        logger.warn(
          { publicId, result },
          "Image deletion from Cloudinary failed"
        );
      }
    } catch (error) {
      logger.error(
        { error, publicId },
        "Failed to delete image from Cloudinary"
      );
      throw new Error("Failed to delete image from cloud storage");
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param cloudinaryUrl - Full Cloudinary URL
   * @returns string - Public ID
   */
  static extractPublicId(cloudinaryUrl: string): string {
    try {
      // Extract public ID from URL like: https://res.cloudinary.com/cloud/image/upload/v123456/folder/publicId.jpg
      const urlParts = cloudinaryUrl.split("/");
      const uploadIndex = urlParts.findIndex((part) => part === "upload");

      if (uploadIndex === -1) {
        throw new Error("Invalid Cloudinary URL format");
      }

      // Get everything after version number (v123456)
      const pathAfterVersion = urlParts.slice(uploadIndex + 2).join("/");

      // Remove file extension
      const publicId = pathAfterVersion.replace(/\.[^/.]+$/, "");

      return publicId;
    } catch (error) {
      logger.error(
        { error, cloudinaryUrl },
        "Failed to extract public ID from Cloudinary URL"
      );
      throw new Error("Invalid Cloudinary URL format");
    }
  }

  /**
   * Validate base64 image format
   * @param base64String - Base64 encoded image
   * @returns boolean
   */
  static validateBase64Image(base64String: string): boolean {
    // Check if it's a valid base64 image format
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    return base64Regex.test(base64String);
  }

  /**
   * Get image info from Cloudinary
   * @param publicId - Public ID of the image
   * @returns Promise<any>
   */
  static async getImageInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      logger.error(
        { error, publicId },
        "Failed to get image info from Cloudinary"
      );
      throw new Error("Failed to get image information");
    }
  }
}

export { cloudinary };
export default CloudinaryService;
