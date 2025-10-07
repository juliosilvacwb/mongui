import type { Metadata } from "next";
import "./globals.css";
import "./ag-grid-custom.css";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Mongo UI - MongoDB Web Interface",
  description: "Interface web para gerenciar MongoDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
