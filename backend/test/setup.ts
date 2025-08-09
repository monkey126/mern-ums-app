import { config } from "dotenv";
import { prisma } from "../src/lib/prisma";
import { expect } from "@jest/globals";

// Load test environment variables
config({ path: ".env.test" });

expect.extend({
  toBeArray(received: any) {
    const pass = Array.isArray(received);
    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} not to be an array`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} to be an array`,
        pass: false,
      };
    }
  },
  toBeString(received: any) {
    const pass = typeof received === "string";
    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} not to be a string`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(received)} to be a string`,
        pass: false,
      };
    }
  },
});

beforeAll(async () => {
  // Set test environment
  process.env["NODE_ENV"] = "test";

  // No need to explicitly connect - Prisma will connect on first query
  console.log("Test environment initialized");
}, 5000);

afterAll(async () => {
  try {
    // Clean up test data
    await prisma.activityLog.deleteMany();
    await prisma.user.deleteMany();

    // Disconnect from test database
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error in test cleanup:", error);
  }
}, 10000);

// Individual test files handle their own cleanup
