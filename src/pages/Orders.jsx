import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../services/orderService";

const currency = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
});

const statusBadge = {
  pending: "bg-amber-500/20 border border-amber-500/30 text-amber-200",
  paid: "bg-emerald-500/20 border border-emerald-500/40 text-emerald-200",
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchUserOrders()
      .then((data) => {
        if (!cancelled) {
          setOrders(data);
          setStatus("loaded");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Orders</p>
            <h1 className="text-3xl font-bold">Your purchases</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-white/20 px-4 py-2 text-sm shadow-lg hover:border-emerald-400 transition"
          >
            Back to account
          </button>
        </header>

        {status === "loading" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
            <p className="text-slate-400">Loading your orders…</p>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-500/50 bg-red-500/10 p-6 text-sm text-red-200">
            {error || "Unable to load orders right now."}
          </div>
        )}

        {status === "loaded" && orders.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
            No orders yet. Shop a product to see your purchases listed here.
          </div>
        )}

        {status === "loaded" && orders.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const formattedDate = new Date(order.created_at).toLocaleString("en-KE", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <article
                  key={order.reference}
                  className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-800 p-5 shadow-2xl shadow-slate-900/60"
                >
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>ID #{order.id}</span>
                    <span className={`rounded-full px-3 py-1 text-xs ${statusBadge[order.status] || "bg-slate-700/40"}`}>
                      {order.status}
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-white">{order.reference}</h2>
                  <p className="text-slate-400 text-sm">
                    {order.customer_name} · {order.customer_email}
                  </p>
                  <p className="text-slate-400 text-sm">
                    City: {order.delivery_city || "-"}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {currency.format(order.total_amount)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                    Placed {formattedDate}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} × {currency.format(item.price)}
                        </span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-slate-500">
                        +{items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
