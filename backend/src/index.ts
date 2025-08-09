import { app } from "./server";
import logger from "./utils/logger";

const PORT = process.env["PORT"] || 5000;

export async function startServer() {
  try {
    // Only start the server if we're not in test mode
    if (process.env["NODE_ENV"] !== "test") {
      app.listen(PORT, () => {
        logger.info(
          `Server running on port ${PORT} in ${
            process.env["NODE_ENV"] || "development"
          } mode`
        );
      });
    }
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
