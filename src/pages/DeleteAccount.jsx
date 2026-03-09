import { useNavigate } from "react-router-dom";

export default function DeleteAccount() {
  const navigate = useNavigate();

  const handleDelete = () => {
    alert("Delete account functionality not implemented yet!");
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-red-600">Delete Account</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Back
        </button>
      </header>

      <p>Deleting your account is permanent. Be careful!</p>
      <button
        onClick={handleDelete}
        className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Delete Account
      </button>
    </div>
  );
}
