import type { Metadata } from "next";
import { getSeoMetadata } from "../../lib/seo-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/blog");
}

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
