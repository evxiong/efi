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

export const metadata = {
  title: "EFI - European Football Index",
  description:
    "Premier League, LaLiga, Serie A, Bundesliga, and Ligue 1 match predictions, power rankings, and season projections.",
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
      <body className="scroll-smooth font-sans text-gray-900">
        <Navbar />
        {children}
      </body>
      <GoogleAnalytics gaId="G-CJJBCNV2DD" />
    </html>
  );
}
