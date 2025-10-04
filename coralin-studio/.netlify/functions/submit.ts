
import type { Handler } from '@netlify/functions';
import { ensureSchema, getPool } from '../../lib/pg'; // ajustá la ruta si tu pg.ts está en otro lado
import { randomUUID } from 'crypto';

const handler: Handler = async (event) => {
  // Sólo POST
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    if (!process.env.DATABASE_URL) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'DATABASE_URL no está configurada' }),
      };
    }

    const body = event.body || '{}';
    const data = JSON.parse(body);

    // === Validaciones duras para lo que tu front promete enviar ===
    const reqStr = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
    const reqBoolTrue = (v: unknown) => v === true; // tus 3 checkboxes deben venir en true

    const requiredStringFields: Array<keyof typeof data> = [
      'title',
      'firstName',
      'address',
      'state',
      'phone',
      'birthDate',
      'postalCode',
      'email',
      'howDidYouHear',
    ];

    for (const f of requiredStringFields) {
      if (!reqStr(data[f])) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Campo inválido: ${String(f)}` }),
        };
      }
    }

    // arrays (checkboxes múltiples)
    const toArray = (v: unknown) => {
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === 'string' && v.trim()) {
        try {
          const parsed = JSON.parse(v);
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const medicalConditions = toArray(data.medicalConditions);
    const eyeConditions = toArray(data.eyeConditions);

    if (medicalConditions.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'medicalConditions requerido' }) };
    }
    if (eyeConditions.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'eyeConditions requerido' }) };
    }

    // acuerdos (deben venir true por tu esquema)
    if (!reqBoolTrue(data.agreement1) || !reqBoolTrue(data.agreement2) || !reqBoolTrue(data.agreement3)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Debes aceptar todos los términos' }) };
    }

    // "otro" de howDidYouHear → compactamos en una sola columna (texto)
    // Si user selecciona "otro" y escribió algo, almacenamos "otro: <texto>"
    let howDidYouHear: string = String(data.howDidYouHear);
    if (howDidYouHear === 'otro' && reqStr(data.otherHowDidYouHear)) {
      howDidYouHear = `otro: ${String(data.otherHowDidYouHear).trim()}`;
    }

    // opcionales
    const otherMedicalConditions =
      typeof data.otherMedicalConditions === 'string' && data.otherMedicalConditions.trim()
        ? String(data.otherMedicalConditions).trim()
        : null;

    const otherEyeConditions =
      typeof data.otherEyeConditions === 'string' && data.otherEyeConditions.trim()
        ? String(data.otherEyeConditions).trim()
        : null;

    // Garantizamos esquema (idempotente)
    await ensureSchema();

    const client = await getPool().connect();
    try {
      const id = randomUUID();
      const receivedAt = new Date().toISOString();

      const sql = `
        INSERT INTO public.submissions (
          id, receivedAt, title, firstName, address, state, phone, birthDate, postalCode, email,
          medicalConditions, otherMedicalConditions, eyeConditions, otherEyeConditions,
          howDidYouHear, agreement1, agreement2, agreement3
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14,
          $15, $16, $17, $18
        )
        RETURNING id, receivedAt
      `;

      const params = [
        id,
        receivedAt,
        String(data.title).trim(),
        String(data.firstName).trim(),
        String(data.address).trim(),
        String(data.state).trim(),
        String(data.phone).trim(),
        String(data.birthDate).trim(),
        String(data.postalCode).trim(),
        String(data.email).trim().toLowerCase(),
        JSON.stringify(medicalConditions),
        otherMedicalConditions,
        JSON.stringify(eyeConditions),
        otherEyeConditions,
        howDidYouHear,
        true,
        true,
        true,
      ];

      const { rows } = await client.query(sql, params);

      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, submission: rows[0] }),
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[submit] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno' }) };
  }
};

export { handler };
