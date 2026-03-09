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

  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col min-h-screen justify-between">
      {/* Header with Home button */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.full_name || user?.email}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Home
        </button>
      </header>

      {/* Body */}
      <main className="flex-grow">
        <ul className="space-y-4">
          <li
            onClick={() => navigate("/orders")}
            className="flex justify-between items-center p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
          >
            <span>Orders</span>
            <span>{">"}</span>
          </li>
          <li
            onClick={() => navigate("/inbox")}
            className="flex justify-between items-center p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
          >
            <span>Inbox</span>
            <span>{">"}</span>
          </li>
          <li
            onClick={() => navigate("/address")}
            className="flex justify-between items-center p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
          >
            <span>Address</span>
            <span>{">"}</span>
          </li>
          <li
            onClick={() => navigate("/account-management")}
            className="flex justify-between items-center p-4 bg-gray-100 rounded cursor-pointer hover:bg-gray-200"
          >
            <span>Account Management</span>
            <span>{">"}</span>
          </li>
          <li
            onClick={() => navigate("/delete-account")}
            className="flex justify-between items-center p-4 bg-red-100 text-red-700 rounded cursor-pointer hover:bg-red-200"
          >
            <span>Delete Account</span>
            <span>{">"}</span>
          </li>
        </ul>
      </main>

      {/* Footer */}
      <footer className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </footer>
    </div>
  );
}
