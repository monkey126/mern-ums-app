import dotenv from "dotenv";
import CloudinaryService from "../lib/cloudinary";

// Load environment variables
dotenv.config();

async function testCloudinary() {
  try {
    console.log("🧪 Testing Cloudinary configuration...");

    // Check environment variables
    console.log("📧 Cloudinary config:", {
      cloudName: process.env["CLOUDINARY_CLOUD_NAME"] ? "***" : "undefined",
      apiKey: process.env["CLOUDINARY_API_KEY"] ? "***" : "undefined",
      apiSecret: process.env["CLOUDINARY_API_SECRET"] ? "***" : "undefined",
    });

    // Test if Cloudinary is configured
    if (
      !process.env["CLOUDINARY_CLOUD_NAME"] ||
      !process.env["CLOUDINARY_API_KEY"] ||
      !process.env["CLOUDINARY_API_SECRET"]
    ) {
      console.error("❌ Cloudinary is not properly configured");
      console.log("📝 Please add the following to your .env file:");
      console.log("CLOUDINARY_CLOUD_NAME=your-cloud-name");
      console.log("CLOUDINARY_API_KEY=your-api-key");
      console.log("CLOUDINARY_API_SECRET=your-api-secret");
      process.exit(1);
    }

    console.log("✅ Cloudinary configuration found");

    // Test base64 validation
    const testBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const isValid = CloudinaryService.validateBase64Image(testBase64);
    console.log("✅ Base64 validation test:", isValid ? "PASSED" : "FAILED");

    // Test public ID extraction
    const testUrl = "https://res.cloudinary.com/test/image/upload/v123456/ums/profile-pictures/user_123_profile.jpg";
    try {
      const publicId = CloudinaryService.extractPublicId(testUrl);
      console.log("✅ Public ID extraction test:", publicId);
    } catch (error) {
      console.error("❌ Public ID extraction test failed:", error);
    }

    console.log("🎉 Cloudinary test completed successfully");
    console.log("📝 Note: Upload test requires actual Cloudinary credentials");
  } catch (error) {
    console.error("💥 Cloudinary test failed:", error);
    process.exit(1);
  }
}

// Run the test
testCloudinary();
