import { NextResponse } from "next/server";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const Payload = z.object({
  // Información Personal
  title: z.enum(["NB", "F", "M"]),
  firstName: z.string().min(1),
  address: z.string().min(1),
  state: z.string().min(1),
  phone: z.string().min(1),
  birthDate: z.string().min(1),
  postalCode: z.string().min(1),
  email: z.string().email(),
  
  // Historial médico
  medicalConditions: z.array(z.string()).min(1),
  otherMedicalConditions: z.string().optional(),
  eyeConditions: z.array(z.string()).min(1),
  otherEyeConditions: z.string().optional(),
  
  // Sobre nosotros
  howDidYouHear: z.enum(["recomendacion", "anuncio", "redes_sociales", "google", "otro"]),
  otherHowDidYouHear: z.string().optional(),
  
  // Acuerdos
  agreement1: z.literal(true),
  agreement2: z.literal(true),
  agreement3: z.literal(true),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = Payload.parse(json);

    const record = {
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      ...data,
    };

    const dataDir = path.join(process.cwd(), "data");
    const dbFile = path.join(dataDir, "submissions.json");

    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    let arr: unknown[] = [];
    if (existsSync(dbFile)) {
      const current = await readFile(dbFile, "utf-8");
      if (current.trim().length) {
        arr = JSON.parse(current);
      }
    }

    arr.push(record);
    await writeFile(dbFile, JSON.stringify(arr, null, 2), "utf-8");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/submit error", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}