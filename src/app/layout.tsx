import type { Metadata } from "next";
import Script from "next/script";
import { Fredoka, Nunito, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/ui/NavBar";
import { BlossomThemeProvider } from "@/components/theme/BlossomThemeProvider";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloom",
  description:
    "A safe first point of contact for curious pre-teens learning about menstruation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fredoka.variable} ${nunito.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <BlossomThemeProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
        </BlossomThemeProvider>
        <Script id="blossom-theme-init" strategy="beforeInteractive">
          {`try{var theme=localStorage.getItem("blossom_home_scene");document.documentElement.dataset.blossomTheme=theme==="macaron"?"macaron":"beach"}catch(e){document.documentElement.dataset.blossomTheme="beach"}`}
        </Script>
      </body>
    </html>
  );
}
