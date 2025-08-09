import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    console.log("🔗 Connecting to database...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Connected to database successfully");

    // Check if we're in development mode
    if (process.env["NODE_ENV"] === "production") {
      console.error("❌ Cannot seed test data in production mode");
      process.exit(1);
    }

    // Validate database connection
    try {
      await prisma.user.count();
      console.log("✅ Database connection and schema validation passed");
    } catch (error) {
      console.error(
        "❌ Database connection or schema validation failed:",
        error
      );
      process.exit(1);
    }

    console.log("🌱 Seeding test data...");

    // Create test users
    const testUsers = [
      {
        name: "System Admin",
        email: "admin@test.com",
        password: "TestPass123!",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        phone: "+1234567885",
      },
      {
        name: "John Client",
        email: "client@test.com",
        password: "TestPass123!",
        role: UserRole.CLIENT,
        status: UserStatus.ACTIVE,
        phone: "+1234567891",
      },
      {
        name: "Jane Developer",
        email: "developer@test.com",
        password: "TestPass123!",
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        phone: "+1234567892",
      },
      {
        name: "Bob Moderator",
        email: "moderator@test.com",
        password: "TestPass123!",
        role: UserRole.MODERATOR,
        status: UserStatus.ACTIVE,
        phone: "+1234567893",
      },
      {
        name: "Alice Inactive",
        email: "inactive@test.com",
        password: "TestPass123!",
        role: UserRole.CLIENT,
        status: UserStatus.INACTIVE,
        phone: "+1234567894",
      },
      {
        name: "Charlie Suspended",
        email: "suspended@test.com",
        password: "TestPass123!",
        role: UserRole.CLIENT,
        status: UserStatus.SUSPENDED,
        phone: "+1234567895",
      },
    ];

    const createdUsers = [];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        console.log(
          `   ⚠️  User ${userData.email} already exists, skipping...`
        );
        createdUsers.push(existingUser);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          status: userData.status,
          emailVerified: true,
          phone: userData.phone,
        },
      });

      createdUsers.push(user);
      console.log(`   ✅ Created user: ${user.name} (${user.email})`);
    }

    // Create some activity logs
    const activityLogs = [
      {
        userId: createdUsers[0]?.id,
        activity: "User registered",
        details: "New user registration",
        ipAddress: "192.168.1.1",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      {
        userId: createdUsers[1]?.id,
        activity: "User logged in",
        details: "Successful login",
        ipAddress: "192.168.1.2",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      {
        userId: createdUsers[2]?.id,
        activity: "Profile updated",
        details: "User updated their profile information",
        ipAddress: "192.168.1.3",
        userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      },
      {
        userId: createdUsers[3]?.id,
        activity: "Password reset requested",
        details: "User requested password reset",
        ipAddress: "192.168.1.4",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1) AppleWebKit/605.1.15",
      },
    ];

    for (const logData of activityLogs) {
      if (logData.userId) {
        await prisma.activityLog.create({
          data: {
            ...logData,
            userId: logData.userId!,
          },
        });
        console.log(
          `   📝 Created activity log: ${logData.activity} for ${
            createdUsers.find((u) => u.id === logData.userId)?.name || "Unknown"
          }`
        );
      }
    }

    console.log("✅ Test data seeding completed successfully");
    console.log("📊 Created users:");
    createdUsers.forEach((user) => {
      console.log(
        `   - ${user.name} (${user.email}) - ${user.role} - ${user.status}`
      );
    });

    console.log("\n🔐 Test Login Credentials:");
    testUsers.forEach((user) => {
      console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });

    console.log("\n⚠️  Security Note: Change these passwords in production!");

    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding test data:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedTestData();
}

export { seedTestData };
