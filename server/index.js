import "dotenv/config";
import express from "express";
import cors from "cors";
import payments from "./routes/payments.js";
import paystackWebhook from "./webhooks/paystack.js";
import { getOrderByReference, getAllOrders } from "./orders.js";

const app = express();

// ⚠️ Raw body is required for webhook verification
app.use(
  "/api/webhooks/paystack",
  express.raw({ type: "application/json" })
);

// Enable CORS
app.use(cors());
app.use(express.json());

// Payments routes
app.use("/api/payments", payments);

// Webhook route
app.post("/api/webhooks/paystack", paystackWebhook);

// Optional: endpoint to get order status by reference
app.get("/api/orders/:reference", (req, res) => {
  const reference = req.params.reference;
  getOrderByReference(reference)
    .then((order) => {
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.json({ status: order.status, order });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch order" });
    });
});

// Optional: endpoint to get all orders (for testing)
app.get("/api/orders", (req, res) => {
  getAllOrders()
    .then((orders) => res.json(orders))
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch orders" });
    });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
