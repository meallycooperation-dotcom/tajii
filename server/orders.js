import { supabaseServer } from "./supabaseServer.js";

function buildOrderPayload(order, useLegacyPhoneColumn = false) {
  const payload = {
    reference: order.reference,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    delivery_address: order.delivery_address,
    delivery_city: order.delivery_city,
    total_amount: order.total_amount,
    status: order.status,
    items: order.items,
  };

  if (useLegacyPhoneColumn) {
    payload.customer_phne = order.customer_phone;
  } else {
    payload.customer_phone = order.customer_phone;
  }

  return payload;
}

export async function createOrderInDB(order) {
  let { data, error } = await supabaseServer
    .from("orders")
    .insert(buildOrderPayload(order))
    .select()
    .single();

  // Fallback for schema typo: customer_phne
  if (error && /customer_phone/i.test(error.message || "")) {
    ({ data, error } = await supabaseServer
      .from("orders")
      .insert(buildOrderPayload(order, true))
      .select()
      .single());
  }

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data;
}

export async function getOrderByReference(reference) {
  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .eq("reference", reference)
    .limit(1);

  if (error) {
    throw new Error(`Failed to fetch order: ${error.message}`);
  }

  return data?.[0] || null;
}

export async function markOrderPaid(reference) {
  const { data, error } = await supabaseServer
    .from("orders")
    .update({
      status: "paid",
      updated_at: new Date().toISOString(),
    })
    .eq("reference", reference)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return data;
}

export async function getAllOrders() {
  const { data, error } = await supabaseServer
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return data || [];
}
