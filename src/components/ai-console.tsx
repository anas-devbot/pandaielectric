"use client";

import { useMemo, useState } from "react";

type Mode = "service" | "training";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  references?: { title: string; snippet: string }[];
};

const MODES: Record<Mode, { label: string; description: string; cta: string }> = {
  service: {
    label: "🔧 Masalah Elektrikal",
    description:
      "Panduan keselamatan + cadangan pemeriksaan di tapak oleh electrician bertauliah.",
    cta: "Disarankan pemeriksaan oleh electrician bertauliah.",
  },
  training: {
    label: "🎓 Soalan Training",
    description:
      "Terangkan laluan lesen, beza kursus, dan bantu pilih intake yang tepat.",
    cta: "Mahu saya bantu pilih program sesuai?",
  },
};

const MAX_QUESTIONS = 3;

export function AiConsole() {
  const [mode, setMode] = useState<Mode>("service");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "Hai! Tanya apa-apa berkaitan pendawaian domestik mengikut panduan Suruhanjaya Tenaga. Maksimum 3 soalan per sesi.",
    },
  ]);
  const [input, setInput] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAsk = questionCount < MAX_QUESTIONS && !pending;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || !canAsk) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage.content,
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error("AI endpoint unavailable");
      }

      const data = (await response.json()) as {
        answer: string;
        references?: { title: string; snippet: string }[];
      };

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${data.answer}\n\n${MODES[mode].cta}`,
          references: data.references,
        },
      ]);
      setQuestionCount((count) => count + 1);
    } catch (err) {
      console.error(err);
      setError("Maaf, AI tak dapat dihubungi buat masa ini.");
    } finally {
      setPending(false);
    }
  };

  const progressLabel = useMemo(() => {
    if (questionCount >= MAX_QUESTIONS) return "Kuota sesi penuh";
    return `${MAX_QUESTIONS - questionCount} soalan lagi`;
  }, [questionCount]);

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        {(Object.keys(MODES) as Mode[]).map((item) => (
          <button
            key={item}
            onClick={() => {
              setMode(item);
              setError(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              mode === item
                ? "bg-lime-300 text-slate-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {MODES[item].label}
          </button>
        ))}
        <span className="text-sm text-slate-300">{MODES[mode].description}</span>
      </div>

      <div className="rounded-2xl border border-white/5 bg-black/40 p-4 text-sm text-slate-200">
        <div className="max-h-72 space-y-4 overflow-y-auto pr-2">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={`text-xs font-semibold uppercase tracking-wide ${
                  message.role === "user" ? "text-lime-300" : "text-sky-300"
                }`}
              >
                {message.role === "user" ? "Bos" : "AI Pandai"}
              </div>
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-100">
                {message.content}
              </p>
              {message.references && message.references.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/5 p-2">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Rujukan ST</p>
                  <ul className="list-disc space-y-1 pl-4 text-sm">
                    {message.references.map((ref) => (
                      <li key={`${message.id}-${ref.title}`}>
                        <span className="font-medium text-white">{ref.title}: </span>
                        <span className="text-slate-200">{ref.snippet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>{progressLabel}</span>
          <span>Maksimum 3 soalan / sesi</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Contoh: Perlu MCCB berapa ampere untuk rumah 3 fasa?"
            disabled={!canAsk}
            className="flex-1 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-lime-300 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!canAsk || input.trim().length === 0}
            className="rounded-2xl bg-lime-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            {pending ? "Sebentar" : "Hantar"}
          </button>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-3 text-xs text-slate-200">
        Jawapan AI bersifat panduan umum berdasarkan Garis Panduan Pendawaian Elektrik
        Pepasangan Domestik (Suruhanjaya Tenaga). Tiada arahan DIY tanpa lesen.
      </div>
    </div>
  );
}
