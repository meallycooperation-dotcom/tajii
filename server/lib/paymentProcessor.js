import axios from "axios";
import { supabaseServer } from "../supabaseServer.js";
import { createOrderInDB } from "../orders.js";
import { v4 as uuidv4 } from "uuid";

const normalizeCart = (cartItems) => {
  const normalized = cartItems
    .map((item) => {
      const normalizedPrice = Number(
        String(item.price ?? "").replace(/[^0-9.-]/g, "")
      );
      const normalizedQty = Number(item.quantity);
      return {
        ...item,
        price: normalizedPrice,
        quantity: normalizedQty,
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.price) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );

  if (normalized.length === 0) {
    const error = new Error("Cart has invalid item values.");
    error.status = 400;
    throw error;
  }

  return normalized;
};

const resolveDeliveryFee = async (deliveryInfo) => {
  const hasDeliveryContext =
    deliveryInfo.deliveryType === "delivery" ||
    deliveryInfo.cityId != null ||
    deliveryInfo.deliveryPrice != null;

  if (!hasDeliveryContext) {
    return 0;
  }

  const locationId = deliveryInfo.cityId;
  if (locationId != null && locationId !== "") {
    const { data: deliveryLocation, error } = await supabaseServer
      .from("delivery_locations")
      .select("price")
      .eq("id", locationId)
      .limit(1);

    if (error) {
      const err = new Error(`Failed to fetch delivery fee: ${error.message}`);
      err.status = 500;
      throw err;
    }

    const location = deliveryLocation?.[0];
    const normalizedDeliveryFee = Number(location?.price);
    if (
      !location ||
      !Number.isFinite(normalizedDeliveryFee) ||
      normalizedDeliveryFee < 0
    ) {
      const err = new Error(
        "Invalid delivery location fee. Please reselect your location."
      );
      err.status = 400;
      throw err;
    }

    return normalizedDeliveryFee;
  }

  const normalizedDeliveryFee = Number(deliveryInfo.deliveryPrice || 0);
  if (!Number.isFinite(normalizedDeliveryFee) || normalizedDeliveryFee < 0) {
    const err = new Error(
      "Invalid delivery fee value. Please reselect your location."
    );
    err.status = 400;
    throw err;
  }

  return normalizedDeliveryFee;
};

export async function processPayment({
  phone,
  deliveryInfo = {},
  cartItems = [],
  customerName,
  customerEmail,
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    const err = new Error("PAYSTACK_SECRET_KEY is missing on the server.");
    err.status = 500;
    throw err;
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    const err = new Error("Your cart is empty.");
    err.status = 400;
    throw err;
  }

  const normalizedCart = normalizeCart(cartItems);
  if (!customerEmail) {
    const err = new Error("Missing customer email for payment.");
    err.status = 400;
    throw err;
  }

  const cartTotal = normalizedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = await resolveDeliveryFee(deliveryInfo);
  const totalAmount = cartTotal + deliveryFee;

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    const err = new Error("Invalid cart total amount.");
    err.status = 400;
    throw err;
  }

  const reference = uuidv4();
  await createOrderInDB({
    reference,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: phone,
    delivery_address: deliveryInfo.address,
    delivery_city: deliveryInfo.city,
    total_amount: totalAmount,
    items: normalizedCart,
    status: "pending",
  });

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: customerEmail,
      amount: totalAmount * 100,
      currency: "KES",
      reference,
      metadata: {
        cartItems: normalizedCart,
        deliveryInfo,
        cartTotal,
        deliveryFee,
        totalAmount,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.data;
}
