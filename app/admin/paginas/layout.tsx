import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Editor de páginas | IBRACO",
  robots: { index: false, follow: false },
};
export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
