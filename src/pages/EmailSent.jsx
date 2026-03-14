// pages/EmailSent.jsx
import { Link } from "react-router-dom";

export default function EmailSent() {
  return (
    <main className="flex flex-col items-center justify-center h-screen bg-white px-4 text-slate-900">
      <div className="max-w-md text-center p-10 rounded-3xl border border-slate-200 shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
        <p className="text-sm text-slate-600 mb-6">
          We sent you a magic login link. Please check your email inbox (and spam folder) Just tap the link to continue.
        </p>
      </div>
    </main>
  );
}