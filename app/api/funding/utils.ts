import { AssetValues } from "@/lib/funding/assets";

// all formulas here take decimal params and return percentages

// annualize funding paid hourly
export function annualizeHourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 24 * 365 * 100;
}

export function annualizeHourlyQFEXFunding(hourlyFunding: number): number {
  return hourlyFunding * 52 * 120; // 120hrs a week, 52 weeks a year
}

export function annualize8HourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 3 * 365 * 100;
}

export type AssetAndFdg = {
  name: AssetValues;
  funding: number;
};