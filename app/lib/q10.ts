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

async function parseQ10Response(response: Response) {
  const text = await response.text();

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

function normalizeQ10Records(result: any) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.Data)) {
    return result.Data;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
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

  if (response.status === 404) {
    return null;
  }

  return parseQ10Response(response);
}

export async function getQ10Periods() {
  const apiKey = getQ10ApiKey();

  const allPeriods: any[] = [];
  const limit = 100;
  let offset = 1;

  while (true) {
    const url = new URL(
      "https://api.q10.com/v1/periodos"
    );

    url.searchParams.set("Limit", String(limit));
    url.searchParams.set("Offset", String(offset));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getQ10Headers(apiKey),
      cache: "no-store",
    });

    const result = await parseQ10Response(response);
    const records = normalizeQ10Records(result);

    allPeriods.push(...records);

    if (records.length < limit) {
      break;
    }

    offset += 1;

    if (offset > 100) {
      throw new Error(
        "Se alcanzó el límite de seguridad al consultar períodos Q10"
      );
    }
  }

  return allPeriods;
}

export async function getQ10Preinscriptions(
  periodo: number,
  limit = 100,
  offset = 1
) {
  const apiKey = getQ10ApiKey();

  const url = new URL(
    "https://api.q10.com/v1/preinscripciones"
  );

  url.searchParams.set("Periodo", String(periodo));
  url.searchParams.set("Limit", String(limit));
  url.searchParams.set("Offset", String(offset));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getQ10Headers(apiKey),
    cache: "no-store",
  });

  return parseQ10Response(response);
}

export async function getQ10Programs(
  limit = 100,
  offset = 1
) {
  const apiKey = getQ10ApiKey();

  const url = new URL(
    "https://api.q10.com/v1/programas"
  );

  url.searchParams.set("Limit", String(limit));
  url.searchParams.set("Offset", String(offset));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getQ10Headers(apiKey),
    cache: "no-store",
  });

  return parseQ10Response(response);
}

export async function getQ10SitesJourneys(
  limit = 100,
  offset = 1
) {
  const apiKey = getQ10ApiKey();

  const url = new URL(
    "https://api.q10.com/v1/sedesjornadas"
  );

  url.searchParams.set("Limit", String(limit));
  url.searchParams.set("Offset", String(offset));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getQ10Headers(apiKey),
    cache: "no-store",
  });

  return parseQ10Response(response);
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

  const result = await parseQ10Response(response);

  if (result === null) {
    return {
      ok: true,
    };
  }

  return result;
}