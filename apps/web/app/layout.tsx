import type { Metadata } from "next";
import { Philosopher, Cinzel, Inter, Rubik_Glitch } from "next/font/google";
import "./globals.css";

const philosopher = Philosopher({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-philosopher",
  display: "swap",
});

const cinzel = Cinzel({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const rubikGlitch = Rubik_Glitch({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rubik-glitch",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Golden Powers — Every Superpower Has a Catch",
  description:
    "Rub the magic lamp. Tell the genie your desired superpower. Watch it get hilariously ruined. Powered by AI that technically grants your wish.",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/favicon/apple-touch-icon.png",
    other: [{ rel: "manifest", url: "/favicon/site.webmanifest" }],
  },
  openGraph: {
    title: "Cursed Powers",
    description: "Every superpower has a catch. What will yours be?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${philosopher.variable} ${cinzel.variable} ${inter.variable} ${rubikGlitch.variable}`}
    >
      <body className="min-h-screen bg-mystic-900 text-white antialiased">
        <main className="stars-bg min-h-screen">{children}</main>
      </body>
    </html>
  );
}
