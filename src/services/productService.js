// src/services/productService.js
import { supabase } from "../supabaseClient";

// =======================
// Categories & Products
// =======================

// Fetch categories with products dynamically
export async function getCategoriesWithProductsDynamic() {
  try {
    // Fetch all categories
    const { data: categories, error: catError } = await supabase
      .from("products")
      .select("category")
      .neq("category", null)
      .order("category");

    if (catError) throw catError;

    // Get unique categories
    const uniqueCategories = [...new Set(categories.map(c => c.category))];

    // Fetch products per category
    const result = await Promise.all(
      uniqueCategories.map(async (cat) => {
        const { data: products, error: prodError } = await supabase
          .from("products")
          .select("*")
          .eq("category", cat);

        if (prodError) throw prodError;

        return { name: cat, slug: cat.toLowerCase().replace(/\s+/g, "-"), products };
      })
    );

    return result;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

// Fetch all products for a single category
export async function getProductsByCategory(categoryName, limit = 100) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", categoryName)
      .limit(limit);

    if (error) {
      console.error("Error fetching products by category:", error);
      return [];
    }
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// =======================
// Product Detail
// =======================

// Fetch single product by slug
export async function getProductBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Fetch related products (same category, exclude current product)
export async function getRelatedProducts(category, excludeId, limit = 10) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("id", excludeId)
      .limit(limit);

    if (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

// =======================
// Cart helper (frontend state)
// =======================

// Adds a product to localStorage cart
export function addToCart(product, quantity = 1) {
  try {
    const cart = JSON.parse(localStorage.getItem("tajii_cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }

    localStorage.setItem("tajii_cart", JSON.stringify(cart));

    // Trigger storage event to update Navbar across tabs/components
    window.dispatchEvent(new Event("storage"));

    return cart;
  } catch (err) {
    console.error("Error adding to cart:", err);
    return [];
  }
}

// Get current cart
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem("tajii_cart")) || [];
  } catch {
    return [];
  }
}
