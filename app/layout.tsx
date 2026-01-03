import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wireframe UI",
  description: "Wireframe UI for the chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}

