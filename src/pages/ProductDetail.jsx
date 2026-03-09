import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { getProductBySlug, getRelatedProducts, addToCart } from "../services/productService";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      setLoading(true);
      const data = await getProductBySlug(slug);
      if (data) {
        setProduct(data);
        const relatedProducts = await getRelatedProducts(data.category, data.id);
        setRelated(relatedProducts);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4">Product not found.</p>;

  return (
    <>
      <SEO
        title={`Tajii – ${product.name}`}
        description={product.description}
        url={`https://tajii.com/product/${product.slug}`}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="flex-1">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl text-slate-700">Ksh {product.price}</p>
            <p className="text-slate-600">{product.description}</p>

            <button
              className={`bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700 mt-4 ${
                added ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={handleAddToCart}
              disabled={added}
            >
              {added ? "Added to Cart!" : "Add to Cart"}
            </button>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold mb-4">Related Products</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {related.map((p) => (
                <div key={p.id} className="flex-none w-40">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
