import React from "react";
import Link from "next/link";

export default function FormsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-gray-100 flex flex-col">
      {/* Encabezado común */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">
          Formularios - Coralin Studio
        </h1>
        <nav className="flex gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Inicio (Formulario Pestañas)
          </Link>
          {/* <Link href="/forms/formManos" className="text-gray-600 hover:text-gray-900">
            Form. Manos
          </Link> */}
          <Link href="/forms/formMicropigmentacionLabios" className="text-gray-600 hover:text-gray-900">
            Form. Micropigmentación de Labios
          </Link>
        </nav>
      </header>

      {/* Contenido del formulario */}
      <main className="flex-1 py-10 px-4 lg:px-8">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
          {children}
        </div>
      </main>

      {/* Footer común */}
      <footer className="bg-gray-200 text-center py-4 text-gray-600 text-sm">
        © {new Date().getFullYear()} Coralin Studio — Todos los derechos reservados
      </footer>
    </div>
  );
}
