import definitions from "./site-content-definitions.json";

export type PagePath = "/" | "/sedes";
export type PageContent = Record<string, string>;
export type ContentField = {
  key: string;
  section: string;
  label: string;
  kind: string;
  defaultValue: string;
  required: boolean;
  maxLength: number;
};
export const PAGE_PATHS: PagePath[] = ["/", "/sedes"];
export const CONTENT_PAGES = definitions as Record<
  PagePath,
  { name: string; fields: ContentField[] }
>;
export function isPagePath(value: unknown): value is PagePath {
  return value === "/" || value === "/sedes";
}
export function defaultContent(path: PagePath): PageContent {
  return Object.fromEntries(
    CONTENT_PAGES[path].fields.map((field) => [field.key, field.defaultValue]),
  );
}
export function safeContentUrl(value: string, image = false): boolean {
  if (!value) return image;
  if (/[\\\u0000-\u0020\u007f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (!image && /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function validateContent(path: PagePath, value: unknown): PageContent {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("El contenido no es válido.");
  const fields = CONTENT_PAGES[path].fields;
  const input = value as Record<string, unknown>;
  if (
    Object.keys(input).some((key) => !fields.some((field) => field.key === key))
  )
    throw new Error(
      "El contenido tiene campos que no corresponden a esta página.",
    );
  const result = defaultContent(path);
  for (const field of fields) {
    const raw = Object.hasOwn(input, field.key)
      ? input[field.key]
      : result[field.key];
    if (
      typeof raw !== "string" ||
      raw.length > field.maxLength ||
      (field.required && !raw.trim())
    )
      throw new Error(`Revisa el campo ${field.label}.`);
    if (
      (field.kind === "link" || field.kind === "image") &&
      !safeContentUrl(raw, field.kind === "image")
    )
      throw new Error(
        `Usa una dirección https:// o una ruta interna válida en ${field.label}.`,
      );
    result[field.key] = raw;
  }
  return result;
}
export function resolveContent(path: PagePath, value: unknown): PageContent {
  try {
    return validateContent(path, value);
  } catch {
    return defaultContent(path);
  }
}
export function cssImage(value: string): string {
  return value && safeContentUrl(value, true)
    ? `url(${JSON.stringify(value)})`
    : "none";
}
