import { supabase } from "../supabaseClient";

const BANNER_BUCKET = "banners";

function isAbsoluteUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function getStoragePublicUrl(path) {
  if (!path) return "";
  const { data } = supabase.storage.from(BANNER_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export function getBannerImageUrl(banner) {
  if (!banner) return "";
  const candidate = banner.image_url || banner.imageUrl || banner.image;
  if (!candidate) return "";

  if (isAbsoluteUrl(candidate)) return candidate;
  if (typeof candidate !== "string") return "";

  return getStoragePublicUrl(candidate.trim());
}

export async function getActiveBanners({ limit = 10 } = {}) {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("id,title,image_url,link,category,is_active,created_at,updated_at")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      ...row,
      imageUrl: getBannerImageUrl(row),
    }));
  } catch (err) {
    console.error("Error fetching banners:", err);
    return [];
  }
}
