import Metadata from "next/types";
import { Doppio_One, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
});

const doppioOne = Doppio_One({
  weight: ["400"],
  variable: "--font-doppio-one",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PLFI - Premier League Football Index",
  description:
    "The latest Premier League match predictions, power rankings, and season projections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${doppioOne.variable} antialiased`}
    >
      <body className="min-h-screen w-screen overflow-x-hidden scroll-smooth font-sans text-gray-900">
        <Navbar />
        {children}
      </body>
      <GoogleAnalytics gaId="G-CJJBCNV2DD" />
    </html>
  );
}
