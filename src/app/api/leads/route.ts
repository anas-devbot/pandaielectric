import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_DIR = path.join(process.cwd(), ".data");
const STORAGE_FILE = path.join(STORAGE_DIR, "leads.json");

async function appendLead(payload: Record<string, unknown>) {
  await mkdir(STORAGE_DIR, { recursive: true });
  let existing: unknown[] = [];
  try {
    const raw = await readFile(STORAGE_FILE, "utf8");
    existing = JSON.parse(raw);
  } catch (error) {
    existing = [];
  }
  existing.push(payload);
  await writeFile(STORAGE_FILE, JSON.stringify(existing, null, 2));
}

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.name || !data.whatsapp || !data.program) {
    return NextResponse.json({ error: "Maklumat wajib tidak lengkap" }, { status: 400 });
  }

  const payload = {
    name: String(data.name),
    whatsapp: String(data.whatsapp),
    program: String(data.program),
    notes: data.notes ? String(data.notes) : "",
    createdAt: new Date().toISOString(),
  };

  await appendLead(payload);

  return NextResponse.json({ success: true });
}
