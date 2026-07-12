import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { AppNav } from "./components/AppNav";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "晴天 · 每日心情日记",
    description: "记录今天心里的天气，把每一种心情都好好收下。",
    applicationName: "晴天",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "晴天", statusBarStyle: "default" },
    formatDetection: { telephone: false },
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "晴天", description: "把每一种心情，都好好收下", images: [{ url: "/og.png", width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "晴天", description: "把每一种心情，都好好收下", images: ["/og.png"] },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}<AppNav /></body></html>;
}
