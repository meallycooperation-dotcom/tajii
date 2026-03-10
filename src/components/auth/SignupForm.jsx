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
      return setError("Passwords do not match");
    }
    if (!form.terms) {
      return setError("You must accept terms and conditions");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/70 to-slate-800 opacity-60 pointer-events-none" />
        <div className="relative p-10 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Create account</p>
            <h1 className="text-3xl font-semibold text-white">Sign up</h1>
            <p className="text-sm text-slate-400">
              Join Tajii to track orders, save addresses and checkout faster.
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {inputs.map((input) => (
                <input
                  key={input.name}
                  name={input.name}
                  type={input.type}
                  placeholder={input.label}
                  required
                  className="input w-full bg-slate-800 text-white border-slate-700 focus:border-sky-400 focus:ring-sky-400"
                  onChange={handleChange}
                />
              ))}
            </div>

            <select
              name="gender"
              required
              onChange={handleChange}
              className="input w-full bg-slate-800 text-white border-slate-700 focus:border-sky-400 focus:ring-sky-400"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input type="checkbox" name="terms" className="h-4 w-4 rounded border-slate-700 bg-slate-800" onChange={handleChange} />
              I accept the <Link to="/terms" className="underline text-emerald-300">Terms</Link>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-gradient-to-r from-emerald-500 to-sky-500 text-base shadow-lg shadow-emerald-500/30"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-300 hover:text-emerald-200">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
