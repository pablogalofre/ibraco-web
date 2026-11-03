import type { Metadata } from "next";
export const metadata: Metadata = { title: "Publicidad y pop-ups | IBRACO", robots: { index: false, follow: false } };
export default function AdvertisingLayout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
