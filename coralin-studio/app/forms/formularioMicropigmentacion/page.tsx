"use client";

import ConsentForm from "@/components/ConsentForm";
import { z } from "zod";

const MicroSchema = z.object({
  // Información del cliente
  nombreCompleto: z.string().min(1, "Requerido"),
  fechaNacimiento: z.string().min(1, "Requerido"),
  edad: z.coerce.number().int().min(0, "Inválida"),
  genero: z.enum(["F", "M", "NB"]),
  direccion: z.string().min(1, "Requerido"),
  email: z.email("Email inválido"),

  // Información Médica (booleans)
  embarazada: z.boolean().optional(),
  desordenAutoinmune: z.boolean().optional(),
  enfermedadActual: z.boolean().optional(),
  tratamientoMedico: z.boolean().optional(),
  condicionCoronaria: z.boolean().optional(),
  anticoagulantes: z.boolean().optional(),
  tomaMedicacion: z.boolean().optional(),
  medicacionDetalle: z.string().optional(),
  diabetes: z.boolean().optional(),
  tumoresQuistes: z.boolean().optional(),
  hepatitis: z.boolean().optional(),
  piercingCejas: z.boolean().optional(),
  alcoholFrecuente: z.boolean().optional(),
  esAlergico: z.boolean().optional(),
  alergiaDetalle: z.string().optional(),

  // Historial de la piel
  botox: z.boolean().optional(),
  exfoliacionQuimica: z.boolean().optional(),
  acne: z.boolean().optional(),
  lunares: z.boolean().optional(),
  cirugiaFacial: z.boolean().optional(),
  transplanteCejas: z.boolean().optional(),
  sangradoExcesivo: z.boolean().optional(),
  realizadoMaquillajePermanente: z.boolean().optional(),
  inyectadoAcidoHialuronico: z.boolean().optional(),
  herpes: z.boolean().optional(),
  llagas: z.boolean().optional(),

  //TYC
   acuerdoDeclaracion: z
    .boolean()
    .refine((v) => v === true, {
      message: "Debes aceptar esta declaración para continuar",
    }),
});

