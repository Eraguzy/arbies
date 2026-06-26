import { AssetValues } from "@/lib/funding/assets";

// all formulas here take decimal params and return percentages

// annualize funding paid hourly
export function annualizeHourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 24 * 365 * 100;
}

export function annualizeExactHourlyFunding(hourlyFunding: number): number {
  return (Math.pow(1 + Number(hourlyFunding), 24 * 365) - 1) * 100;
}

export function annualize8HourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 3 * 365 * 100;
}

export type AssetAndFdg = {
  name: AssetValues;
  funding: number;
};