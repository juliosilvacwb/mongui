import type { Metadata } from "next";
import "./globals.css";
import "./ag-grid-custom.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import ErrorBoundary from "@/components/ErrorBoundary";

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
        <ErrorBoundary>
          <ThemeRegistry>{children}</ThemeRegistry>
        </ErrorBoundary>
      </body>
    </html>
  );
}
