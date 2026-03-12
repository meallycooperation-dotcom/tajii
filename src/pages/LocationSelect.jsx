import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // make sure this points to your Supabase client

export default function LocationSelect() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: "",
    additionalInfo: "",
    region: "Nairobi",
    city: "",
    deliveryType: "delivery",
  });

  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  // Fetch delivery locations from Supabase on mount
  useEffect(() => {
    const fetchLocations = async () => {
      let saved = null;
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", session.user.id)
            .single();

          if (profile?.id) {
            const { data: savedRows } = await supabase
              .from("saved_locations")
              .select("address, city, updated_at")
              .eq("user_id", profile.id)
              .eq("is_default", true)
              .order("updated_at", { ascending: false })
              .limit(1);

            saved = savedRows?.[0] || null;
          }
        }
      } catch (err) {
        console.error("Error loading saved location:", err);
      }

      const { data, error } = await supabase
        .from("delivery_locations") // your table name
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching locations:", error.message);
      } else {
        setLocations(data);
        setForm((prev) => {
          const defaultCityId = data?.length ? String(data[0].id) : "";
          const savedMatch = saved?.city
            ? data?.find((loc) => String(loc.name) === String(saved.city))
            : null;
          return {
            ...prev,
            address: saved?.address || prev.address,
            region: prev.region,
            city: savedMatch?.id ? String(savedMatch.id) : prev.city || defaultCityId,
          };
        });
      }
    };

    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "deliveryType" && value === "pickup") {
      setForm((prev) => ({
        ...prev,
        address: "Raina Apartment",
        additionalInfo: "Ngina Road Kawangware",
        city: "",
      }));
    } else if (name === "deliveryType" && value === "delivery") {
      setForm((prev) => ({
        ...prev,
        address: "",
        additionalInfo: "",
        city: locations.length ? locations[0].id : "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.deliveryType === "delivery") {
      if (!form.address || !form.city) {
        setError("Please fill in your address and select a delivery location.");
        return;
      }
    } else if (form.deliveryType === "pickup") {
      if (!form.address) {
        setError("Please select a pickup option.");
        return;
      }
    }

    setError("");
    const selectedLocation =
      form.deliveryType === "delivery"
        ? locations.find((loc) => String(loc.id) === String(form.city))
        : null;

    navigate("/payment", {
      state: {
        ...form,
        cityId: selectedLocation?.id || null,
        city: selectedLocation?.name || (form.deliveryType === "pickup" ? "Pickup Station" : ""),
        deliveryPrice:
          form.deliveryType === "delivery" ? Number(selectedLocation?.price || 0) : 0,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white px-4 py-12 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">
            Delivery details
          </p>
          <h1 className="mt-2 text-3xl font-bold">Choose how to receive your order</h1>
          <p className="mt-1 text-sm text-slate-500">
            Wherever you need it, we’ve got you covered.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-2xl shadow-slate-200/50">
          <button
            onClick={() => navigate("/cart")}
            className="mb-4 text-blue-600 font-medium hover:underline"
          >
            &larr; Back to cart
          </button>

          {error && (
            <p className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryType"
                  value="pickup"
                  checked={form.deliveryType === "pickup"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium">Pickup Station</span>
              </label>

              {form.deliveryType === "pickup" && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-bold text-lg text-blue-800 mb-2">
                    Raina Apartment Pickup Station
                  </h3>
                  <p className="text-blue-700 mb-1">
                    <span className="font-medium">Address:</span> Ngina Road Kawangware
                  </p>
                  <p className="text-blue-700">
                    <span className="font-medium">Hours:</span> Mon-Sun, 8:00 AM - 8:00 PM
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Your order will be ready for pickup within 2 hours after confirmation.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="deliveryType"
                  value="delivery"
                  checked={form.deliveryType === "delivery"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="font-medium">Delivery to Address</span>
              </label>

              {form.deliveryType === "delivery" && (
                <>
                  <div className="space-y-2">
                    <label className="block font-medium">Delivery Address *</label>
                    <input
                      name="address"
                      type="text"
                      placeholder="Enter your full address"
                      value={form.address}
                      onChange={handleChange}
                      className="input w-full"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">
                      Additional Information (optional)
                    </label>
                    <input
                      name="additionalInfo"
                      type="text"
                      placeholder="Apartment number, floor, landmark, etc."
                      value={form.additionalInfo}
                      onChange={handleChange}
                      className="input w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Region</label>
                    <input
                      name="region"
                      type="text"
                      value={form.region}
                      readOnly
                      className="input w-full bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-medium">Select Delivery Area *</label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="input w-full"
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
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-slate-900"
            >
              Continue to Payment
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

