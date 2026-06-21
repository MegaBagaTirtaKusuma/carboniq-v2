export function calculateEmission(quantity: number, emissionFactor: number): number {
  return parseFloat((quantity * emissionFactor).toFixed(4));
}

export function kgToTonne(kg: number): number {
  return parseFloat((kg / 1000).toFixed(6));
}

export function formatEmission(value: number, unit: "kg" | "t" = "kg"): string {
  if (unit === "t") {
    return `${kgToTonne(value).toFixed(4)} tCO2e`;
  }
  return `${value.toFixed(2)} kgCO2e`;
}

export const SCOPE_LABELS: Record<string, string> = {
  scope1: "Scope 1",
  scope2: "Scope 2",
  scope3: "Scope 3",
};

export const SCOPE_COLORS: Record<string, string> = {
  scope1: "#2563eb",
  scope2: "#16a34a",
  scope3: "#d97706",
};
