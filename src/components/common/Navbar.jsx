import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, ShoppingCart, User, Search, X } from "lucide-react";
import { getCart } from "../../services/productService";

export default function Navbar({ onSearch }) {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  };

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalQty);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <header className="bg-white border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-slate-900">
            Tajii
          </Link>

          {/* Mobile Search Toggle */}
          <button
            className="sm:hidden p-1 rounded hover:bg-slate-100"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
        </div>

        {/* Desktop Search */}
        <form role="search" className="hidden sm:flex flex-1 mx-4 max-w-md">
          <input
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={query}
            onChange={handleChange}
            className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </form>

        {/* Cart & Account */}
        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Home" className="p-1 rounded hover:bg-slate-100">
            <Home className="h-5 w-5" />
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative p-1 rounded hover:bg-slate-100">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/account" aria-label="Account" className="p-1 rounded hover:bg-slate-100">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <form role="search">
            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={query}
              onChange={handleChange}
              className="w-full rounded-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </form>
        </div>
      )}
    </header>
  );
}
