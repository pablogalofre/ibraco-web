import { NextResponse } from "next/server";
import {
  getQ10Periods,
  getQ10Programs,
  getQ10SitesJourneys,
} from "../../../lib/q10";

type Q10Record = Record<string, unknown>;

type Option = {
  value: string;
  label: string;
};

function normalizeRecords(result: unknown): Q10Record[] {
  if (Array.isArray(result)) {
    return result as Q10Record[];
  }

  if (
    result &&
    typeof result === "object" &&
    Array.isArray((result as { Data?: unknown[] }).Data)
  ) {
    return (result as { Data: Q10Record[] }).Data;
  }

  if (
    result &&
    typeof result === "object" &&
    Array.isArray((result as { data?: unknown[] }).data)
  ) {
    return (result as { data: Q10Record[] }).data;
  }

  return [];
}

function firstText(
  record: Q10Record,
  keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value).trim();
    }
  }

  return "";
}

function uniqueSorted(options: Option[]) {
  const seen = new Set<string>();

  return options
    .filter((option) => {
      if (!option.value || seen.has(option.value)) {
        return false;
      }

      seen.add(option.value);
      return true;
    })
    .sort((a, b) =>
      a.label.localeCompare(b.label, "es", {
        numeric: true,
        sensitivity: "base",
      })
    );
}

function programOptions(records: Q10Record[]): Option[] {
  return uniqueSorted(
    records
      .map((record) => {
        const value = firstText(record, [
          "Codigo_programa",
          "Código_programa",
          "Codigo",
          "Código",
          "codigo",
          "code",
        ]);

        const name = firstText(record, [
          "Nombre_programa",
          "Nombre",
          "nombre",
          "Descripcion",
          "Descripción",
          "description",
        ]);

        return {
          value,
          label: name
            ? `${name} · ${value}`
            : `Programa ${value}`,
        };
      })
      .filter((option) => option.value)
  );
}

function periodOptions(records: Q10Record[]): Option[] {
  return uniqueSorted(
    records
      .map((record) => {
        const value = firstText(record, [
          "Consecutivo",
          "consecutivo",
          "Id",
          "id",
        ]);

        const name = firstText(record, [
          "Nombre_periodo",
          "Nombre_período",
          "Nombre",
          "nombre",
          "Descripcion",
          "Descripción",
        ]);

        const startDate = firstText(record, [
          "Fecha_inicio",
          "Fecha_inicial",
          "fecha_inicio",
        ]);

        const endDate = firstText(record, [
          "Fecha_fin",
          "Fecha_final",
          "fecha_fin",
        ]);

        const dates =
          startDate && endDate
            ? ` · ${startDate.slice(0, 10)} → ${endDate.slice(0, 10)}`
            : "";

        return {
          value,
          label: name
            ? `${name} · ${value}${dates}`
            : `Período ${value}${dates}`,
        };
      })
      .filter((option) => option.value)
  );
}

function siteJourneyOptions(records: Q10Record[]): Option[] {
  return uniqueSorted(
    records
      .map((record) => {
        const value = firstText(record, [
          "Consecutivo",
          "consecutivo",
          "Id",
          "id",
        ]);

        const directName = firstText(record, [
          "Nombre_sedejornada",
          "Nombre_sede_jornada",
          "Nombre",
          "nombre",
        ]);

        const site = firstText(record, [
          "Nombre_sede",
          "Sede",
          "sede",
        ]);

        const journey = firstText(record, [
          "Nombre_jornada",
          "Jornada",
          "jornada",
        ]);

        const combined = [site, journey]
          .filter(Boolean)
          .join(" - ");

        const name = directName || combined;

        return {
          value,
          label: name
            ? `${name} · ${value}`
            : `Sede-Jornada ${value}`,
        };
      })
      .filter((option) => option.value)
  );
}

export async function GET() {
  try {
    const [programsRaw, periodsRaw, sitesJourneysRaw] =
      await Promise.all([
        getQ10Programs(100, 1),
        getQ10Periods(),
        getQ10SitesJourneys(100, 1),
      ]);

    const programs = programOptions(
      normalizeRecords(programsRaw)
    );

    const periods = periodOptions(
      normalizeRecords(periodsRaw)
    );

    const sitesJourneys = siteJourneyOptions(
      normalizeRecords(sitesJourneysRaw)
    );

    return NextResponse.json({
      ok: true,
      programs,
      periods,
      sitesJourneys,
    });
  } catch (error) {
    console.error("ERROR CARGANDO CATÁLOGOS Q10:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No fue posible consultar Q10.",
      },
      { status: 500 }
    );
  }
}
