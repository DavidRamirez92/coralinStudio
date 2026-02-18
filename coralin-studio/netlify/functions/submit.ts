// netlify/functions/submit.ts
import type { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

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

    // Requeridos de texto
    const reqStr = (v: unknown) => typeof v === "string" && v.trim().length > 0;
    const required = [
      "title",
      "firstName",
      "address",
      "state",
      "phone",
      "birthDate",
      "postalCode",
      "email",
      "howDidYouHear",
    ];
    for (const f of required) {
      if (!reqStr(data[f])) {
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: `Campo inválido: ${f}` }),
        };
      }
    }

    // Booleans requeridos (deben ser true)
    if (data.agreement1 !== true || data.agreement2 !== true || data.agreement3 !== true) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Debes aceptar todos los términos" }),
      };
    }

    // Arrays (permitimos vacíos)
    const toArray = (v: unknown) => {
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === "string" && v.trim()) {
        try {
          const arr = JSON.parse(v);
          return Array.isArray(arr) ? arr.map(String) : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const medicalConditions = toArray(data.medicalConditions);
    const eyeConditions = toArray(data.eyeConditions);

    // "otro" en howDidYouHear (si viene texto lo anexamos)
    let howDidYouHear: string = String(data.howDidYouHear);
    if (howDidYouHear === "otro" && typeof data.otherHowDidYouHear === "string" && data.otherHowDidYouHear.trim()) {
      howDidYouHear = `otro: ${data.otherHowDidYouHear.trim()}`;
    }

    const otherMedicalConditions =
      typeof data.otherMedicalConditions === "string" && data.otherMedicalConditions.trim()
        ? data.otherMedicalConditions.trim()
        : null;

    const otherEyeConditions =
      typeof data.otherEyeConditions === "string" && data.otherEyeConditions.trim()
        ? data.otherEyeConditions.trim()
        : null;

    // Payload: coincide con la tabla SQL que creaste (camelCase + receivedAt lo pone la DB)
    const payload = {
      title: String(data.title).trim(),
      firstName: String(data.firstName).trim(),
      address: String(data.address).trim(),
      state: String(data.state).trim(),
      phone: String(data.phone).trim(),
      birthDate: String(data.birthDate).trim(),
      postalCode: String(data.postalCode).trim(),
      email: String(data.email).trim().toLowerCase(),
      medicalConditions,
      otherMedicalConditions,
      eyeConditions,
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
