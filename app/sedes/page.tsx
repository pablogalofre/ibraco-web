import SedesContent from "./../components/sedes-content";
import { getPublishedPageContent } from "./../lib/site-content-server";
export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getPublishedPageContent("/sedes");
  return <SedesContent content={content} />;
}
