export async function getQ10StudentByIdentification(
  identification: string
) {
  const apiKey = process.env.Q10_API_KEY;

  if (!apiKey) {
    throw new Error("Falta Q10_API_KEY");
  }

  const response = await fetch(
    `https://api.q10.com/v1/estudiantes/${encodeURIComponent(
      identification
    )}`,
    {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const text = await response.text();

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Q10 respondió ${response.status}: ${text}`
    );
  }

  return JSON.parse(text);
}
type Q10PreinscriptionPayload = {
  Fecha_preinscripcion: string;
  Primer_nombre: string;
  Segundo_nombre?: string;
  Primer_apellido: string;
  Segundo_apellido?: string;
  Codigo_tipo_identificacion: string;
  Numero_identificacion: string;
  Genero?: string;
  Fecha_nacimiento?: string;
  Telefono?: string;
  Celular?: string;
  Email: string;
  Direccion?: string;
  Lugar_residencia?: string;
  Codigo_programa: string;
  Consecutivo_periodo: number;
  Consecutivo_sedejornada: number;
};

export async function createQ10Preinscription(
  payload: Q10PreinscriptionPayload
) {
  const apiKey = process.env.Q10_API_KEY;

  if (!apiKey) {
    throw new Error("Falta Q10_API_KEY");
  }

  const response = await fetch(
    "https://api.q10.com/v1/preinscripciones",
    {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Q10 respondió ${response.status}: ${text}`
    );
  }

  return JSON.parse(text);
}