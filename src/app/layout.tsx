import type { Metadata } from "next";
import { Toaster } from "sonner";
import { getLocale } from "next-intl/server";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Kiều Quy — MC & Storyteller", template: "%s | Kiều Quy" },
  description:
    "Kết nối bằng câu chuyện. Đồng hành cùng những khoảnh khắc đáng nhớ.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={await getLocale()} data-scroll-behavior="smooth">
      <head>
        <link
          rel="preload"
          href="/fonts/font-0.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
