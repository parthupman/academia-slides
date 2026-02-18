import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AcademiaSlides - AI Research Paper to Presentation",
  description: "Transform your research papers into stunning academic presentations with AI. Upload a PDF and get a professionally designed PowerPoint presentation in minutes.",
  keywords: ["research paper", "presentation", "AI", "PowerPoint", "academic", "slides"],
  authors: [{ name: "AcademiaSlides" }],
  openGraph: {
    title: "AcademiaSlides - AI Research Paper to Presentation",
    description: "Transform your research papers into stunning academic presentations with AI.",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
