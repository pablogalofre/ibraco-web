import type { Metadata } from "next";
import { getSeoMetadata } from "../../lib/seo-metadata";
import EnrollmentPromo from "../components/enrollment-promo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return getSeoMetadata("/cursos");
}

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}<EnrollmentPromo /></>;
}
