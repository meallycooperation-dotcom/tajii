import crypto from "crypto";
import { markOrderPaid } from "../orders.js";

export default async function paystackWebhook(req, res) {
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;

  if (!secret) {
    return res.status(500).send("Missing Paystack webhook secret");
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(req.body)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body);

  if (event.event === "charge.success") {
    const reference = event.data.reference;
    console.log("Payment successful:", reference);

    await markOrderPaid(reference);
    return res.sendStatus(200);
  }

  return res.sendStatus(200);
}
