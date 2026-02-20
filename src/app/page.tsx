import Image from "next/image";
import { AIBox } from "@/components/ai-box";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-12 text-center">
        <Image
          src="/pandaielectric-logo-light.jpg"
          alt="Logo Pandaielectric"
          width={140}
          height={140}
          priority
        />
        <h1 className="text-4xl font-semibold text-black">Pandaielectric</h1>
        <p className="max-w-2xl text-base text-slate-500">
          Rujukan Elektrik & Latihan Selaras Garis Panduan Suruhanjaya Tenaga
        </p>
      </div>

      <div className="flex justify-center px-4 pb-8">
        <AIBox />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-6">
        <Image
          src="/course-promo.jpg"
          alt="Poster Kursus Elektrik"
          width={1143}
          height={768}
          className="w-full rounded-3xl border border-black/10 shadow-lg"
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-8">
        <div className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
            Pandai Electric Services
          </p>
          <h3 className="mt-2 text-xl font-semibold text-black">
            Kontraktor Penyelenggaraan & Pendawaian Elektrik
          </h3>
          <p className="mt-1 text-sm text-slate-500">Berdaftar ST • CIDB • TNB</p>

          <div className="mt-4 grid gap-4 text-left text-sm text-slate-600 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-black">Servis Kami</p>
              <ul className="mt-2 space-y-1">
                <li>✔ Breakdown elektrik</li>
                <li>✔ Permohonan bekalan TNB</li>
                <li>✔ Pendawaian & penyelenggaraan elektrik</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-black">Kenapa Pilih Kami</p>
              <ul className="mt-2 space-y-1">
                <li>✔ Kontraktor berdaftar</li>
                <li>✔ Kerja ikut piawaian keselamatan</li>
                <li>✔ Servis pantas & dipercayai</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">Nilai & kawasan sekitar</p>
          <p className="mt-1 text-base font-semibold text-black">👉 WhatsApp Sekarang</p>
        </div>
      </div>

      <div className="mx-auto mt-4 flex max-w-3xl flex-col gap-4 px-4 pb-8 text-center sm:flex-row">
        <a
          href="https://wa.me/60133655715"
          className="flex-1 rounded-2xl bg-lime-400 px-6 py-4 text-base font-semibold text-black shadow-lg shadow-lime-200 transition hover:bg-lime-300"
        >
          🟢 WhatsApp
        </a>
        <a
          href="mailto:ahz.teknikent@gmail.com"
          className="flex-1 rounded-2xl bg-sky-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:bg-sky-400"
        >
          ✉️ Email
        </a>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-12 text-center sm:flex-row sm:items-center sm:justify-center">
        <a
          href="https://forms.gle/wvNnYVs9eGgV3DNcA"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-black px-6 py-3 text-base font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-black/90"
        >
          🔵 Daftar Kursus
        </a>
        <a
          href="https://www.tiktok.com/@saifulhyq"
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-black/5"
        >
          ▶️ Follow TikTok Kami
        </a>
      </div>

      <p className="pb-10 text-center text-xs text-slate-500">
        Jawapan AI adalah panduan umum berdasarkan bahan Suruhanjaya Tenaga. Pemeriksaan fizikal
        diperlukan sebelum kerja elektrik dijalankan.
      </p>
    </div>
  );
}
