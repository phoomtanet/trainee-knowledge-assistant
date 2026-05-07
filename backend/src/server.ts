import app from "./app";
import { connectDatabase } from "./config/database";
import { seedAdminUser } from "./utils/seed";
import { env } from "./config/env";

const start = async (): Promise<void> => {
  await connectDatabase();
  await seedAdminUser();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch(console.error);
