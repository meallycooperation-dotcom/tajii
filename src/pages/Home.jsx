import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // added for react-router links
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { getCategoriesWithProductsDynamic } from "../services/productService";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategoriesWithProductsDynamic()
      .then((data) => {
        setCategories(data);
        setFilteredCategories(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter categories/products based on search query
  const handleSearch = (query) => {
    if (!query) {
      setFilteredCategories(categories);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const filtered = categories
      .map((cat) => {
        const filteredProducts = cat.products.filter((p) =>
          p.name.toLowerCase().includes(lowerQuery)
        );
        return { ...cat, products: filteredProducts };
      })
      .filter((cat) => cat.products.length > 0); // remove categories with no matches

    setFilteredCategories(filtered);
  };

  return (
    <>
      <SEO
        title="Tajii – Buy Electronics Online"
        description="Shop electronics online at Tajii."
        url="https://tajii.com"
      />

      <Navbar onSearch={handleSearch} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Buy Electronics Online in Kenya</h1>

        {loading ? (
          <p>Loading products...</p>
        ) : filteredCategories.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.slug} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">{category.name}</h2>
                {/* Updated "See All" to use React Router Link */}
                <Link
                  to={`/category/${category.slug}`}
                  className="text-sm text-slate-600 hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="flex space-x-4 overflow-x-auto pb-2">
                {category.products.map((product) => (
                  <div key={product.id} className="flex-none w-40">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </>
  );
}
