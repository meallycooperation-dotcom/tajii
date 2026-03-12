import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

const inputs = [
  { label: "Full Name", name: "full_name", type: "text" },
  { label: "Phone Number", name: "phone", type: "text" },
  { label: "Email Address", name: "email", type: "email" },
  { label: "Password", name: "password", type: "password" },
  { label: "Confirm Password", name: "confirmPassword", type: "password" },
];

export default function SignupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.terms) {
      setError("You must accept terms and conditions");
      return;
    }

    try {
      setLoading(true);
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("User creation failed");

      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: user.id,
        full_name: form.full_name,
        phone: form.phone,
        gender: form.gender,
        email: form.email,
      });
      if (profileError) throw profileError;

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
              <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
              <p className="text-sm text-slate-600">
                Join Tajii to track orders, save addresses, and checkout faster.
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
                to="/login"
                className="rounded-full bg-slate-900/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:bg-slate-900"
              >
                Sign in
              </Link>
            </div>
          </header>

          <section className="space-y-6 px-6 pb-10">
            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {inputs.map((input) => (
                  <input
                    key={input.name}
                    name={input.name}
                    type={input.type}
                    placeholder={input.label}
                    required
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                ))}
              </div>

              <select
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-inner">
                <input
                  type="checkbox"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300"
                />
                <span>
                  I accept the{" "}
                  <Link to="/terms" className="font-semibold text-slate-900 hover:underline">
                    Terms
                  </Link>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                Login
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

