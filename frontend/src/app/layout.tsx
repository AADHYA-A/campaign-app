import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campaigns Hub — AI-Powered Multilingual Campaigns",
  description:
    "Generate AI-powered multilingual marketing campaigns with IndicTrans2. Reach millions across India in Hindi, Tamil, Telugu, Bengali, and 20+ more languages.",
  keywords: [
    "multilingual campaigns",
    "IndicTrans2",
    "AI marketing",
    "Indic languages",
    "Hindi campaigns",
    "campaign generator",
  ],
  openGraph: {
    title: "Campaigns Hub — Multilingual AI Campaigns",
    description: "AI-powered campaign generator for 20+ Indian languages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AuthProvider>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
