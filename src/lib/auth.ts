import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/bd";
import { account, sessionTable, usersTable, verification } from "@/bd/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionTable,
      account: account,
      verification: verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});
