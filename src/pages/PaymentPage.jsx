import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
    <div className="min-h-screen bg-white px-4 py-12 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="text-center text-slate-900">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
            Secure Checkout
          </p>
          <h1 className="mt-2 text-3xl font-bold">Confirm your payment</h1>
          <p className="mt-1 text-sm text-slate-500">
            All charges are processed securely via Paystack.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Delivery</h2>
            <span className="text-xs uppercase tracking-[0.4em] text-slate-400">
              {deliveryInfo.deliveryType || "Pickup"}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {deliveryInfo.address || "No address selected"}
          </p>
          <p className="text-sm text-slate-500">
            City: {deliveryInfo.city || "Not set"}
          </p>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span>Cart total</span>
              <span className="font-semibold">Ksh {cartTotal}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span>Delivery fee</span>
              <span className="font-semibold">Ksh {deliveryFee}</span>
            </div>
            <div className="flex items-center justify-between text-lg font-bold text-slate-900">
              <span>Total payable</span>
              <span>Ksh {payableTotal}</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <p className="text-sm text-slate-600">
            We will use the phone number on file for Paystack.
          </p>
          {sessionUser && (
            <p className="mt-2 text-xs text-slate-500">
              Session email: {sessionUser.email || "not provided"}
            </p>
          )}
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-red-600">{error}</p>
                {!sessionUser &&
                  /log\\s*in|login/i.test(error) && (
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Go to Login
                    </Link>
                  )}
              </div>
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition ${
              loading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-gradient-to-r from-emerald-500 to-slate-900 hover:from-emerald-600 hover:to-slate-900"
            }`}
          >
            {loading ? "Redirecting to payment..." : "Pay Now"}
          </button>
        </section>
      </div>
    </div>
  );
}
