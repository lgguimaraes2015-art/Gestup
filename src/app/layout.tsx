import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "GestUp — Gestão de Tarefas & CRM | fin.up Consultoria",
  description: "Gestão inteligente de tarefas fiscais, contábeis e CRM para Consultoria Financeira com automação de WhatsApp",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased bg-[#F8FAFC] text-slate-900">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
