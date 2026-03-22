// annualize funding paid hourly
// returns a percentage
export function annualizeHourlyFunding(hourlyFunding: number): number {
  return hourlyFunding * 24 * 365 * 100;
}