export default function Page() {
  return (
    <ConsentForm
      title="Micropigmentación de Labios"
      schema={MicroSchema}
      endpoint="/api/submitMicropigmentacion"
      defaultValues={{
        // cliente
        nombreCompleto: "",
        fechaNacimiento: "",
        edad: undefined as unknown as number,
        genero: "F",
        direccion: "",
        email: "",
        // médica
        embarazada: false,
        desordenAutoinmune: false,
        enfermedadActual: false,
        tratamientoMedico: false,
        condicionCoronaria: false,
        anticoagulantes: false,
        tomaMedicacion: false,
        medicacionDetalle: "",
        diabetes: false,
        tumoresQuistes: false,
        hepatitis: false,
        piercingCejas: false,
        alcoholFrecuente: false,
        esAlergico: false,
        alergiaDetalle: "",
        // piel
        botox: false,
        exfoliacionQuimica: false,
        acne: false,
        lunares: false,
        cirugiaFacial: false,
        transplanteCejas: false,
        sangradoExcesivo: false,
        realizadoMaquillajePermanente: false,
        inyectadoAcidoHialuronico: false,
        herpes: false,
        llagas: false, 
        acuerdoDeclaracion: false,   

      }}
      renderFields={({ register, errors, watch }) => {
        const mostrarMedicacionDetalle = watch("tomaMedicacion");
        const mostrarAlergiaDetalle = watch("esAlergico");

        return (
          <>
            {/* Subtítulo */}
            <h2 className="text-lg text-gray-700 mb-6">Ficha de consentimiento</h2>

            {/* Información del cliente */}
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Información del cliente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Nombre Completo
                </label>
                <input
                  {...register("nombreCompleto")}
                  className="w-full rounded-lg border p-3"
                />
                {errors.nombreCompleto && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.nombreCompleto.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border p-3"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  {...register("fechaNacimiento")}
                  className="w-full rounded-lg border p-3"
                />
                {errors.fechaNacimiento && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fechaNacimiento.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  {...register("edad")}
                  className="w-full rounded-lg border p-3"
                  placeholder="Ej: 32"
                />
                {errors.edad && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.edad.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Género
                </label>
                <select
                  {...register("genero")}
                  className="w-full rounded-lg border text-gray-800 p-3"
                >
                  <option value="F">Femenino</option>
                  <option value="M">Masculino</option>
                  <option value="NB">NB</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Dirección
                </label>
                <input
                  {...register("direccion")}
                  className="w-full rounded-lg border p-3"
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Información Médica (izquierda) + Historial de la piel (derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna izquierda: Información Médica */}
              <section>
                <h3 className="text-xl font-semibold text-gray-700">
                  Información Médica
                </h3>
                <p className="text-sm text-gray-800 mb-4">
                  Marca las opciones que correspondan:
                </p>

                <div className="space-y-2 text-sm text-gray-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("embarazada")} className="rounded border-gray-300" />
                    <span>¿Estás embarazada?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("desordenAutoinmune")} className="rounded border-gray-300" />
                    <span>¿Tienes algún desorden autoinmune?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("enfermedadActual")} className="rounded border-gray-300" />
                    <span>¿Sufre alguna enfermedad actual?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("tratamientoMedico")} className="rounded border-gray-300" />
                    <span>¿Estás realizando algún tratamiento médico?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("condicionCoronaria")} className="rounded border-gray-300" />
                    <span>¿Sufre alguna condición coronaria?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("anticoagulantes")} className="rounded border-gray-300" />
                    <span>¿Tomás algún medicamento anticoagulante?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("tomaMedicacion")} className="rounded border-gray-300" />
                    <span>¿Tomás alguna medicación?</span>
                  </label>

                  {mostrarMedicacionDetalle && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Detallar
                      </label>
                      <input
                        {...register("medicacionDetalle")}
                        className="w-full rounded-lg border p-3"
                        placeholder="Nombre de la medicación"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("diabetes")} className="rounded border-gray-300" />
                    <span>Diabetes</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("tumoresQuistes")} className="rounded border-gray-300" />
                    <span>Tumores/Quistes</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("hepatitis")} className="rounded border-gray-300" />
                    <span>Hepatitis</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("piercingCejas")} className="rounded border-gray-300" />
                    <span>¿Te has realizado algún piercing en las cejas?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("alcoholFrecuente")} className="rounded border-gray-300" />
                    <span>¿Consumís bebidas alcohólicas con frecuencia?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("esAlergico")} className="rounded border-gray-300" />
                    <span>¿Sos alérgico?</span>
                  </label>

                  {mostrarAlergiaDetalle && (
                    <div className="ml-6">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Detallar
                      </label>
                      <input
                        {...register("alergiaDetalle")}
                        className="w-full rounded-lg border p-3"
                        placeholder="Tipo de alergia"
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Columna derecha: Historial de la piel */}
              <section className="lg:pl-6">
                <h3 className="text-xl font-semibold text-gray-700">
                  Historial de la piel
                </h3>
                <p className="text-sm text-gray-800 mb-4">
                  Marca si alguna corresponde con tu historial:
                </p>

                <div className="space-y-2 text-sm text-gray-700">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("botox")} className="rounded border-gray-300" />
                    <span>Botox</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("exfoliacionQuimica")} className="rounded border-gray-300" />
                    <span>Exfoliación Química</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("acne")} className="rounded border-gray-300" />
                    <span>Acné/ tratamiento cutáneo</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("lunares")} className="rounded border-gray-300" />
                    <span>Lunares en las cejas</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("cirugiaFacial")} className="rounded border-gray-300" />
                    <span>Cirugía Facial</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("transplanteCejas")} className="rounded border-gray-300" />
                    <span>Transplante de Cejas</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("sangradoExcesivo")} className="rounded border-gray-300" />
                    <span>Sangrado Excesivo</span>
                  </label>

                   <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("realizadoMaquillajePermanente")} className="rounded border-gray-300" />
                    <span>¿Te has realizado algún maquillaje permanente</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input type="checkbox" {...register("inyectadoAcidoHialuronico")} className="rounded border-gray-300" />
                    <span>¿Te has inyectado en la actualidad ácido hialurónico?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("herpes")} className="rounded border-gray-300" />
                    <span>¿Sufres o sufriste de herpes alguna vez?</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("llagas")} className="rounded border-gray-300" />
                    <span>¿sufres de llagas en la piel?</span>
                  </label>

                </div>
              </section>
            </div>
            <div className="border-t pt-6">
                <label className="flex items-start gap-3">
                    <input
                    type="checkbox"
                    {...register("acuerdoDeclaracion")}
                    className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                    Estoy de acuerdo en que toda la información anteriormente brindada es
                    verdadera y precisa a mi leal saber y entender.
                    </span>
                </label>
                {errors.acuerdoDeclaracion && (
                    <p className="mt-1 text-sm text-red-600">
                    {errors.acuerdoDeclaracion.message as string}
                    </p>
                )}
            </div>
          </>
        );
      }}
    />
  );
}
