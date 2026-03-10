import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderByReference } from "../services/orderService";

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const statusBadge = {
  pending: "bg-amber-500/20 border border-amber-500/30 text-amber-200",
  paid: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200",
};

export default function OrderDetails() {
  const { reference } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) {
      setError("Order reference is missing.");
      setStatus("error");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError("");

    fetchOrderByReference(reference)
      .then((data) => {
        if (!cancelled) {
          setOrder(data);
          setStatus("loaded");
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Order detail</p>
            <h1 className="text-3xl font-bold">#{reference || "—"}</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-white/20 px-4 py-2 text-sm shadow-lg hover:border-emerald-400 transition"
          >
            Back to orders
          </button>
        </header>

        <div
          className="rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-800 p-6 shadow-2xl shadow-slate-900/60"
        >
          {status === "loading" && (
            <p className="text-slate-400">Loading order…</p>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-200">
              {error || "Unable to load the requested order."}
            </div>
          )}

          {status === "loaded" && order && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${statusBadge[order.status] || "bg-slate-700/40"}`}
                >
                  {order.status}
                </span>
                <span>Placed {placedAt}</span>
                {updatedAt && <span>Updated {updatedAt}</span>}
              </div>

              <div className="grid gap-5 text-sm sm:grid-cols-2">
                <div className="space-y-1 rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                  <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">Customer</h2>
                  <p className="text-white">{order.customer_name || "—"}</p>
                  <p className="text-slate-400">{order.customer_email || "—"}</p>
                  <p className="text-slate-400">{order.customer_phone || "—"}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                  <h2 className="text-xs uppercase tracking-[0.4em] text-slate-500">Delivery</h2>
                  <p className="text-white">{order.delivery_address || "Address not set"}</p>
                  <p className="text-slate-400">{order.delivery_city || "City not set"}</p>
                </div>
              </div>

              <div className="space-y-2 rounded-2xl border border-white/5 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="uppercase tracking-[0.25em]">Items</span>
                  <span className="text-xs">Total {currency.format(order.total_amount || 0)}</span>
                </div>
                <div className="space-y-3">
                  {items.length === 0 && (
                    <p className="text-xs text-slate-500">No items recorded for this order.</p>
                  )}
                  {items.map((item) => (
                    <div
                      key={item.id || `${item.name}-${item.quantity}-${item.price}`}
                      className="flex justify-between text-sm text-slate-200"
                    >
                      <div>
                        <p>{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.variant || "Standard"} · {item.quantity} × {currency.format(item.price)}
                        </p>
                      </div>
                      <p className="text-right text-xs text-slate-400">
                        {currency.format((item.price || 0) * (item.quantity || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
