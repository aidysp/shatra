import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Altai Shatra",
  description: "Altai(Telengit) Shatra game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
