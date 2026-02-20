"use client";

import { FormEvent, useState } from "react";

const programOptions = [
  "PW2 Fast Track",
  "PW4 Upgrade",
  "SKM Tahap 1-3",
  "Renewal CPD",
];

type FormState = "idle" | "submitting" | "success" | "error";

export function LeadForm() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    setState("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Lead API unavailable");

      setState("success");
      setMessage("Terima kasih! Konsultan kami akan hubungi Bos dalam masa terdekat.");
      event.currentTarget.reset();
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("Maaf, borang tak dapat dihantar. Cuba lagi atau WhatsApp kami terus.");
    } finally {
      setTimeout(() => setState("idle"), 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-200">
          Nama Penuh
          <input
            name="name"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-lime-300 focus:outline-none"
            placeholder="Ali Roslan"
          />
        </label>
        <label className="text-sm font-medium text-slate-200">
          No. WhatsApp
          <input
            name="whatsapp"
            type="tel"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-lime-300 focus:outline-none"
            placeholder="0123456789"
          />
        </label>
      </div>
      <label className="text-sm font-medium text-slate-200">
        Program Diminati
        <select
          name="program"
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-lime-300 focus:outline-none"
        >
          <option value="">Pilih program</option>
          {programOptions.map((option) => (
            <option key={option} value={option} className="bg-slate-900 text-white">
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-slate-200">
        Nota Tambahan
        <textarea
          name="notes"
          rows={3}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-lime-300 focus:outline-none"
          placeholder="Contoh: ada pengalaman wireman, nak intake bulan April"
        />
      </label>
      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-2xl bg-lime-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 transition hover:bg-lime-200 disabled:cursor-not-allowed"
      >
        {state === "submitting" ? "Menghantar..." : "Daftar Intake Sekarang"}
      </button>
      {message && (
        <p className={`text-sm ${state === "error" ? "text-red-400" : "text-lime-300"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
