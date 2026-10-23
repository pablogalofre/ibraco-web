/** Normalize the campus name for display without changing stored integration values. */
export function displayCampusText(value: string | null | undefined): string {
  return (value || "").replace(/\b(?:citi[\s-]*u|city[\s-]*u)\b/gi, "CityU");
}
