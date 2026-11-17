import type { NextConfig } from "next";

// Publicación parcial: mantener el contenido pendiente para revisión en Administración.
// Redirecciones temporales; retirar este bloque cuando IBRACO apruebe el lanzamiento completo.
const nextConfig: NextConfig = {
  async redirects() {
    const pendingSections = ["sedes", "cultura", "agenda-cultural", "eventos", "empresas", "alumni", "blog", "nivelacion"];
    return [
      { source: "/", destination: "https://www.ibraco.org.co/", permanent: false },
      ...pendingSections.map(section => ({
        source: `/${section}/:path*`,
        destination: "https://www.ibraco.org.co/",
        permanent: false,
      })),
    ];
  },
};

export default nextConfig;
