import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pandaielectric | Rujukan Elektrik & Latihan",
  description:
    "Tanya soalan elektrik atau laluan kursus PW2/PW4 berpandukan Garis Panduan Suruhanjaya Tenaga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
