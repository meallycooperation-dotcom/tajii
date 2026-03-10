import { processPayment } from "../lib/paymentProcessor.js";

export async function initializePayment(req, res) {
  try {
    const data = await processPayment(req.body);
    res.json(data);
  } catch (err) {
    console.error("Payment initialization error:", err.message);
    res.status(err.status || err.response?.status || 500).json({
      message: err.message || "Payment initialization failed.",
    });
  }
}
