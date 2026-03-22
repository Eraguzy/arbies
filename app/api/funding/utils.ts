import { AssetValues } from "@/lib/funding/assets";

// annualize funding paid hourly
// returns a percentage
export function annualizeHourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 24 * 365 * 100;
  //  return (Math.pow(1 + Number(hourlyFunding), 24 * 365) - 1) * 100;
}

export function annualize8HourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 3 * 365 * 100;
}

export type AssetAndFdg = {
  name: AssetValues;
  funding: number;
};