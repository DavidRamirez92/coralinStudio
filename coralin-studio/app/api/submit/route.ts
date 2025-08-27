import { NextResponse } from "next/server";
import { z } from "zod";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";


const Payload = z.object({
firstName: z.string().min(1),
lastName: z.string().min(1),
email: z.string().email(),
phone: z.string().optional().nullable(),
birthDate: z.string().optional().nullable(),
howDidYouHear: z.enum(["instagram", "google", "amigo", "flyer", "otro"]),
medicalHistory: z.string().optional().nullable(),
consent: z.literal(true),
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