import bcrypt from "bcryptjs";
import { UserModel, ActivityLogModel } from "../models";
import logger from "../utils/logger";
import { RequestInfo } from "../utils/requestHelper";
import CloudinaryService from "../lib/cloudinary";
import {
  NotFoundError,
  AuthenticationError,
  ValidationError,
  ErrorMessages,
} from "../utils/errors";
import {
  profileUpdateSchema,
  changePasswordSchema,
  profilePictureUploadSchema,
  type ProfileUpdateInput,
  type ChangePasswordInput,
  type ProfilePictureUploadInput,
} from "../schemas/validation";

export class UserService {
  // Get user profile
  static async getProfile(userId: string) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }
    // Return the user object directly (not nested)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Update user profile
  static async updateProfile(
    userId: string,
    updateData: ProfileUpdateInput,
    requestInfo: RequestInfo
  ) {
    // Validate update data
    const validatedData = profileUpdateSchema.parse(updateData);
    const user = await UserModel.update(userId, {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.phone && { phone: validatedData.phone }),
    });

    // Create activity log
    await ActivityLogModel.create({
      user: { connect: { id: user.id } },
      activity: "Profile updated",
      details: JSON.stringify({ updatedFields: Object.keys(updateData) }),
      ipAddress: requestInfo.ip || null,
      userAgent: requestInfo.userAgent || "Unknown",
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
        action: "Profile updated",
        updatedFields: Object.keys(updateData),
      },
      "User profile updated"
    );

    // Return the user object directly (not nested)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      profilePicture: user.profilePicture,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Change password
  static async changePassword(
    userId: string,
    passwords: ChangePasswordInput,
    requestInfo: RequestInfo
  ) {
    // Validate password data
    const validatedData = changePasswordSchema.parse(passwords);
    // Get user with password
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new AuthenticationError(ErrorMessages.PASSWORD_MISMATCH);
    }

    // Update password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);
    await UserModel.update(user.id, {
      password: hashedPassword,
    });

    // Create activity log
    await ActivityLogModel.create({
      user: { connect: { id: user.id } },
      activity: "Password changed",
      details: JSON.stringify({ email: user.email }),
      ipAddress: requestInfo.ip || null,
      userAgent: requestInfo.userAgent || "Unknown",
    });

    logger.info(
      {
        userId: user.id,
        email: user.email,
        action: "Password changed",
      },
      "User password changed"
    );

    return { message: "Password changed successfully" };
  }

  // Upload profile picture
  static async uploadProfilePicture(
    userId: string,
    uploadData: ProfilePictureUploadInput,
    requestInfo: RequestInfo
  ) {
    // Validate upload data
    const validatedData = profilePictureUploadSchema.parse(uploadData);

    // Get current user to check for existing profile picture
    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
    }

    try {
      // Delete old profile picture from Cloudinary if exists
      if (
        currentUser.profilePicture &&
        currentUser.profilePicture.includes("cloudinary.com")
      ) {
        try {
          const oldPublicId = CloudinaryService.extractPublicId(
            currentUser.profilePicture
          );
          await CloudinaryService.deleteImage(oldPublicId);
          logger.info(
            { oldPublicId },
            "Old profile picture deleted from Cloudinary"
          );
        } catch (error) {
          logger.warn(
            { error },
            "Failed to delete old profile picture, continuing with upload"
          );
        }
      }

      // Upload new image to Cloudinary
      const uploadResult = await CloudinaryService.uploadImage(
        validatedData.profilePicture,
        "ums/profile-pictures",
        `user_${userId}_profile` // Use consistent public ID format
      );

      // Update user with new profile picture URL
      const user = await UserModel.update(userId, {
        profilePicture: uploadResult.secure_url,
      });

      // Create activity log
      await ActivityLogModel.create({
        user: { connect: { id: user.id } },
        activity: "Profile picture updated",
        details: JSON.stringify({
          email: user.email,
          cloudinaryPublicId: uploadResult.public_id,
          imageSize: uploadResult.bytes,
          imageFormat: uploadResult.format,
        }),
        ipAddress: requestInfo.ip || null,
        userAgent: requestInfo.userAgent || "Unknown",
      });

      logger.info(
        {
          userId: user.id,
          email: user.email,
          action: "Profile picture updated",
          cloudinaryPublicId: uploadResult.public_id,
          imageSize: uploadResult.bytes,
        },
        "User profile picture updated successfully"
      );

      // Return the user object directly (not nested)
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      logger.error({ error, userId }, "Failed to upload profile picture");
      throw new ValidationError("Failed to upload profile picture", {
        profilePicture: ["Failed to upload image to cloud storage"],
      });
    }
  }

  // Removed getCurrentUser as it was redundant with getProfile
}
