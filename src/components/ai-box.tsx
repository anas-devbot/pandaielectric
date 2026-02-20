"use client";

import { useState } from "react";
import { ModeSelector, type Mode } from "@/components/mode-selector";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MAX_VISIBLE = 4;

export function AIBox() {
  const [mode, setMode] = useState<Mode>("electrical");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim() || pending) return;

    const content = question.trim();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    setQuestion("");
    setPending(true);
    setError(null);

    setMessages((prev) => [...prev, userMessage].slice(-MAX_VISIBLE));

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: content, mode }),
      });

      if (!response.ok) throw new Error("AI unavailable");

      const data = (await response.json()) as { answer: string };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage].slice(-MAX_VISIBLE));
    } catch (err) {
      console.error(err);
      setError("Maaf, AI tidak dapat dihubungi sekarang.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-[32px] border border-black/10 bg-white p-8 shadow-xl shadow-black/5">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-slate-400">AI Pandaielectric</p>
        <h2 className="text-3xl font-semibold">Tanya Soalan Elektrik Sekarang</h2>
      </div>

      <div className="mt-8">
        <ModeSelector value={mode} onChange={setMode} />
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={
            mode === "electrical"
              ? "Contoh: Kenapa MCB sering trip bila pasang water heater?"
              : "Contoh: Berapa lama tempoh latihan PW2?"
          }
          rows={4}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black placeholder:text-slate-500 focus:border-black focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl bg-black py-3 text-center text-base font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed"
        >
          {pending ? "Sedang Rujuk..." : "Tanya"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <div className="mt-6 space-y-3 rounded-2xl border border-black/5 bg-slate-50 p-4 text-sm text-slate-800">
        {messages.length === 0 && (
          <p className="text-slate-400">Jawapan akan muncul di sini.</p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-1 rounded-xl bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {message.role === "user" ? "Bos" : "AI"}
            </p>
            <p className="whitespace-pre-line text-base leading-relaxed text-slate-900">
              {message.content}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Jawapan adalah panduan umum berdasarkan rujukan Suruhanjaya Tenaga & buku teknikal.
        Pemeriksaan fizikal masih diperlukan untuk keselamatan.
      </p>
    </div>
  );
}
