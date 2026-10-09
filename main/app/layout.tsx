import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter, Instrument_Serif } from "next/font/google";
import Script from "next/script";
import { TopNav } from "@/components/hud/TopNav";
import "./globals.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const GA_ID = "G-GREG4LTX4E";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.colebjohnson.com"),
  title: "Cole Johnson",
  description:
    "Cole Johnson builds intelligent systems that interact with the physical world: robotics research, company building, and autonomous systems.",
  keywords: ["robotics", "machine learning", "prosthetics", "control", "Terranova", "Echo", "Cole Johnson"],
  icons: { icon: "/fav.png" },
  openGraph: {
    title: "Cole Johnson",
    description: "Robotics, intelligence, and systems that act in the world.",
    url: "https://www.colebjohnson.com",
    siteName: "Cole Johnson",
    images: [{ url: "/banner.png" }],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TopNav />
        {children}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}");`}
        </Script>
      </body>
    </html>
  );
}
