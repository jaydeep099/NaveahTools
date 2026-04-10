import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NevaehTools",
  description: "Oracle utilities for JSON, XML, and CSV-to-SQL."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
