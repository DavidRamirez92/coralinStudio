import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coralin Studio",
  description: "Belleza y bienestar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-gray-100 flex flex-col`}
      >
        {/* HEADER */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">
            Coralin Studio
          </h1>
          <nav className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Inicio (Formulario Pestañas)
            </Link>
            <Link
              href="/forms/formularioMicropigmentacion"
              className="text-gray-600 hover:text-gray-900"
            >
              Micropigmentación de Labios
            </Link>
          </nav>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 py-10 px-4 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-gray-200 text-center py-4 text-gray-600 text-sm">
          © {new Date().getFullYear()} Coralin Studio — Todos los derechos
          reservados
        </footer>
      </body>
    </html>
  );
}
