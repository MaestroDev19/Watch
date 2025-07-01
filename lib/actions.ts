"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export async function login() {
  const isProduction = process.env.NODE_ENV === "production";
  const siteUrl = isProduction
    ? process.env.NEXT_PUBLIC_SITE_URL
    : `http://localhost:3000`;
  const redirectUrl = `${siteUrl}/auth/callback`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    console.error(error);
    throw new Error(`Failed to sign in: ${error.message}`);
  }
  if (data.url) {
    redirect(data.url);
  }
}

export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (!data.user || error) {
    return null;
  }
  return data.user;
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
    throw new Error(`Failed to logout: ${error.message}`);
  }
  redirect("/");
}
