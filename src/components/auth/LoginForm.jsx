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
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;
      if (!data?.session) throw new Error("Login failed. Check your credentials.");

      navigate("/account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-sm">
          <header className="flex flex-col gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Account</p>
              <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
              <p className="text-sm text-slate-600">
                Access your orders, save favorites, and checkout faster.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Home
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-900"
              >
                Sign up
              </Link>
            </div>
          </header>

          <section className="space-y-6 px-6 pb-10">
            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-semibold text-slate-900 hover:underline">
                Create one
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

