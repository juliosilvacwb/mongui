import type { Metadata } from "next";
import "./globals.css";
import "./ag-grid-custom.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TranslationProvider } from "@/lib/i18n/TranslationContext";

export const metadata: Metadata = {
  title: "Mongui - MongoDB Web Interface",
  description: "Modern web interface for MongoDB management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <TranslationProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </TranslationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
