import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";

/**
 * JWT Configuration
 * Environment variables for token generation and validation
 */
const JWT_SECRET = process.env["JWT_SECRET"]!;
const JWT_EXPIRE = process.env["JWT_EXPIRE"] || "7d";
const JWT_REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"]!;
const JWT_REFRESH_EXPIRE = process.env["JWT_REFRESH_EXPIRE"] || "30d";

/**
 * Generate access token for authentication
 * Short-lived token for API access
 */
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRE,
    } as jwt.SignOptions
  );
};

/**
 * Generate refresh token for token renewal
 * Long-lived token for refreshing access tokens
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    JWT_REFRESH_SECRET as string,
    {
      expiresIn: JWT_REFRESH_EXPIRE,
    } as jwt.SignOptions
  );
};

/**
 * Verify and decode access token
 * Throws error if token is invalid or expired
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * Verify and decode refresh token
 * Throws error if token is invalid or expired
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * Decode token without verification
 * Returns null if token is malformed
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};
