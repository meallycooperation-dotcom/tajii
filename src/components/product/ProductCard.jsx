import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.slug}`} // navigate to product detail page
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      <img
        src={product.image_url} // adjust based on your field
        alt={product.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-2">
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="text-sm text-slate-600">Ksh {product.price}</p>
      </div>
    </Link>
  );
}
