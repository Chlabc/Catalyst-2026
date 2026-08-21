import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LunaCare — Your cycle companion",
  description: "AI-powered cycle care, symptom insights and a companion that grows with you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
