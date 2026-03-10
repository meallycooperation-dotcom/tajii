import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.session) throw new Error("Login failed. Check your credentials.");

      navigate("/account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 shadow-2xl shadow-slate-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-800 opacity-60 pointer-events-none" />
        <div className="relative space-y-6 p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              Tajii
            </p>
            <h1 className="text-3xl font-semibold text-white">Sign in</h1>
            <p className="text-sm text-slate-400">
              Access your orders, save favorites, and proceed with checkout quickly.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full bg-slate-800 text-white border-slate-700 focus:border-emerald-400 focus:ring-emerald-400"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full bg-slate-800 text-white border-slate-700 focus:border-emerald-400 focus:ring-emerald-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-base shadow-lg shadow-emerald-500/30"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-sm text-slate-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-emerald-300 hover:text-emerald-200">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
