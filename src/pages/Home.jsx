import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";
import Navbar from "../components/common/Navbar";
import ProductCard from "../components/product/ProductCard";
import { getActiveBanners } from "../services/bannerService";
import { getCategoriesWithProductsDynamic } from "../services/productService";

function normalizeBannerLink(rawLink) {
  const link = typeof rawLink === "string" ? rawLink.trim() : "";
  if (!link) return { kind: "none" };

  if (/^category:/i.test(link)) {
    const slug = link.slice("category:".length).trim();
    if (!slug) return { kind: "none" };
    return { kind: "internal", to: `/category/${slug}` };
  }

  if (/^product:/i.test(link)) {
    const slug = link.slice("product:".length).trim();
    if (!slug) return { kind: "none" };
    return { kind: "internal", to: `/product/${slug}` };
  }

  if (/^(https?:)?\/\//i.test(link)) {
    const href = link.startsWith("//") ? `https:${link}` : link;
    return { kind: "external", href };
  }

  // If the first path segment looks like a domain (e.g. `tajii.com/...`),
  // treat it as an external URL.
  const firstSegment = link.split("/")[0];
  if (firstSegment && firstSegment.includes(".")) {
    return { kind: "external", href: `https://${link}` };
  }

  if (/^www\./i.test(link)) {
    return { kind: "external", href: `https://${link}` };
  }

  if (/^(mailto:|tel:|sms:)/i.test(link)) {
    return { kind: "external", href: link, target: undefined };
  }

  if (link.includes("?")) {
    const [rawPath, rawQuery] = link.split("?", 2);
    const path = rawPath?.trim() || "";
    const query = rawQuery?.trim() || "";
    const params = new URLSearchParams(query);
    const slug = params.get("slug")?.trim();

    if (slug) {
      if (/^\/?category$/i.test(path)) {
        return { kind: "internal", to: `/category/${slug}` };
      }
      if (/^\/?product$/i.test(path)) {
        return { kind: "internal", to: `/product/${slug}` };
      }
    }
  }

  if (/^\/.*/.test(link)) {
    return { kind: "internal", to: link };
  }

  return { kind: "internal", to: `/${link}` };
}

function categoryToSlug(category) {
  return String(category ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const bannerScrollerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadHome() {
      setLoading(true);
      setLoadingBanners(true);

      const [bannerRows, categoryRows] = await Promise.all([
        getActiveBanners({ limit: 10 }),
        getCategoriesWithProductsDynamic(),
      ]);

      if (cancelled) return;

      setBanners(bannerRows);
      setCategories(categoryRows);
      setFilteredCategories(categoryRows);
      setLoading(false);
      setLoadingBanners(false);
    }

    loadHome();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const scroller = bannerScrollerRef.current;
    if (!scroller) return;
    if (!Array.isArray(banners) || banners.length <= 1) return;

    const reduceMotionQuery =
      typeof window !== "undefined"
        ? window.matchMedia?.("(prefers-reduced-motion: reduce)")
        : null;
    if (reduceMotionQuery?.matches) return;

    const smallScreenQuery =
      typeof window !== "undefined" ? window.matchMedia?.("(max-width: 640px)") : null;
    if (!smallScreenQuery?.matches) return;

    let rafId = null;
    let lastTime = null;
    let paused = false;
    const speedPxPerSecond = 28;

    const tick = (now) => {
      if (paused) {
        lastTime = now;
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      if (lastTime == null) lastTime = now;
      const deltaMs = now - lastTime;
      lastTime = now;

      const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
      if (maxScrollLeft > 0) {
        scroller.scrollLeft += (speedPxPerSecond * deltaMs) / 1000;
        if (scroller.scrollLeft >= maxScrollLeft - 1) {
          scroller.scrollLeft = 0;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const onPointerEnter = () => {
      paused = true;
    };
    const onPointerLeave = () => {
      paused = false;
      lastTime = null;
    };
    const onPointerDown = () => {
      paused = true;
    };
    const onPointerUp = () => {
      paused = false;
      lastTime = null;
    };

    scroller.addEventListener("mouseenter", onPointerEnter);
    scroller.addEventListener("mouseleave", onPointerLeave);
    scroller.addEventListener("pointerdown", onPointerDown, { passive: true });
    scroller.addEventListener("pointerup", onPointerUp, { passive: true });
    scroller.addEventListener("touchstart", onPointerDown, { passive: true });
    scroller.addEventListener("touchend", onPointerUp, { passive: true });

    rafId = window.requestAnimationFrame(tick);

    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      scroller.removeEventListener("mouseenter", onPointerEnter);
      scroller.removeEventListener("mouseleave", onPointerLeave);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("touchstart", onPointerDown);
      scroller.removeEventListener("touchend", onPointerUp);
    };
  }, [banners]);

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
      .filter((cat) => cat.products.length > 0);

    setFilteredCategories(filtered);
  };

  return (
    <>
      <SEO
        title="Tajii – Buy Electronics Online"
        description="Shop electronics online at Tajii."
        url="https://tajii.com"
        image="/og-image.svg"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Tajii",
            url: "https://tajii.com",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Tajii",
            url: "https://tajii.com",
          },
        ]}
      />

      <Navbar onSearch={handleSearch} />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="sr-only">Buy Electronics Online in Kenya</h1>

        {loadingBanners ? (
          <div className="mb-8 h-40 w-full animate-pulse rounded-3xl bg-slate-100" />
        ) : banners.length > 0 ? (
          <section className="mb-8" aria-label="Promotions">
            <div
              ref={bannerScrollerRef}
              className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {banners.map((banner) => {
                const card = (
                  <div className="relative h-40 w-[min(520px,85vw)] flex-none overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || "Promotion"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 text-center text-sm font-semibold text-slate-700">
                        {banner.title || "Promotion"}
                      </div>
                    )}

                    {banner.title ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                        <p className="text-sm font-semibold text-white">{banner.title}</p>
                      </div>
                    ) : null}
                  </div>
                );

                const nav =
                  banner.link && String(banner.link).trim()
                    ? normalizeBannerLink(banner.link)
                    : banner.category
                    ? { kind: "internal", to: `/category/${categoryToSlug(banner.category)}` }
                    : { kind: "none" };

                if (nav.kind === "none") {
                  return <div key={banner.id}>{card}</div>;
                }

                if (nav.kind === "external") {
                  return (
                    <a
                      key={banner.id}
                      href={nav.href}
                      target={nav.target ?? "_blank"}
                      rel="noreferrer"
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                      aria-label={banner.title ? `Open: ${banner.title}` : "Open promotion"}
                    >
                      {card}
                    </a>
                  );
                }

                return (
                  <Link
                    key={banner.id}
                    to={nav.to}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    aria-label={banner.title ? `Open: ${banner.title}` : "Open promotion"}
                  >
                    {card}
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {loading ? (
          <p>Loading products...</p>
        ) : filteredCategories.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.slug} className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-lg font-bold">{category.name}</h2>
                <Link
                  to={`/category/${category.slug}`}
                  className="text-sm text-slate-600 hover:underline"
                >
                  See All
                </Link>
              </div>

              <div className="flex space-x-4 overflow-x-auto pb-2">
                {category.products.map((product) => (
                  <div key={product.id} className="w-40 flex-none">
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
