import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/bd/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_Ie58UPlYXTLS@ep-crimson-boat-acont3l9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require",
  },
});
