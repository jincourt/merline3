export const SWISS_CANTONS = [
  { code: "AG", label: "Argovie" },
  { code: "AI", label: "Appenzell Rhodes-Intérieures" },
  { code: "AR", label: "Appenzell Rhodes-Extérieures" },
  { code: "BE", label: "Berne" },
  { code: "BL", label: "Bâle-Campagne" },
  { code: "BS", label: "Bâle-Ville" },
  { code: "FR", label: "Fribourg" },
  { code: "GE", label: "Genève" },
  { code: "GL", label: "Glaris" },
  { code: "GR", label: "Grisons" },
  { code: "JU", label: "Jura" },
  { code: "LU", label: "Lucerne" },
  { code: "NE", label: "Neuchâtel" },
  { code: "NW", label: "Nidwald" },
  { code: "OW", label: "Obwald" },
  { code: "SG", label: "Saint-Gall" },
  { code: "SH", label: "Schaffhouse" },
  { code: "SO", label: "Soleure" },
  { code: "SZ", label: "Schwytz" },
  { code: "TG", label: "Thurgovie" },
  { code: "TI", label: "Tessin" },
  { code: "UR", label: "Uri" },
  { code: "VD", label: "Vaud" },
  { code: "VS", label: "Valais" },
  { code: "ZG", label: "Zoug" },
  { code: "ZH", label: "Zurich" },
] as const;

export type SwissCantonCode = (typeof SWISS_CANTONS)[number]["code"];

export const VALID_SWISS_CANTON_CODES: SwissCantonCode[] = SWISS_CANTONS.map(
  (canton) => canton.code,
);

export function isValidSwissCantonCode(value: string): value is SwissCantonCode {
  return VALID_SWISS_CANTON_CODES.includes(value as SwissCantonCode);
}
