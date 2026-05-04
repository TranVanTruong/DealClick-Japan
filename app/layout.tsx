import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DealClick Japan",
  description: "Japan sale and coupon aggregation powered by real Rakuten Web Service data."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
