// netlify/functions/submit.ts
import type { Handler } from '@netlify/functions';
import { ensureSchema, getPool } from '../../lib/pg'; 
import { randomUUID } from 'crypto';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    if (!process.env.DATABASE_URL) {
      return { statusCode: 500, body: JSON.stringify({ error: 'DATABASE_URL no está configurada' }) };
    }

    const raw = event.body || '{}';
    const data = JSON.parse(raw);

    // Honeypot simple
    if (typeof data.honeypot === 'string' && data.honeypot.trim() !== '') {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    // Requeridos de texto
    const reqStr = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
    const required = ['title','firstName','address','state','phone','birthDate','postalCode','email','howDidYouHear'];
    for (const f of required) {
      if (!reqStr(data[f])) {
        return { statusCode: 400, body: JSON.stringify({ error: `Campo inválido: ${f}` }) };
      }
    }

    // Booleans requeridos (deben ser true)
    if (data.agreement1 !== true || data.agreement2 !== true || data.agreement3 !== true) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Debes aceptar todos los términos' }) };
    }

    // Arrays (permitimos vacíos)
    const toArray = (v: unknown) => {
      if (Array.isArray(v)) return v.map(String);
      if (typeof v === 'string' && v.trim()) {
        try { const arr = JSON.parse(v); return Array.isArray(arr) ? arr.map(String) : []; } catch { return []; }
      }
      return [];
    };
    const medicalConditions = toArray(data.medicalConditions);
    const eyeConditions = toArray(data.eyeConditions);

    // "otro" en howDidYouHear (si viene texto lo anexamos)
    let howDidYouHear: string = String(data.howDidYouHear);
    if (howDidYouHear === 'otro' && typeof data.otherHowDidYouHear === 'string' && data.otherHowDidYouHear.trim()) {
      howDidYouHear = `otro: ${data.otherHowDidYouHear.trim()}`;
    }

    const otherMedicalConditions =
      typeof data.otherMedicalConditions === 'string' && data.otherMedicalConditions.trim()
        ? data.otherMedicalConditions.trim()
        : null;

    const otherEyeConditions =
      typeof data.otherEyeConditions === 'string' && data.otherEyeConditions.trim()
        ? data.otherEyeConditions.trim()
        : null;

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
      return { statusCode: 201, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ok: true, submission: rows[0] }) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[submit] error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Error interno' }) };
  }
};

export { handler };
