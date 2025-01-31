import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PLFI - Premier League Football Index",
  description: "Premier League Football Index - created by Evan Xiong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} antialiased`}>
      <body className="min-h-screen w-screen overflow-x-hidden scroll-smooth font-sans text-gray-900">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
