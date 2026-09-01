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
  Lugar_nacimiento?: string;
  Lugar_residencia?: string;
  Codigo_programa: string;
  Consecutivo_periodo: number;
  Consecutivo_sedejornada: number;
};

function getQ10ApiKey() {
  const apiKey = process.env.Q10_API_KEY;

  if (!apiKey) {
    throw new Error("Falta Q10_API_KEY");
  }

  return apiKey;
}

function getQ10Headers(apiKey: string) {
  return {
    "Api-Key": apiKey,
    "Ocp-Apim-Subscription-Key": apiKey,
    Accept: "application/json",
  };
}

export async function getQ10StudentByIdentification(
  identification: string
) {
  const apiKey = getQ10ApiKey();

  const response = await fetch(
    `https://api.q10.com/v1/estudiantes/${encodeURIComponent(
      identification
    )}`,
    {
      method: "GET",
      headers: getQ10Headers(apiKey),
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

  if (!text) {
    return null;
  }

  return JSON.parse(text);
}

export async function createQ10Preinscription(
  payload: Q10PreinscriptionPayload
) {
  const apiKey = getQ10ApiKey();

  const response = await fetch(
    "https://api.q10.com/v1/preinscripciones",
    {
      method: "POST",
      headers: {
        ...getQ10Headers(apiKey),
        "Content-Type": "application/json",
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

  if (!text) {
    return {
      ok: true,
    };
  }

  return JSON.parse(text);
}