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
    e.preventDefault(); // prevent page reload
    setError("");
    console.log("Login attempt with:", email); // debug email

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // 🔹 Log the raw Supabase response
      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Login error:", error); // 🔹 Log error
        throw error;
      }

      if (!data?.session) {
        const msg = "Login failed. Check your email/password or confirm your email.";
        console.error(msg); // 🔹 Log session error
        throw new Error(msg);
      }

      navigate("/account");
    } catch (err) {
      console.error("Caught login error:", err); // 🔹 Another console log for full stack trace
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm mt-4">
        Don’t have an account? <Link to="/signup" className="underline">Register</Link>
      </p>
    </div>
  );
}
