import React, { useState } from "react";
import {
  useForm,
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  DefaultValues,
  FieldValues,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type RenderProps<TValues extends FieldValues> = {
  register: UseFormRegister<TValues>;
  errors: FieldErrors<TValues>;
  watch: UseFormWatch<TValues>;
  isSubmitting: boolean;
};

type ConsentFormProps<TSchema extends z.AnyZodObject> = {
  title: string;
  schema: TSchema;
  // 👈 defaultValues deben matchear el INPUT del schema
  defaultValues: DefaultValues<z.input<TSchema>>;
  endpoint: string;
  // 👈 los fields trabajan con el INPUT (lo que el user escribe)
  renderFields: (p: RenderProps<z.input<TSchema>>) => React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
};

export default function ConsentForm<TSchema extends z.AnyZodObject>({
  title,
  schema,
  defaultValues,
  endpoint,
  renderFields,
  successMessage = "¡Formulario enviado exitosamente!",
  errorMessage = "Ocurrió un error. Intenta de nuevo.",
}: ConsentFormProps<TSchema>) {
  // 🔑 separá Input/Output del schema
  type TInput = z.input<TSchema>;
  type TOutput = z.output<TSchema>;

  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  // 👇 useForm<TInput, any, TOutput> + resolver(schema)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TInput>,
  });

  // 👇 handleSubmit te entrega TOutput (ya parseado/transformado)
  const onSubmit = async (data: TOutput) => {
    setStatus("idle");
    try {
      const res = await fetch(endpoint, {
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
        <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">{title}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {renderFields({ register, errors, watch, isSubmitting })}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-xl border bg-black px-6 py-3 text-white font-medium disabled:opacity-60 hover:bg-gray-800 transition-colors"
          >
            {isSubmitting ? "Enviando…" : "Enviar formulario"}
          </button>

          {status === "ok" && (
            <p className="text-center text-green-700 font-medium mt-4">{successMessage}</p>
          )}
          {status === "error" && (
            <p className="text-center text-red-700 font-medium mt-4">{errorMessage}</p>
          )}
        </form>
      </div>
    </main>
  );
}
