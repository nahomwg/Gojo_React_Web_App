import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: "http://localhost:5173", // Your app URL
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;