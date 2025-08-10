import nodemailer from "nodemailer";
import logger from "./logger";

// Email transporter configuration
const createTransporter = () => {
  const config = {
    host: process.env["EMAIL_HOST"],
    port: parseInt(process.env["EMAIL_PORT"] || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env["EMAIL_USER"],
      pass: process.env["EMAIL_PASS"],
    },
    // tls: {
    //   rejectUnauthorized: false,
    // },
  };

  console.log("Creating transporter with config:", {
    ...config,
    auth: {
      user: config.auth.user ? "***" : "undefined",
      pass: config.auth.pass ? "***" : "undefined",
    },
  });

  return nodemailer.createTransport(config);
};

// Email templates
const emailTemplates = {
  emailVerification: (name: string, verificationUrl: string) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to World IT Ltd!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with us, please ignore this email.
        </p>
      </div>
    `,
  }),

  passwordReset: (name: string, resetUrl: string) => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `,
  }),

  welcomeEmail: (name: string) => ({
    subject: "Welcome to World IT Ltd!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to World IT Ltd!</h2>
        <p>Hi ${name},</p>
        <p>Your email has been successfully verified and your account is now active!</p>
        <p>You can now access all features of our platform.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env["FRONTEND_URL"]}/login" 
             style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <p>Thank you for joining us!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Best regards,<br>
          The World IT Ltd Team
        </p>
      </div>
    `,
  }),

  adminNotification: (action: string, details: string) => ({
    subject: `Admin Notification: ${action}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Admin Notification</h2>
        <p><strong>Action:</strong> ${action}</p>
        <p><strong>Details:</strong></p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <pre style="white-space: pre-wrap; font-family: monospace;">${details}</pre>
        </div>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from the User Management System.
        </p>
      </div>
    `,
  }),
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private lastEmailTime: number = 0;
  private readonly EMAIL_DELAY_MS = 10000; // 10 seconds between emails

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = createTransporter();
    }
    return this.transporter;
  }

  // Time guard to prevent rate limiting
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastEmail = now - this.lastEmailTime;

    if (this.lastEmailTime > 0 && timeSinceLastEmail < this.EMAIL_DELAY_MS) {
      const waitTime = this.EMAIL_DELAY_MS - timeSinceLastEmail;
      logger.info(`Rate limiting: waiting ${waitTime}ms before sending email`);
      console.log(
        `⏳ Waiting ${Math.round(waitTime / 1000)}s to avoid rate limiting...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastEmailTime = Date.now();
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      logger.info("Email service connected successfully");
      return true;
    } catch (error) {
      logger.error("Email service connection failed:", error);
      console.error("Detailed error:", error);
      return false;
    }
  }

  // Send email verification
  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string
  ): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      const verificationUrl = `${process.env["FRONTEND_URL"]}/verify-email?token=${verificationToken}`;
      const template = emailTemplates.emailVerification(name, verificationUrl);

      await this.getTransporter().sendMail({
        from: process.env["EMAIL_FROM"],
        to: email,
        subject: template.subject,
        html: template.html,
      });

      logger.info(`Email verification sent to: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email verification to ${email}:`, error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordReset(
    email: string,
    name: string,
    resetToken: string
  ): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      const resetUrl = `${process.env["FRONTEND_URL"]}/reset-password?token=${resetToken}`;
      const template = emailTemplates.passwordReset(name, resetUrl);

      await this.getTransporter().sendMail({
        from: process.env["EMAIL_FROM"],
        to: email,
        subject: template.subject,
        html: template.html,
      });

      logger.info(`Password reset email sent to: ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      const template = emailTemplates.welcomeEmail(name);

      await this.getTransporter().sendMail({
        from: process.env["EMAIL_FROM"],
        to: email,
        subject: template.subject,
        html: template.html,
      });

      logger.info(`Welcome email sent to: ${email}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send welcome email to ${email}:`, error);

      // Check if it's a rate limiting error
      if (error?.response?.includes("Too many emails per second")) {
        logger.warn(
          "Rate limiting detected - consider increasing EMAIL_DELAY_MS"
        );
      }

      return false;
    }
  }

  // Send admin notification
  async sendAdminNotification(
    adminEmail: string,
    action: string,
    details: any
  ): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      const template = emailTemplates.adminNotification(
        action,
        JSON.stringify(details, null, 2)
      );

      await this.getTransporter().sendMail({
        from: process.env["EMAIL_FROM"],
        to: adminEmail,
        subject: template.subject,
        html: template.html,
      });

      logger.info(`Admin notification sent to: ${adminEmail}`);
      return true;
    } catch (error) {
      logger.error(
        `Failed to send admin notification to ${adminEmail}:`,
        error
      );
      return false;
    }
  }

  // Send custom email
  async sendCustomEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      await this.getTransporter().sendMail({
        from: process.env["EMAIL_FROM"],
        to,
        subject,
        html,
        text,
      });

      logger.info(`Custom email sent to: ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send custom email to ${to}:`, error);
      return false;
    }
  }
}

// Create and export email service instance
export const emailService = new EmailService();

// Helper functions for easy access
export const sendEmailVerification = (
  email: string,
  name: string,
  token: string
) => emailService.sendEmailVerification(email, name, token);

export const sendPasswordReset = (email: string, name: string, token: string) =>
  emailService.sendPasswordReset(email, name, token);

export const sendWelcomeEmail = (email: string, name: string) =>
  emailService.sendWelcomeEmail(email, name);

export const sendAdminNotification = (
  adminEmail: string,
  action: string,
  details: any
) => emailService.sendAdminNotification(adminEmail, action, details);

export const testEmailConnection = () => emailService.testConnection();
