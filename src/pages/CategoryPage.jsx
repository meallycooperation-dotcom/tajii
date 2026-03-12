import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { getProductsByCategorySlug } from "../services/productService";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    getProductsByCategorySlug(slug)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <SEO
        title={`Tajii – ${slug.replace(/-/g, " ")}`}
        description={`All products in ${slug.replace(/-/g, " ")}`}
        url={`https://tajii.com/category/${slug}`}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">{slug.replace(/-/g, " ")}</h1>

        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found in this category.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
