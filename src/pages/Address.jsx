import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Address() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locations, setLocations] = useState([]);
  const [profileId, setProfileId] = useState(null);

  const [form, setForm] = useState({
    label: "Home",
    address: "",
    region: "Nairobi",
    cityId: "",
    isDefault: true,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;
        if (!session?.user) {
          navigate("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) throw profileError;

        const { data, error: locationsError } = await supabase
          .from("delivery_locations")
          .select("*")
          .order("name", { ascending: true });

        if (locationsError) throw locationsError;

        const { data: savedRows, error: savedError } = await supabase
          .from("saved_locations")
          .select("label, address, city, is_default, updated_at")
          .eq("user_id", profile.id)
          .order("is_default", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(1);

        if (savedError) throw savedError;

        const saved = savedRows?.[0] || null;

        if (!cancelled) {
          setLocations(Array.isArray(data) ? data : []);
          setProfileId(profile.id);

          const defaultCityId = data?.length ? String(data[0].id) : "";
          const savedMatch = saved?.city
            ? data?.find((loc) => String(loc.name) === String(saved.city))
            : null;
          setForm((prev) => ({
            ...prev,
            label: saved?.label || prev.label || "Home",
            address: saved?.address || "",
            region: "Nairobi",
            cityId: savedMatch?.id ? String(savedMatch.id) : defaultCityId,
            isDefault: saved?.is_default ?? true,
          }));

          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load delivery locations.");
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.address || !form.cityId) {
      setError("Please enter your address and select a delivery area.");
      return;
    }

    const selectedLocation = locations.find((loc) => String(loc.id) === String(form.cityId));
    if (!selectedLocation) {
      setError("Please select a delivery area.");
      return;
    }
    if (!profileId) {
      setError("Unable to identify your profile.");
      return;
    }

    try {
      setSaving(true);
      const now = new Date().toISOString();
      const label = form.label?.trim() || "Home";

      if (form.isDefault) {
        const { error: clearDefaultError } = await supabase
          .from("saved_locations")
          .update({ is_default: false, updated_at: now })
          .eq("user_id", profileId)
          .eq("is_default", true);

        if (clearDefaultError) throw clearDefaultError;
      }

      const { data: existing, error: existingError } = await supabase
        .from("saved_locations")
        .select("id")
        .eq("user_id", profileId)
        .eq("label", label)
        .limit(1);

      if (existingError) throw existingError;

      const payload = {
        user_id: profileId,
        label,
        address: form.address,
        city: selectedLocation.name || "",
        latitude: null,
        longitude: null,
        is_default: Boolean(form.isDefault),
        updated_at: now,
      };

      if (existing?.length) {
        const { error: updateError } = await supabase
          .from("saved_locations")
          .update(payload)
          .eq("id", existing[0].id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("saved_locations").insert(payload);
        if (insertError) throw insertError;
      }

      setSuccess("Delivery address saved.");
    } catch (err) {
      setError(err.message || "Unable to save address.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Address</p>
            <h1 className="text-3xl font-bold text-slate-900">Delivery address</h1>
            <p className="mt-1 text-sm text-slate-600">
              Choose your delivery area using the same locations from checkout.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm shadow hover:border-emerald-400 transition"
          >
            Back
          </button>
        </header>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-lg shadow-slate-200">
            <p className="text-slate-500">Loading locations…</p>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200">
            {(error || success) && (
              <div className="mb-4 space-y-3">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Label</label>
                <select
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Office">Office</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Delivery Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your full address"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Region</label>
                  <input
                    name="region"
                    value={form.region}
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Select Delivery Area *
                  </label>
                  <select
                    name="cityId"
                    value={form.cityId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                  >
                    <option value="" disabled>
                      Please select your delivery area
                    </option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} (Ksh {loc.price})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-inner">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Set as default location
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save address"}
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}
