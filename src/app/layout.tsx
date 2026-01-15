import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/providers/i18n-provider";

/**
 * Inter - Primary sans-serif font
 * Used for: body text, UI elements, navigation, buttons
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

/**
 * Playfair Display - Serif accent font
 * Used for: page titles, stat values, decorative headings
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Silah | صلة - Legal Case Management System",
  description:
    "AI-powered legal case management system for Saudi practitioners. Manage cases, track regulations, and streamline your legal practice.",
  keywords: [
    "legal",
    "case management",
    "Saudi Arabia",
    "law firm",
    "AI legal",
    "صلة",
    "إدارة القضايا",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <QueryProvider>
            <I18nProvider>
              {children}
              <Toaster />
            </I18nProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
