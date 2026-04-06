import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cursed Powers — Every Superpower Has a Catch",
  description:
    "Rub the magic lamp. Tell the genie your desired superpower. Watch it get hilariously ruined. Powered by AI that technically grants your wish.",
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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Philosopher:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-mystic-900 text-white antialiased">
        <main className="stars-bg min-h-screen">{children}</main>
      </body>
    </html>
  );
}
