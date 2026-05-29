import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VideoEditor IA — Editor de Vídeo com Legendas",
  description: "Transcreva e adicione legendas animadas aos seus vídeos com IA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-[#050508] text-white antialiased">{children}</body>
    </html>
  );
}
