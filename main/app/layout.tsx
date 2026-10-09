import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import Script from "next/script";
import { TopNav } from "@/components/hud/TopNav";
import { ConsoleNote } from "@/components/brand/ConsoleNote";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-mono" });

const GA_ID = "G-GREG4LTX4E";

const INTRO_GATE = `try{if(location.pathname==="/"&&!sessionStorage.getItem("intro-seen")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-pending")}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://colebjohnson.com"),
  title: "Cole Johnson",
  description:
    "Cole Johnson builds intelligent systems that interact with the physical world: robotics research, company building, and autonomous systems.",
  keywords: ["robotics", "machine learning", "prosthetics", "control", "Terranova", "Echo", "SpaceX", "Cole Johnson"],
  icons: { icon: "/fav.png" },
  openGraph: {
    title: "Cole Johnson",
    description: "Robotics, intelligence, and systems that act in the world.",
    url: "https://colebjohnson.com",
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
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <TopNav />
        {children}
        <ConsoleNote />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}");`}
        </Script>
      </body>
    </html>
  );
}
