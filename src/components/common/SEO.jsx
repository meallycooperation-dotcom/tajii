import { useEffect } from "react";

function upsertMetaTag({ name, property, content }) {
  if (content == null) return;
  const selector = name
    ? `meta[name="${name}"]`
    : property
    ? `meta[property="${property}"]`
    : "";
  if (!selector) return;

  let meta = document.querySelector(selector);
  if (!meta) {
    meta = document.createElement("meta");
    if (name) meta.setAttribute("name", name);
    if (property) meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", String(content));
}

function upsertLinkTag({ rel, href }) {
  if (!rel || !href) return;

  const existing = document.querySelector(`link[rel="${rel}"]`);
  if (existing) {
    existing.setAttribute("href", href);
    return;
  }

  const link = document.createElement("link");
  link.setAttribute("rel", rel);
  link.setAttribute("href", href);
  document.head.appendChild(link);
}

function toAbsoluteUrl(value) {
  if (!value) return "";
  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return String(value);
  }
}

export default function SEO({
  title,
  description,
  url,
  image,
  type = "website",
  robots = "index, follow",
  canonical,
  siteName = "Tajii",
  twitterCard = "summary_large_image",
  jsonLd,
}) {
  useEffect(() => {
    const resolvedTitle = title || siteName;
    const resolvedDescription = description || "";
    const resolvedUrl =
      url ||
      (typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}${window.location.search}`
        : "");
    const resolvedCanonical = canonical || resolvedUrl;
    const resolvedImage = image ? toAbsoluteUrl(image) : "";

    document.title = resolvedTitle;

    upsertMetaTag({
      name: "description",
      content: resolvedDescription,
    });
    upsertMetaTag({
      name: "robots",
      content: robots,
    });

    upsertLinkTag({ rel: "canonical", href: resolvedCanonical });

    upsertMetaTag({
      property: "og:type",
      content: type,
    });
    upsertMetaTag({
      property: "og:site_name",
      content: siteName,
    });
    upsertMetaTag({
      property: "og:title",
      content: resolvedTitle,
    });
    upsertMetaTag({
      property: "og:description",
      content: resolvedDescription,
    });
    upsertMetaTag({
      property: "og:url",
      content: resolvedUrl,
    });
    if (resolvedImage) {
      upsertMetaTag({
        property: "og:image",
        content: resolvedImage,
      });
    }

    upsertMetaTag({
      name: "twitter:card",
      content: twitterCard,
    });
    upsertMetaTag({
      name: "twitter:title",
      content: resolvedTitle,
    });
    upsertMetaTag({
      name: "twitter:description",
      content: resolvedDescription,
    });
    if (resolvedImage) {
      upsertMetaTag({
        name: "twitter:image",
        content: resolvedImage,
      });
    }

    const existingJsonLd = document.getElementById("seo-jsonld");
    if (jsonLd) {
      const script = existingJsonLd || document.createElement("script");
      script.id = "seo-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      if (!existingJsonLd) document.head.appendChild(script);
    } else if (existingJsonLd) {
      existingJsonLd.remove();
    }
  }, [
    title,
    description,
    url,
    image,
    type,
    robots,
    canonical,
    siteName,
    twitterCard,
    jsonLd,
  ]);

  return null;
}
