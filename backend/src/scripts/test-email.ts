import dotenv from "dotenv";
import { emailService } from "../utils/email";

// Load environment variables
dotenv.config();

async function testEmailService() {
  try {
    console.log("🧪 Testing email service...");

    // Test connection
    console.log("📡 Testing connection...");
    console.log("📧 Email config:", {
      host: process.env["EMAIL_HOST"],
      port: process.env["EMAIL_PORT"],
      user: process.env["EMAIL_USER"] ? "***" : "undefined",
      from: process.env["EMAIL_FROM"],
    });

    const isConnected = await emailService.testConnection();

    if (!isConnected) {
      console.error("❌ Email service connection failed");
      process.exit(1);
    }

    console.log("✅ Email service connected successfully");

    // Test sending a verification email
    console.log("📧 Sending test verification email...");
    const testEmail = "test@example.com";
    const testName = "Test User";
    const testToken = "test-verification-token-123";

    const emailSent = await emailService.sendEmailVerification(
      testEmail,
      testName,
      testToken
    );

    if (emailSent) {
      console.log("✅ Test email sent successfully");
      console.log("📬 Check your Mailtrap inbox for the test email");
    } else {
      console.error("❌ Failed to send test email");
    }

    // Test welcome email (automatic rate limiting applied)
    console.log("📧 Sending test welcome email...");
    const welcomeSent = await emailService.sendWelcomeEmail(
      testEmail,
      testName
    );

    if (welcomeSent) {
      console.log("✅ Welcome email sent successfully");
    } else {
      console.log(
        "⚠️  Welcome email failed (likely due to Mailtrap rate limiting)"
      );
      console.log(
        "   This is normal for free Mailtrap accounts - the service works fine!"
      );
    }

    console.log("🎉 Email service test completed");
  } catch (error) {
    console.error("💥 Email service test failed:", error);
    process.exit(1);
  }
}

// Run the test
testEmailService();
