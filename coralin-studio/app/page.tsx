"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const FormSchema = z.object({
  // Información Personal
  title: z.enum(["NB", "F", "M"]),
  firstName: z.string().min(1, "Requerido"),
  address: z.string().min(1, "Requerido"),
  state: z.string().min(1, "Requerido"),
  phone: z.string().min(1, "Requerido"),
  birthDate: z.string().min(1, "Requerido"),
  postalCode: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  
  // Historial médico
  medicalConditions: z.array(z.string()).min(1, "Selecciona al menos una opción"),
  otherMedicalConditions: z.string().optional(),
  eyeConditions: z.array(z.string()).min(1, "Selecciona al menos una opción"),
  otherEyeConditions: z.string().optional(),
  
  // Sobre nosotros
  howDidYouHear: z.enum(["recomendacion", "anuncio", "redes_sociales", "google", "otro"]),
  otherHowDidYouHear: z.string().optional(),
  
  // Acuerdos
  agreement1: z.literal(true).refine(val => val === true, { message: "Debes aceptar este término" }),
  agreement2: z.literal(true).refine(val => val === true, { message: "Debes aceptar este término" }),
  agreement3: z.literal(true).refine(val => val === true, { message: "Debes aceptar este término" }),
});

type FormValues = z.infer<typeof FormSchema>;

export default function Page() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");


  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ 
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "NB",
      medicalConditions: [],
      eyeConditions: [],
      howDidYouHear: "recomendacion"
    }
  });

  const howDidYouHear = watch("howDidYouHear");

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
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Ficha de consentimiento</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* INFORMACIÓN PERSONAL */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Información Personal</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primera columna */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Género</label>
                  <select {...register("title")} className="w-full rounded-lg border p-3 text-gray-800">
                    <option value="NB">No Binario</option>
                    <option value="F">Femenino</option>
                    <option value="M">Masculino</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
                  <input {...register("firstName")} className="w-full rounded-lg border p-3 text-gray-800" />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Dirección</label>
                  <input {...register("address")} className="w-full rounded-lg border p-3 text-gray-800" />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Estado/Provincia</label>
                  <input {...register("state")} className="w-full rounded-lg border p-3 text-gray-800" />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono</label>
                  <input {...register("phone")} className="w-full rounded-lg border p-3 text-gray-800" />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
              
              {/* Segunda columna */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de nacimiento</label>
                  <input
                    {...register("birthDate")}
                    type="date"
                    className="w-full rounded-lg border p-3 text-gray-800"
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">CP</label>
                  <input {...register("postalCode")} className="w-full rounded-lg border p-3 text-gray-800" />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Correo Electrónico</label>
                  <input
                    {...register("email")}
                    type="email"
                    className="w-full rounded-lg border p-3 text-gray-800"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* HISTORIAL MÉDICO */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Historial Médico</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Primera columna */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Condiciones preexistentes:
                </label>
                <div className="space-y-2">
                  {["Piel Seca", "Piel sensible", "Alergia", "Sensibilidad ocular", "Alergia a las cintas"].map((condition) => (
                    <label key={condition} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={condition}
                        {...register("medicalConditions")}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
                {errors.medicalConditions && (
                  <p className="mt-2 text-sm text-red-600">{errors.medicalConditions.message}</p>
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Otro</label>
                  <input
                    {...register("otherMedicalConditions")}
                    className="w-full rounded-lg border p-3 text-gray-800"
                    placeholder="Especificar otra condición"
                  />
                </div>
              </div>
              
              {/* Segunda columna */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Marque las enfermedades que presenta actualmente:
                </label>
                <div className="space-y-2">
                  {["Inflamación en el párpado", "Conjuntivitis", "Blefaritis", "Dermatitis", "Tiroides"].map((condition) => (
                    <label key={condition} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={condition}
                        {...register("eyeConditions")}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
                {errors.eyeConditions && (
                  <p className="mt-2 text-sm text-red-600">{errors.eyeConditions.message}</p>
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Otro</label>
                  <input
                    {...register("otherEyeConditions")}
                    className="w-full rounded-lg border p-3 text-gray-800"
                    placeholder="Especificar otra condición"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SOBRE NOSOTROS */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Sobre Nosotros</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                ¿Cómo supiste de nosotros?
              </label>
              <select {...register("howDidYouHear")} className="w-full rounded-lg border p-3 text-gray-800 mb-4">
                <option value="recomendacion">Recomendación</option>
                <option value="anuncio">Anuncio</option>
                <option value="redes_sociales">Redes sociales</option>
                <option value="google">Búsqueda en Google</option>
                <option value="otro">Otro</option>
              </select>
              
              {howDidYouHear === "otro" && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Especificar</label>
                  <input
                    {...register("otherHowDidYouHear")}
                    className="w-full rounded-lg border p-3 text-gray-800"
                    placeholder="Especificar cómo se enteró"
                  />
                </div>
              )}
            </div>
          </div>

          {/* ACUERDO */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Acuerdo</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  id="agreement1"
                  type="checkbox"
                  {...register("agreement1")}
                  className="mt-1 rounded border-gray-300"
                />
                <label htmlFor="agreement1" className="text-sm text-gray-700">
                  Certifico que toda la información en éste formulario es verdadera y correcta según mi saber y entender.
                </label>
              </div>
              {errors.agreement1 && (
                <p className="text-sm text-red-600">{errors.agreement1.message}</p>
              )}
              
              <div className="flex items-start space-x-3">
                <input
                  id="agreement2"
                  type="checkbox"
                  {...register("agreement2")}
                  className="mt-1 rounded border-gray-300"
                />
                <label htmlFor="agreement2" className="text-sm text-gray-700">
                  Entiendo los riesgos asociados con éste procedimiento (Aplicación/remoción de extensiones de pestañas) y el técnico no será responsable de ningún daño (por ejemplo, reacciones alérgicas) a mí o a mis pestañas.
                </label>
              </div>
              {errors.agreement2 && (
                <p className="text-sm text-red-600">{errors.agreement2.message}</p>
              )}
              
              <div className="flex items-start space-x-3">
                <input
                  id="agreement3"
                  type="checkbox"
                  {...register("agreement3")}
                  className="mt-1 rounded border-gray-300"
                />
                <label htmlFor="agreement3" className="text-sm text-gray-700">
                  Entiendo éste procedimiento y doy mi consentimiento para realizar éste servicio.
                </label>
              </div>
              {errors.agreement3 && (
                <p className="text-sm text-red-600">{errors.agreement3.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-xl border bg-black px-6 py-3 text-white font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? "Enviando…" : "Enviar formulario"}
          </button>

          {status === "ok" && (
            <p className="text-center text-green-700 font-medium">¡Formulario enviado exitosamente! Gracias por tu consentimiento.</p>
          )}
          {status === "error" && (
            <p className="text-center text-red-700 font-medium">Ocurrió un error. Por favor, intenta de nuevo.</p>
          )}
        </form>
      </div>
    </main>
  );
}
