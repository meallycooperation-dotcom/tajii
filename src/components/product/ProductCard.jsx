import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  // Determine image URL: use image_url if present, otherwise build from Supabase bucket
  const imageSrc = product.image_url
    ? product.image_url
    : product.images && product.images.length > 0
    ? product.images[0] // fallback to first additional image
    : ""; // placeholder if no image

  return (
    <Link
      to={`/product/${product.slug}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white"
    >
      <img
        src={imageSrc || "/placeholder.png"} // fallback placeholder
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-2">
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-sm text-slate-600">
          Ksh {Number(product.price).toLocaleString()}
        </p>
      </div>
    </Link>
  );
}
