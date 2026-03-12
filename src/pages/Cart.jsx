import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getCart, getProductMainImageUrl } from "../services/productService";

export default function Cart() {
  const [cartItems, setCartItems] = useState(() => getCart());
  const navigate = useNavigate();

  const updateQuantity = (productId, qty) => {
    if (qty < 1) return;
    const updatedCart = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: qty } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("tajii_cart", JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("tajii_cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p>
            Your cart is empty. <Link to="/">Shop now</Link>.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-4"
                >
                  <img
                    src={getProductMainImageUrl(item) || item.image_url || ""}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p>Ksh {item.price}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-4 text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="font-semibold">
                    Ksh {item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Total & Checkout */}
            <div className="mt-6 flex justify-between items-center">
              <p className="text-xl font-bold">Total: Ksh {totalPrice}</p>
              <button
                onClick={() => navigate("/checkout")}
                className="bg-slate-900 text-white px-6 py-3 rounded hover:bg-slate-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
