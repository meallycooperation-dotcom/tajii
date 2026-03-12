import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderByReference } from "../services/orderService";

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const statusBadge = {
  pending: "bg-amber-500/20 border border-amber-500/30 text-amber-900",
  paid: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-900",
};

export default function OrderDetails() {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setStatus("loading");
        setOrder(null);
      }
    });

    fetchOrderByReference(reference)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setStatus("loaded");
          setError("");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Unable to load the order.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reference]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const placedAt = order?.created_at
    ? new Date(order.created_at).toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
  const updatedAt = order?.updated_at
    ? new Date(order.updated_at).toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const missingReference = !reference;

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Orders</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Order #{reference || "—"}
            </h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm shadow hover:border-emerald-400 transition"
          >
            Back to orders
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200">
          {missingReference && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
              Order reference is missing.
            </div>
          )}

          {!missingReference && status === "loading" && (
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm">
              <p className="text-slate-500">Loading your order…</p>
            </div>
          )}

          {!missingReference && status === "error" && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 shadow-sm">
              {error || "Unable to load the requested order."}
            </div>
          )}

          {!missingReference && status === "loaded" && order && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${
                    statusBadge[order.status] || "bg-slate-200/60 text-slate-800"
                  }`}
                >
                  {order.status}
                </span>
                <span>Placed {placedAt}</span>
                {updatedAt && <span>Updated {updatedAt}</span>}
              </div>

              <div className="grid gap-5 text-sm sm:grid-cols-2">
                <div className="space-y-1 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    Customer
                  </h2>
                  <p className="font-semibold text-slate-900">
                    {order.customer_name || "—"}
                  </p>
                  <p className="text-slate-600">{order.customer_email || "—"}</p>
                  <p className="text-slate-600">{order.customer_phone || "—"}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">
                    Delivery
                  </h2>
                  <p className="font-semibold text-slate-900">
                    {order.delivery_address || "Address not set"}
                  </p>
                  <p className="text-slate-600">{order.delivery_city || "City not set"}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Items
                  </span>
                  <span className="font-semibold text-slate-900">
                    Total {currency.format(order.total_amount || 0)}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-500">No items recorded for this order.</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id || `${item.name}-${item.quantity}-${item.price}`}
                        className="flex justify-between gap-4 border-b border-slate-200/80 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {item.variant || "Standard"} · {item.quantity} ×{" "}
                            {currency.format(item.price)}
                          </p>
                        </div>
                        <p className="text-right text-sm font-semibold text-slate-900">
                          {currency.format((item.price || 0) * (item.quantity || 0))}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
