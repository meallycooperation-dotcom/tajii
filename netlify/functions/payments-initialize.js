import { processPayment } from "../../server/lib/paymentProcessor.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON payload" }),
    };
  }

  try {
    const data = await processPayment(payload);
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("Netlify payment error:", err.message);
    return {
      statusCode: err.status || err.response?.status || 500,
      body: JSON.stringify({ message: err.message || "Payment failed" }),
    };
  }
};
