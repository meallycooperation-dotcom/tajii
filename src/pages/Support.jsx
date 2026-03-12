import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, MessageCircle, Music, Phone } from "lucide-react";

const supportLinks = {
  phone: "tel:+254112224991",
  whatsapp: "https://wa.me/254112224991",
  facebook: "https://www.facebook.com/Brian Ochieng Ochibo",
  tiktok: "https://www.tiktok.com/@tajii",
  instagram: "https://www.instagram.com/tajii",
};

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Support</p>
            <h1 className="text-3xl font-bold text-slate-900">How can we help?</h1>
            <p className="mt-1 text-sm text-slate-600">
              Get help with orders, delivery, payments, or your account.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="self-start rounded-full border border-slate-200 px-4 py-2 text-sm shadow hover:border-emerald-400 transition"
          >
            Back
          </button>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Calls and message
              </p>
              <div className="mt-4 grid gap-3">
                <a
                  href={supportLinks.phone}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold text-slate-800 shadow-inner transition hover:border-slate-500"
                >
                  <span>Phone</span>
                  <Phone className="h-5 w-5 text-slate-500" />
                </a>
                <a
                  href={supportLinks.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold text-slate-800 shadow-inner transition hover:border-slate-500"
                >
                  <span>WhatsApp</span>
                  <MessageCircle className="h-5 w-5 text-slate-500" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Socials</p>
              <div className="mt-4 grid gap-3">
                <a
                  href={supportLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold text-slate-800 shadow-inner transition hover:border-slate-500"
                >
                  <span>Facebook</span>
                  <Facebook className="h-5 w-5 text-slate-500" />
                </a>
                <a
                  href={supportLinks.tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold text-slate-800 shadow-inner transition hover:border-slate-500"
                >
                  <span>TikTok</span>
                  <Music className="h-5 w-5 text-slate-500" />
                </a>
                <a
                  href={supportLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-left font-semibold text-slate-800 shadow-inner transition hover:border-slate-500"
                >
                  <span>Instagram</span>
                  <Instagram className="h-5 w-5 text-slate-500" />
                </a>
              </div>
            </div>
          </div>

          
        </section>
      </div>
    </div>
  );
}
