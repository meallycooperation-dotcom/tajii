import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { supabase } from "../supabaseClient";
import {
  getProductBySlug,
  getProductMainImageUrl,
  getRelatedProducts,
  addToCart,
} from "../services/productService";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Fetch product & related products
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

  // Fetch additional images from Supabase bucket
  useEffect(() => {
    if (!product) return undefined;

    const fetchAdditionalImages = async () => {
      if (!product.images || product.images.length === 0) return;
      const urls = [];

      for (let imgPath of product.images) {
        // If it's already a full URL (from publicUrl), just use it
        if (imgPath.startsWith("http")) {
          urls.push(imgPath);
        } else {
          // Otherwise, build public URL from Supabase bucket
          const { publicUrl } = supabase.storage
            .from("products")
            .getPublicUrl(`additional-images/${imgPath}`);
          urls.push(publicUrl);
        }
      }

      setAdditionalImages(urls);
    };

    fetchAdditionalImages();
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (!product) return <p className="p-4">Product not found.</p>;

  // Main image
  const mainImageUrl = getProductMainImageUrl(product);
  const productUrl = `https://tajii.com/product/${product.slug}`;

  return (
    <>
      <SEO
        title={`Tajii – ${product.name}`}
        description={product.description}
        url={productUrl}
        image={mainImageUrl || "/og-image.svg"}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: mainImageUrl ? [mainImageUrl] : undefined,
          sku: String(product.id ?? ""),
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "KES",
            price: String(product.price ?? ""),
          },
        }}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="flex-1">
            <img
              src={mainImageUrl || "/placeholder.png"}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-xl text-slate-700">
              Ksh {Number(product.price).toLocaleString()}
            </p>
            <p className="text-slate-600">
  {showFullDescription
    ? product.description
    : product.description.length > 200
    ? product.description.slice(0, 200) + "..."
    : product.description}
</p>

{product.description.length > 200 && (
  <button
    className="text-sm text-blue-600 hover:underline mt-1"
    onClick={() => setShowFullDescription(!showFullDescription)}
  >
    {showFullDescription ? "Show less" : "Read more"}
  </button>
)}

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

        {/* Additional Images */}
        {additionalImages.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold mb-4">More photos</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {additionalImages.map((url, i) => (
                <img
                  key={i}
                  src={url || "/placeholder.png"}
                  alt={`${product.name} additional`}
                  className="h-48 w-full rounded-lg object-cover bg-slate-100"
                />
              ))}
            </div>
          </section>
        )}

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
