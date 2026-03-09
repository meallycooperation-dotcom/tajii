import axios from "axios";
import { createOrderInDB } from "../orders.js";
import { supabaseServer } from "../supabaseServer.js";
import { v4 as uuidv4 } from "uuid"; // to generate a unique reference if needed

export async function initializePayment(req, res) {
  const {
    phone,
    deliveryInfo = {},
    cartItems = [],
    customerName,
    customerEmail,
  } = req.body;

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({
      message: "PAYSTACK_SECRET_KEY is missing on the server.",
    });
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ message: "Your cart is empty." });
  }

  const normalizedCart = cartItems
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

  if (normalizedCart.length === 0) {
    return res.status(400).json({ message: "Cart has invalid item values." });
  }

  if (!customerEmail) {
    return res
      .status(400)
      .json({ message: "Missing customer email for payment." });
  }

  // Calculate total amount
  const cartTotal = normalizedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let deliveryFee = 0;
  const hasDeliveryContext =
    deliveryInfo.deliveryType === "delivery" ||
    deliveryInfo.cityId != null ||
    deliveryInfo.deliveryPrice != null;

  if (hasDeliveryContext) {
    const locationId = deliveryInfo.cityId;
    if (locationId != null && locationId !== "") {
      const { data: deliveryLocation, error: deliveryLocationError } =
        await supabaseServer
          .from("delivery_locations")
          .select("price")
          .eq("id", locationId)
          .limit(1);

      if (deliveryLocationError) {
        return res.status(500).json({
          message: `Failed to fetch delivery fee: ${deliveryLocationError.message}`,
        });
      }

      const location = deliveryLocation?.[0];
      const normalizedDeliveryFee = Number(location?.price);
      if (
        !location ||
        !Number.isFinite(normalizedDeliveryFee) ||
        normalizedDeliveryFee < 0
      ) {
        return res.status(400).json({
          message: "Invalid delivery location fee. Please reselect your location.",
        });
      }
      deliveryFee = normalizedDeliveryFee;
    } else {
      const normalizedDeliveryFee = Number(deliveryInfo.deliveryPrice || 0);
      if (!Number.isFinite(normalizedDeliveryFee) || normalizedDeliveryFee < 0) {
        return res.status(400).json({
          message: "Invalid delivery fee value. Please reselect your location.",
        });
      }
      deliveryFee = normalizedDeliveryFee;
    }
  }

  const totalAmount = cartTotal + deliveryFee;

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    return res.status(400).json({ message: "Invalid cart total amount." });
  }

  try {
    // 1️⃣ Generate a unique reference
    const reference = uuidv4();

    // 2️⃣ Pre-save order with status "pending"
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

    // 3️⃣ Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: customerEmail,
        amount: totalAmount * 100, // Paystack uses kobo
        currency: "KES",
        reference,
        metadata: {
          cartItems: normalizedCart,
          deliveryInfo,
          cartTotal,
          deliveryFee,
          totalAmount,
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 4️⃣ Send Paystack checkout URL to frontend
    res.json(response.data.data);

  } catch (err) {
    const providerMessage =
      err.response?.data?.message || err.response?.data || err.message;
    console.error("Payment initialization error:", providerMessage);
    res.status(err.response?.status || 500).json({
      message: `Payment initialization failed: ${providerMessage}`,
    });
  }
}
