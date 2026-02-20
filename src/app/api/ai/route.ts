import { NextResponse } from "next/server";
import guideline from "@/data/guideline.json" assert { type: "json" };

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

export const runtime = "edge";

type Mode = "electrical" | "training";

type Section = {
  id: string;
  title: string;
  text?: string;
  subsections?: Section[];
};

type Passage = {
  topic: string;
  content: string;
};

const passages: Passage[] = [];

function harvest(section: Section, trail: string[] = []) {
  const current = section.title || section.id;
  const label = [...trail, current].join(" › ");
  if (section.text) {
    const cleaned = section.text.replace(/\s+/g, " ").trim();
    if (cleaned) {
      passages.push({ topic: label, content: cleaned });
    }
  }
  section.subsections?.forEach((child) => harvest(child, [...trail, current]));
}

(guideline.sections as Section[]).forEach((section) => harvest(section));

const stopwords = new Set([
  "yang",
  "dan",
  "untuk",
  "dengan",
  "atau",
  "the",
  "apa",
]);

function findRelevantPassages(question: string) {
  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));

  if (tokens.length === 0) return passages.slice(0, 2);

  return passages
    .map((passage) => {
      const text = passage.content.toLowerCase();
      const score = tokens.reduce((acc, token) => acc + (text.includes(token) ? 1 : 0), 0);
      return { passage, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.passage);
}

const TRAINING_SUMMARY = `Kursus Online Elektrik (2 hari) – RM80 sahaja.
Apa yang dipelajari:
• Drawing pendawaian (layout & skematik)
• Wiring rumah (lampu, soket, kipas, asas DB)
• Maintenance & baiki kerosakan asas
Kelebihan:
• Video + nota mudah faham, boleh ulang tengok
• Sesuai zero/beginner, ikut kerja tapak, tak perlu matematik
Tarikh terkini: Siri 1 pada 27 & 28 Februari 2026 (tempat terhad)
Join WhatsApp group: https://chat.whatsapp.com/ImxI9VVOvY28I8d3ClqoDp?mode=gi_t
Hubungi/PM WhatsApp: 013-365 5715`; 

function buildTrainingEntries() {
  return [TRAINING_SUMMARY];
}

async function logToMake(payload: Record<string, unknown>) {
  if (!MAKE_WEBHOOK_URL) return;
  try {
    await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("MAKE webhook error", error);
  }
}

async function callDeepseek(prompt: string, mode: Mode, references: string[]) {
  if (!DEEPSEEK_API_KEY) return null;

  const systemPrompt =
    "Anda adalah AI Pandaielectric. Berikan jawapan tepat berdasarkan rujukan Suruhanjaya Tenaga, TNB dan data kursus. Jangan mereka fakta. Jika rujukan tidak memenuhi soalan, jawab bahawa maklumat tiada. Sentiasa ingatkan pengguna untuk guna electrician bertauliah untuk kerja fizikal.";

  const modeInstruction =
    mode === "electrical"
      ? "Fokuskan pada keselamatan pendawaian domestik, standard ST, MS IEC 60364, PPE 1994."
      : "Fokuskan pada laluan lesen PW2/PW4, program SKM dan intake yang tersedia."

  const contextBlock = references.map((item, index) => `${index + 1}. ${item}`).join("\n");

  const messages = [
    { role: "system", content: `${systemPrompt}\n${modeInstruction}` },
    {
      role: "user",
      content: `Soalan pengguna: ${prompt}\n\nRujukan rasmi:\n${contextBlock}`,
    },
  ];

  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    console.error("DeepSeek API error", await response.text());
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  return content ?? null;
}

function fallbackElectricalAnswer(refs: Passage[]) {
  if (refs.length === 0) {
    return "Maaf, tiada maklumat rasmi untuk soalan ini.";
  }

  const summary = refs
    .map((ref) => `• ${ref.topic}: ${ref.content.slice(0, 240)}${ref.content.length > 240 ? "…" : ""}`)
    .join("\n");

  return `${summary}\n\nUntuk pemeriksaan fizikal, disarankan hubungi electrician bertauliah.`;
}

function fallbackTrainingAnswer(entries: string[]) {
  if (entries.length === 0) return "Maaf, tiada maklumat kursus yang sesuai.";
  return `${entries.join("\n")}\n\nNak terus daftar intake akan datang?`;
}

export async function POST(request: Request) {
  const { question, mode } = (await request.json()) as {
    question?: string;
    mode?: Mode;
  };

  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Soalan diperlukan" }, { status: 400 });
  }

  const activeMode: Mode = mode === "training" ? "training" : "electrical";

  if (activeMode === "electrical") {
    const refs = findRelevantPassages(question);
    if (refs.length === 0) {
      const fallback = "Maaf, tiada maklumat rasmi untuk soalan ini.";
      await logToMake({
        mode: activeMode,
        question,
        answer: fallback,
        references: [],
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ answer: fallback });
    }

    const referenceTexts = refs.map((ref) => `${ref.topic}: ${ref.content}`);
    const aiAnswer = await callDeepseek(question, activeMode, referenceTexts);
    const answer = aiAnswer ?? fallbackElectricalAnswer(refs);

    await logToMake({
      mode: activeMode,
      question,
      answer,
      references: referenceTexts,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ answer });
  }

  const trainingEntries = buildTrainingEntries();
  if (trainingEntries.length === 0) {
    const fallback = "Maaf, tiada maklumat kursus yang sesuai.";
    await logToMake({
      mode: activeMode,
      question,
      answer: fallback,
      references: [],
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ answer: fallback });
  }

  const aiAnswer = await callDeepseek(question, activeMode, trainingEntries);
  const answer = aiAnswer ?? fallbackTrainingAnswer(trainingEntries);

  await logToMake({
    mode: activeMode,
    question,
    answer,
    references: trainingEntries,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({ answer });
}
