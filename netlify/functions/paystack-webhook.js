import crypto from "crypto";
import { markOrderPaid } from "../../server/orders.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  const env = globalThis.process?.env || {};
  const secret = env.PAYSTACK_WEBHOOK_SECRET || env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return {
      statusCode: 500,
      body: "Missing Paystack webhook secret",
    };
  }

  const signature = crypto
    .createHmac("sha512", secret)
    .update(event.body || "")
    .digest("hex");

  if (signature !== event.headers["x-paystack-signature"]) {
    return {
      statusCode: 401,
      body: "Invalid signature",
    };
  }

  try {
    const eventPayload = JSON.parse(event.body || "{}");
    if (eventPayload.event === "charge.success") {
      await markOrderPaid(eventPayload.data.reference);
    }
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Webhook processing error:", err);
    return { statusCode: 400, body: "Failed to process webhook" };
  }
};
