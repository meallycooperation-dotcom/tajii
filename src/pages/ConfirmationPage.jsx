import { useLocation, useNavigate } from "react-router-dom";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const deliveryInfo = location.state?.deliveryInfo || {};

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
      <p className="mb-2">Thank you for your order.</p>
      <p className="mb-4">
        Your items will be delivered to: <strong>{deliveryInfo.address || "N/A"}</strong>
      </p>

      <button
        onClick={handleGoHome}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Go to Home
      </button>
    </div>
  );
}
