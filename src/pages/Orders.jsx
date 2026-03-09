import { useNavigate } from "react-router-dom";

export default function Orders() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Back
        </button>
      </header>

      <p>Here you can see all your orders.</p>
    </div>
  );
}
