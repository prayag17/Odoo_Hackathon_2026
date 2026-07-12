import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { pool } from "./db.js";
import { sendOnboardingEmail, sendVerificationEmail } from "./lib/mailer.js";

export const auth = betterAuth({
  appName: "TransitOps",
  database: pool,
  trustedOrigins: ["http://localhost:3000"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // seconds
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendVerificationEmail(user, url);
      } catch (err) {
        console.error("Failed to send verification email:", err);
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendOnboardingEmail(user);
          } catch (err) {
            console.error("Failed to send onboarding email:", err);
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "fleet_manager",
        input: true,
      },
    },
  },
  plugins: [dash()],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github"], // Specify which providers can link automatically
      // allowDifferentEmails: false, // Prevent linking profiles with differing emails
    },
  },
});
