import { supabase } from "../supabaseClient";

export async function fetchUserOrders() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error("Failed to read session");
  }

  const userEmail = sessionData?.session?.user?.email;
  if (!userEmail) {
    throw new Error("Login required to view orders");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, reference, customer_name, customer_email, customer_phone, delivery_city, total_amount, status, created_at, updated_at, items"
    )
    .eq("customer_email", userEmail)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchOrderByReference(reference) {
  if (!reference) {
    throw new Error("Order reference is required");
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error("Failed to read session");
  }

  const userEmail = sessionData?.session?.user?.email;
  if (!userEmail) {
    throw new Error("Login required to view orders");
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, reference, customer_name, customer_email, customer_phone, delivery_address, delivery_city, total_amount, status, created_at, updated_at, items"
    )
    .eq("reference", reference)
    .eq("customer_email", userEmail)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Order not found");
  }

  return data;
}
