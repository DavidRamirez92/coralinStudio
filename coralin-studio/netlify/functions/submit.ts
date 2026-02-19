// netlify/functions/submit.ts
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const PayloadSchema = z.object({
  title: z.enum(["NB", "F", "M"]),
  firstName: z.string().trim().min(1),
  address: z.string().trim().min(1),
  state: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  birthDate: z.string().trim().min(1),
  postalCode: z.string().trim().min(1),
  email: z.string().trim().email(),
  medicalConditions: z.array(z.string()).optional().default([]),
  otherMedicalConditions: z.string().optional(),
  eyeConditions: z.array(z.string()).optional().default([]),
  otherEyeConditions: z.string().optional(),
  howDidYouHear: z.enum(["recomendacion", "anuncio", "redes_sociales", "google", "otro"]),
  otherHowDidYouHear: z.string().optional(),
  agreement1: z.literal(true),
  agreement2: z.literal(true),
  agreement3: z.literal(true),
  honeypot: z.string().optional(),
});

const supabase = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_ANON_KEY ?? ""
);

const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, body: "" };

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "SUPABASE_URL / SUPABASE_ANON_KEY no están configuradas" }),
      };
    }

    const raw = event.body || "{}";
    const data = JSON.parse(raw);

    // Honeypot simple
    if (typeof data.honeypot === "string" && data.honeypot.trim() !== "") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true }),
      };
    }

    const parsed = PayloadSchema.safeParse(data);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path?.[0] ? String(issue.path[0]) : "payload";
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Campo inválido: ${field}` }),
      };
    }

    const form = parsed.data;

    // "otro" en howDidYouHear (si viene texto lo anexamos)
    let howDidYouHear: string = form.howDidYouHear;
    if (howDidYouHear === "otro" && form.otherHowDidYouHear?.trim()) {
      howDidYouHear = `otro: ${form.otherHowDidYouHear.trim()}`;
    }

    const otherMedicalConditions = form.otherMedicalConditions?.trim() || null;

    const otherEyeConditions = form.otherEyeConditions?.trim() || null;

    // Payload: coincide con la tabla SQL que creaste (camelCase + receivedAt lo pone la DB)
    const payload = {
      title: form.title,
      firstName: form.firstName,
      address: form.address,
      state: form.state,
      phone: form.phone,
      birthDate: form.birthDate,
      postalCode: form.postalCode,
      email: form.email.toLowerCase(),
      medicalConditions: form.medicalConditions,
      otherMedicalConditions,
      eyeConditions: form.eyeConditions,
      otherEyeConditions,
      howDidYouHear,
      agreement1: true,
      agreement2: true,
      agreement3: true,
    };

    const { data: row, error } = await supabase
      .from("submissions")
      .insert(payload)
      .select('id, "receivedAt"')
      .single();

    if (error) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, submission: row }),
    };
  } catch (err) {
    console.error("[submit] error", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Error interno" }),
    };
  }
};

export { handler };
