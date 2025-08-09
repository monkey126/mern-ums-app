import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log("🔗 Connecting to database...");

    // Test database connection
    await prisma.$connect();
    console.log("✅ Connected to database successfully");

    // Check if we're in development mode
    if (process.env["NODE_ENV"] === "production") {
      console.error("❌ Cannot reset database in production mode");
      process.exit(1);
    }

    console.log("🗑️  Clearing all data...");

    // Delete all activity logs first (due to foreign key constraints)
    const deletedActivityLogs = await prisma.activityLog.deleteMany();
    console.log(`   Deleted ${deletedActivityLogs.count} activity logs`);

    // Delete all users
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`   Deleted ${deletedUsers.count} users`);

    console.log("✅ Database reset completed successfully");
    console.log(
      '💡 You can now run "npm run seed:admin" to create an admin user'
    );

    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  resetDatabase();
}

export { resetDatabase };
