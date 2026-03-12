import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AccountManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
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

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        if (!cancelled) {
          setFullName(data?.full_name || session.user.user_metadata?.full_name || "");
          setPhone(data?.phone || "");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your account.");
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSaveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSavingProfile(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      if (!session?.user) {
        navigate("/login");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: session.user.id,
          full_name: fullName?.trim() || null,
          phone: phone?.trim() || null,
          email: session.user.email || null,
        },
        { onConflict: "user_id" }
      );

      if (profileError) throw profileError;
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password updated.");
    } catch (err) {
      setError(err.message || "Unable to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Account</p>
            <h1 className="text-3xl font-bold text-slate-900">Account settings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Update your phone number and password.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm shadow hover:border-emerald-400 transition"
          >
            Back
          </button>
        </header>

        {loading && (
          <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-lg shadow-slate-200">
            <p className="text-slate-500">Loading account…</p>
          </section>
        )}

        {!loading && (
          <>
            {(error || success) && (
              <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-200">
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
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile</p>
              <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full name</label>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Phone number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 07xxxxxxxx"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {savingProfile ? "Saving…" : "Save changes"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Security</p>
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full rounded-2xl border border-slate-700/40 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-60"
                >
                  {savingPassword ? "Updating…" : "Update password"}
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
