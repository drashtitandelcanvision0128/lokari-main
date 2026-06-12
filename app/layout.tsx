import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import ConditionalFooter from "@/components/common/ConditionalFooter";
import StoreProvider from "@/components/providers/StoreProvider";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lokhari",
  description: "Agricultural produce trading platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <head>
        <link key="preconnect-1" rel="preconnect" href="https://fonts.googleapis.com" />
        <link key="preconnect-2" rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link key="material-symbols" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#fcf9f5] text-[#1c1c19] font-body selection:bg-primary-container selection:text-on-primary-container">
        <StoreProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
