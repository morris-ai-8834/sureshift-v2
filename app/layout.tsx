import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SureShift Rentals — Reliable Cars for the Hustle",
  description:
    "Houston & Dallas go-to car rental for gig workers and commuters. Flexible weekly rentals, no credit check required. Uber/Lyft approved vehicles available.",
  keywords: "car rental Houston Dallas Texas, gig worker car rental, Uber Lyft rental, weekly car rental",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#0D0D0D] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
