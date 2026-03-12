import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        navigate("/login");
      } else {
        const userId = session.user.id;
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (profileError) console.error("Profile fetch error:", profileError);

        setUser({ ...session.user, ...data });
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    } else {
      navigate("/login");
    }
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <header className="flex flex-col gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Profile</p>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome, {user?.full_name || user?.email}
              </h1>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Home
              </button>
              <span className="rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white">
                Member
              </span>
            </div>
          </header>

          <main className="space-y-6 px-6 pb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Orders</p>
                <p className="text-2xl font-semibold text-slate-900">
                  Tap to view & manage
                </p>
                <button
                  onClick={() => navigate("/orders")}
                  className="mt-4 w-full rounded-2xl border border-emerald-500/70 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-500/20"
                >
                  View orders
                </button>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Inbox</p>
                <p className="text-2xl font-semibold text-slate-900">
                  Stay in the loop
                </p>
                <button
                  onClick={() => navigate("/inbox")}
                  className="mt-4 w-full rounded-2xl border border-slate-700/40 bg-slate-900/80 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
                >
                  Open inbox
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/70 p-4 shadow-lg shadow-slate-900/30">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick links</p>
              <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <button
                  onClick={() => navigate("/address")}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold shadow-inner transition hover:border-slate-500"
                >
                  Delivery address
                  <span className="text-slate-400">{">"}</span>
                </button>
                <button
                  onClick={() => navigate("/account-management")}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold shadow-inner transition hover:border-slate-500"
                >
                  Account settings
                  <span className="text-slate-400">{">"}</span>
                </button>
                <button
                  onClick={() => navigate("/support")}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold shadow-inner transition hover:border-slate-500"
                >
                  Support
                  <span className="text-slate-400">{">"}</span>
                </button>
                <button
                  onClick={() => navigate("/delete-account")}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-red-300 bg-red-50 px-4 py-3 text-left font-semibold text-red-700 shadow-inner transition hover:border-red-400"
                >
                  Delete account
                  <span className="text-red-400">{">"}</span>
                </button>
              </div>
            </div>
          </main>

          <footer className="border-t border-white/50 px-6 py-5">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl border border-red-500 bg-red-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
