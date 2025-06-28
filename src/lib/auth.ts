import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/bd";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
    usePlural: true,
  }),
  user: {
    modelName: "appUsersTable",
  },
  session: {
    modelName: "sessionTable",
  },
  account: {
    modelName: "account",
  },
  verification: {
    modelName: "verification",
  },
});
