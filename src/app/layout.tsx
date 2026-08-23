import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import LanguageSwitcher from "./language-switcher";
import "./globals.css";
import { getLocale } from "@/lib/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payflow",
  description: "Payflow",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <LanguageSwitcher locale={locale} />
        {children}
      </body>
    </html>
  );
}
