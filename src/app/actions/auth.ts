"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  if (!email || !password || !fullName) {
    return { success: false, error: "Please fill in all fields" };
  }

  // Detect the server's current origin dynamically (e.g. http://localhost:3001)
  const headersList = await headers();
  const origin = headersList.get("origin") || "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/login`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please fill in all fields" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  
  revalidatePath("/");
  return { success: true };
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getUserOrders() {
  const user = await getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }

  return data || [];
}
