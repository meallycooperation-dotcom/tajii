import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

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
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
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

      // Create auth user
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;

      const user = data.user;
      if (!user) throw new Error("User creation failed");

      // Insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
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
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Create Account</h1>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="full_name" placeholder="Full Name" required onChange={handleChange} className="input" />
        <input name="phone" placeholder="Phone Number" required onChange={handleChange} className="input" />

        <select name="gender" required onChange={handleChange} className="input">
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>

        <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="input" />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="input" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required onChange={handleChange} className="input" />

        <label className="flex gap-2 text-sm">
          <input type="checkbox" name="terms" onChange={handleChange} />
          I accept <Link to="/terms" className="underline">Terms & Conditions</Link>
        </label>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-sm mt-4">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}
