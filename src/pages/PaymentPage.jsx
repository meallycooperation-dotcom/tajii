import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { getCart } from "../services/productService";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")
  : "https://tajii-server-production.up.railway.app";
const initializePaymentUrl = `${apiBaseUrl}/api/payment/initialize`;

export default function PaymentPage() {
  const location = useLocation();
  const deliveryInfo = location.state || {};
  const cartItems = getCart();
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const deliveryFee =
    deliveryInfo.deliveryType === "delivery"
      ? Number(deliveryInfo.deliveryPrice || 0)
      : 0;
  const payableTotal = cartTotal + deliveryFee;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (!error) setSessionUser(session?.user || null);
    };
    loadSession();
  }, []);

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        setError("Please log in to continue with payment.");
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("user_id", session.user.id)
        .limit(1);

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError(`Unable to load your profile: ${profileError.message}`);
        setLoading(false);
        return;
      }

      const userProfile = profile?.[0] || null;
      const profilePhone = userProfile?.phone?.trim() || "";
      if (!profilePhone) {
        setError(
          "Your account does not have a phone number in profile. Please update your profile."
        );
        setLoading(false);
        return;
      }

      const customerName =
        userProfile?.full_name ||
        session.user.user_metadata?.full_name ||
        session.user.email ||
        "Customer";
      const customerEmail =
        session.user.email ||
        session.user.user_metadata?.email ||
        userProfile?.email ||
        "";

      if (!customerEmail) {
        setError(
          "We could not read your email from Supabase. Update your profile/email before continuing."
        );
        setLoading(false);
        return;
      }

      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        setError("Your cart is empty.");
        setLoading(false);
        return;
      }

      const res = await fetch(initializePaymentUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  customer_name: customerName,
  customer_email: customerEmail,
  customer_phone: profilePhone,
  delivery_address: deliveryInfo.address,
  delivery_city: deliveryInfo.city,
  total_amount: payableTotal,
  items: cartItems
}),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Payment initialization failed.");
      }

      const checkoutUrl = data?.payment_url || data?.authorization_url;
      if (!checkoutUrl) {
        console.error("Missing payment_url/authorization_url:", data);
        throw new Error("Unable to prepare the checkout. Please try again.");
      }

      // Redirect user to Paystack checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Payment</h1>

      <p className="mb-4 text-sm">
        Delivery to:{" "}
        <strong>{deliveryInfo.address || "No address selected"}</strong>
        <br />
        City: <strong>{deliveryInfo.city || "-"}</strong>
      </p>

      <div className="mb-4 text-sm space-y-1">
        <p>Cart Total: <strong>Ksh {cartTotal}</strong></p>
        <p>Delivery Fee: <strong>Ksh {deliveryFee}</strong></p>
        <p>Total Payable: <strong>Ksh {payableTotal}</strong></p>
      </div>

      <p className="mb-4 text-sm">
        The phone number from your profile will be used for payment.
      </p>

      {sessionUser && (
        <p className="text-xs text-slate-400">
          Session email: {sessionUser.email || "not provided"}
        </p>
      )}
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {loading ? "Redirecting to payment..." : "Pay Now"}
      </button>
    </div>
  );
}
