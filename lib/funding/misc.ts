import type { DexName } from "@/lib/funding/dexes/arbies";

export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// how a call to a DEX api failed
type DexApiErrorKind = "timeout" | "network" | "http" | "invalid-json";

// map fetch / json error to DexApiError kind
function errorKind(err: unknown): DexApiErrorKind {
  if (err instanceof Error && err.name === "TimeoutError") return "timeout"; // AbortSignal.timeout()
  if (err instanceof SyntaxError) return "invalid-json"; // res.json()
  return "network"; // "fetch failed"
}

// call to dex api fails
export class DexApiError extends Error {
  readonly kind: DexApiErrorKind;

  constructor(
    dex: DexName,
    url: string,
    kind: DexApiErrorKind,
    options?: { status?: number; cause?: unknown },
  ) {
    super(
      dex + " API " + kind + " error" + (options?.status ? " (HTTP " + options.status + ")" : "") + ": " + url,
      options,
    );
    this.kind = kind;
  }
}

/** Fetch a dex api and parse its body
 * @throws DexApiError
 */
export async function fetchDexJSON(dex: DexName, url: string, options: RequestInit, timeoutMs: number) {
  let res: Response;

  try {
    res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    throw new DexApiError(dex, url, errorKind(err), { cause: err });
  }

  if (!res.ok) throw new DexApiError(dex, url, "http", { status: res.status });

  try {
    return await res.json();
  } catch (err) {
    throw new DexApiError(dex, url, errorKind(err), { cause: err });
  }
}

/** keep fundings from settled promises
 * @throws DexApiError if every call failed. 
 * a timeout is ignored if there is at least one other kind of error
 */
export function settledToFundings<T>(dex: DexName, settled: PromiseSettledResult<T>[]): T[] {
  const values: T[] = [];
  const errors: DexApiError[] = [];
  const kinds: Partial<Record<DexApiErrorKind, number>> = {}; // failed calls count per kind

  for (const result of settled) {
    if (result.status === "fulfilled") {
      values.push(result.value);
      continue;
    }

    const err: unknown = result.reason;
    if (!(err instanceof DexApiError)) throw err; // error on arbies side

    errors.push(err);
    kinds[err.kind] = (kinds[err.kind] ?? 0) + 1;
  }
  if (errors.length === 0) return values;

  console.error(dex + ": " + errors.length + "/" + settled.length + " API calls failed", kinds, errors[0]);
  if (errors.length === settled.length) throw errors.find((err) => err.kind !== "timeout") ?? errors[0]; // every call failed: the dex is down

  return values;
}
