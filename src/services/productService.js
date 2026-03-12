// src/services/productService.js
import { supabase } from "../supabaseClient";

const PRODUCT_BUCKET = "products";
const MAIN_IMAGE_FOLDER = "main-images";
const ADDITIONAL_IMAGE_FOLDER = "additional-images";

function categoryToSlug(category) {
  return String(category ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

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

    // Group DB category values by slug to handle case/whitespace inconsistencies.
    const slugToCategoryValues = new Map();
    for (const row of categories || []) {
      const value = row?.category;
      if (typeof value !== "string" || !value.trim()) continue;
      const slug = categoryToSlug(value);
      if (!slug) continue;
      if (!slugToCategoryValues.has(slug)) {
        slugToCategoryValues.set(slug, new Set());
      }
      slugToCategoryValues.get(slug).add(value);
    }

    // Fetch products per category
    const result = await Promise.all(
      [...slugToCategoryValues.entries()].map(async ([slug, categoryValues]) => {
        const values = [...categoryValues];
        const { data: products, error: prodError } = await supabase
          .from("products")
          .select("*")
          .in("category", values);

        if (prodError) throw prodError;

        const displayName =
          values.find((v) => typeof v === "string" && v.trim())?.trim() || slug;
        return { name: displayName, slug, products };
      })
    );

    return result.sort((a, b) => a.name.localeCompare(b.name));
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

// Fetch all products for a category slug (robust to case/whitespace differences)
export async function getProductsByCategorySlug(slug, limit = 100) {
  const normalizedSlug = categoryToSlug(slug);
  if (!normalizedSlug) return [];

  try {
    const { data: rows, error: catError } = await supabase
      .from("products")
      .select("category")
      .neq("category", null);

    if (catError) throw catError;

    const matchingCategories = [
      ...new Set(
        (rows || [])
          .map((r) => r.category)
          .filter((c) => typeof c === "string" && categoryToSlug(c) === normalizedSlug)
      ),
    ];

    if (matchingCategories.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .in("category", matchingCategories)
      .limit(limit);

    if (error) {
      console.error("Error fetching products by category slug:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching products by category slug:", err);
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

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function stripFilename(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const parts = value.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "";
  }
  return "";
}

function getStoragePublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export function getProductMainImageUrl(product) {
  if (!product) return "";
  const candidates = [
    product.main_image,
    product.image,
    product.image_url,
    product.image_path,
    product.slug,
    product.id,
  ];
  const candidate = candidates.find((value) => Boolean(value));
  if (!candidate) return "";

  // If the DB already stores a public URL (e.g. Supabase storage public URL),
  // use it as-is. Reconstructing a path can break images for products uploaded
  // into other folders like `public/`.
  if (isAbsoluteUrl(candidate)) {
    return candidate;
  }

  // If we stored a storage path like `public/...` or `main-images/...`, resolve it.
  if (typeof candidate === "string") {
    const trimmed = candidate.trim();
    if (
      trimmed.startsWith("public/") ||
      trimmed.startsWith(`${MAIN_IMAGE_FOLDER}/`)
    ) {
      return getStoragePublicUrl(trimmed);
    }
  }

  const fileName = stripFilename(candidate);
  if (!fileName) {
    return "";
  }

  return getStoragePublicUrl(`${MAIN_IMAGE_FOLDER}/${fileName}`);
}

export async function getAdditionalProductImages(product) {
  if (!product) return [];
  const folderKey = product.slug || product.id;
  if (!folderKey) return [];
  const folderPath = `${ADDITIONAL_IMAGE_FOLDER}/${folderKey}`;

  const { data, error } = await supabase.storage.from(PRODUCT_BUCKET).list(folderPath, {
    limit: 50,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) {
    console.error("Error fetching additional images:", error);
    return [];
  }

  return data
    .map((file) => getStoragePublicUrl(`${folderPath}/${file.name}`))
    .filter(Boolean);
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
