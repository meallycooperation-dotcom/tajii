import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { getProductsByCategorySlug } from "../services/productService";

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryName = useMemo(() => {
    return slug ? slug.replace(/-/g, " ") : "Category";
  }, [slug]);

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
        title={`Tajii – ${categoryName}`}
        description={`Browse ${categoryName} products on Tajii.`}
        url={slug ? `https://tajii.com/category/${slug}` : "https://tajii.com"}
        image="/og-image.svg"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: categoryName,
          url: slug ? `https://tajii.com/category/${slug}` : "https://tajii.com",
        }}
      />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold">{categoryName}</h1>

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

