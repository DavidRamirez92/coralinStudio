"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const FormSchema = z.object({
  firstName: z.string().min(1, "Requerido"),
  lastName: z.string().min(1, "Requerido"),
  email: z.email("Email inválido"),
  phone: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  howDidYouHear: z.enum(["instagram", "google", "amigo", "flyer", "otro"]).default("instagram"),
  medicalHistory: z.string().max(2000, "Máx. 2000 caracteres").optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Aceptá los términos" }) }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Page() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema) });

  const onSubmit = async (data: FormValues) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error");
      setStatus("ok");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-dvh bg-gray-50 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-gray-600">Ficha de cliente – Estudio</h1>
        <p className="mt-1 text-sm text-gray-600">
          Completá tus datos para que podamos atenderte mejor.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nombre</label>
              <input {...register("firstName")} className="mt-1 w-full rounded-lg border p-2 text-gray-800" />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Apellido</label>
              <input {...register("lastName")} className="mt-1 w-full rounded-lg border p-2 text-gray-800" />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <input
                {...register("email")}
                type="email"
                className="mt-1 w-full rounded-lg border p-2 text-gray-800"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Teléfono</label>
              <input {...register("phone")} className="mt-1 w-full rounded-lg border p-2 text-gray-800" />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600">Fecha de nacimiento</label>
              <input
                {...register("birthDate")}
                type="date"
                className="mt-1 w-full rounded-lg border p-2 text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">¿Cómo se enteró de nosotros?</label>
              <select {...register("howDidYouHear")} className="mt-1 w-full rounded-lg border p-2 text-gray-800">
                <option value="instagram">Instagram</option>
                <option value="google">Google</option>
                <option value="amigo">Recomendación de un amigo</option>
                <option value="flyer">Flyer/Cartelería</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Historia médica / notas</label>
            <textarea
              {...register("medicalHistory")}
              rows={5}
              className="mt-1 w-full rounded-lg border p-2 text-gray-800"
            />
            {errors.medicalHistory && (
              <p className="mt-1 text-sm text-red-600">
                {errors.medicalHistory.message as string}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input id="consent" type="checkbox" {...register("consent")} className="mt-1" />
            <label htmlFor="consent" className="text-sm text-gray-700">
              Acepto el uso de mis datos con fines de atención y contacto.
            </label>
          </div>
          {errors.consent && (
            <p className="-mt-3 text-sm text-red-600">{errors.consent.message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl border bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Enviando…" : "Enviar"}
          </button>

          {status === "ok" && (
            <p className="text-green-700">¡Enviado! Gracias por completar tus datos.</p>
          )}
          {status === "error" && (
            <p className="text-red-700">Ocurrió un error. Intentá de nuevo.</p>
          )}
        </form>
      </div>
    </main>
  );
}
