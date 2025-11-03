import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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

const playfair = Playfair_Display({
  variable: "--font-display",
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-dvh flex flex-col`}
      >
        {/* HEADER */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-brand-100 p-4 flex justify-between items-center">
          <h1 className="font-display text-3xl text-brand-900 tracking-wide">
            Coralin Studio
          </h1>
          <nav className="flex gap-2">
            <Link href="/" className="text-brand-700 hover:text-brand-900 hover:bg-brand-50 px-3 py-1 rounded-full transition-colors">
              Inicio (Formulario Pestañas)
            </Link>
            <Link
              href="/forms/formularioMicropigmentacion"
              className="text-brand-700 hover:text-brand-900 hover:bg-brand-50 px-3 py-1 rounded-full transition-colors"
            >
              Micropigmentación de Labios
            </Link>
          </nav>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 py-10 px-4 lg:px-8">
          <div className="max-w-5xl mx-auto brand-card p-8">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="bg-brand-50 border-t border-brand-100 text-center py-4 text-brand-800 text-sm">
          © {new Date().getFullYear()} Coralin Studio — Todos los derechos
          reservados
        </footer>
      </body>
    </html>
  );
}
