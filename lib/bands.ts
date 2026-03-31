export interface Band {
  name: string;
  min: number;
  max: number;
  weight: number;
}

export const BANDS: Band[] = [
  { name: "A", min: 1, max: 3, weight: 0.25 },
  { name: "B", min: 4, max: 6, weight: 0.25 },
  { name: "C", min: 7, max: 10, weight: 0.20 },
  { name: "D", min: 11, max: 15, weight: 0.18 },
  { name: "E", min: 16, max: 20, weight: 0.12 },
];

export function getBand(rank: number): string {
  for (const band of BANDS) {
    if (rank >= band.min && rank <= band.max) return band.name;
  }
  return "E";
}

export interface ChoiceLike {
  rank: number;
}

export function rollResult(choices: ChoiceLike[]): number {
  const filledRanks = new Set(choices.map((c) => c.rank));

  // Build eligible bands (those with at least one filled choice)
  const eligibleBands = BANDS.filter((band) =>
    choices.some((c) => c.rank >= band.min && c.rank <= band.max)
  );

  if (eligibleBands.length === 0) {
    // Fallback: return rank of first choice
    return choices[0]?.rank ?? 1;
  }

  // Normalise weights
  const totalWeight = eligibleBands.reduce((sum, b) => sum + b.weight, 0);
  let roll = Math.random() * totalWeight;

  let selectedBand = eligibleBands[eligibleBands.length - 1];
  for (const band of eligibleBands) {
    roll -= band.weight;
    if (roll <= 0) {
      selectedBand = band;
      break;
    }
  }

  // Pick a random filled choice within the selected band
  const bandChoices = choices
    .map((c) => c.rank)
    .filter((r) => r >= selectedBand.min && r <= selectedBand.max && filledRanks.has(r));

  return bandChoices[Math.floor(Math.random() * bandChoices.length)];
}
