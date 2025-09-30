import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureSchema, getPool } from "@/lib/pg";

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

    // Inicializa esquema en Postgres (si no existe)
    await ensureSchema();

    const pool = getPool();
    await pool.query(
      `INSERT INTO submissions (
        id, receivedAt, title, firstName, address, state, phone, birthDate,
        postalCode, email, medicalConditions, otherMedicalConditions, eyeConditions,
        otherEyeConditions, howDidYouHear, agreement1, agreement2, agreement3
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13,
        $14, $15, $16, $17
      )`,
      [
        record.id,
        record.receivedAt,
        record.title,
        record.firstName,
        record.address,
        record.state,
        record.phone,
        record.birthDate,
        record.postalCode,
        record.email,
        JSON.stringify(record.medicalConditions),
        record.otherMedicalConditions ?? null,
        JSON.stringify(record.eyeConditions),
        record.otherEyeConditions ?? null,
        record.howDidYouHear,
        record.agreement1,
        record.agreement2,
        record.agreement3,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/submit error", err);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}