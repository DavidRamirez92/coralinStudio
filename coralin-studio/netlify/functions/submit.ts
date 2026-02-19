// netlify/functions/submit.ts
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const PayloadSchema = z.object({
  title: z.enum(["NB", "F", "M"]),
  firstname: z.string().trim().min(1),
  address: z.string().trim().min(1),
  state: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  birthdate: z.string().trim().min(1),
  postalcode: z.string().trim().min(1),
  email: z.string().trim().email(),
  medicalconditions: z.array(z.string()).optional().default([]),
  othermedicalconditions: z.string().optional(),
  eyeconditions: z.array(z.string()).optional().default([]),
  othereyeconditions: z.string().optional(),
  howdidyouhear: z.enum(["recomendacion", "anuncio", "redes_sociales", "google", "otro"]),
  otherhowdidyouhear: z.string().optional(),
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

    // "otro" en howdidyouhear (si viene texto lo anexamos)
    let howdidyouhear: string = form.howdidyouhear;
    if (howdidyouhear === "otro" && form.otherhowdidyouhear?.trim()) {
      howdidyouhear = `otro: ${form.otherhowdidyouhear.trim()}`;
    }

    const othermedicalconditions = form.othermedicalconditions?.trim() || null;

    const othereyeconditions = form.othereyeconditions?.trim() || null;

    // Payload: coincide exactamente con la tabla de Supabase (columnas en minúsculas)
    const payload = {
      id: crypto.randomUUID(),
      receivedat: new Date().toISOString(),
      title: form.title,
      firstname: form.firstname,
      address: form.address,
      state: form.state,
      phone: form.phone,
      birthdate: form.birthdate,
      postalcode: form.postalcode,
      email: form.email.toLowerCase(),
      medicalconditions: form.medicalconditions,
      othermedicalconditions,
      eyeconditions: form.eyeconditions,
      othereyeconditions,
      howdidyouhear,
      agreement1: true,
      agreement2: true,
      agreement3: true,
    };

    const { error } = await supabase.from("submissions").insert(payload);

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
      body: JSON.stringify({
        ok: true,
        submission: {
          id: payload.id,
          receivedat: payload.receivedat,
        },
      }),
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
