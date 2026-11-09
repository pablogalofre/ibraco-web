// Accesos institucionales. No almacenan credenciales ni modifican el mapeo de cursos.
// Q10: acceso enlazado desde www.ibraco.org.co, verificado el 9 de noviembre de 2026.
export const institutionalPortals = {
  q10: {
    title: "Q10",
    description: "Servicios académicos y administrativos",
    href: "https://site3.q10.com/login?ReturnUrl=/&aplentId=dcabf52f-8dd6-483e-8a7b-9bfe73d8c039",
  },
  virtual: {
    title: "IBRACO Virtual",
    description: "Ingresa a tu aula virtual",
    href: "https://aulavirtual.ibraco.edu.co/login/index.php",
  },
} as const;
