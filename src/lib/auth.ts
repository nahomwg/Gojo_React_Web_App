import { betterAuth } from "better-auth";
import { supabaseAdapter } from "better-auth/adapters/supabase";
import { supabase } from "./supabase";

export const auth = betterAuth({
  database: supabaseAdapter(supabase),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "renter",
      },
      name: {
        type: "string",
        required: true,
      },
      phone: {
        type: "string",
        required: true,
      },
      photo_url: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;