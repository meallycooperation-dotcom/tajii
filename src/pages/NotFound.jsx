import { Link } from "react-router-dom";
import SEO from "../components/common/SEO";

export default function NotFound() {
  return (
    <>
      <SEO
        title="Tajii – Page Not Found"
        description="The page you are looking for does not exist."
        robots="noindex, nofollow"
        image="/og-image.svg"
      />

      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold">404</h1>
        <p>Page not found.</p>
        <Link to="/" className="text-blue-600 underline">
          Go Home
        </Link>
      </main>
    </>
  );
}
