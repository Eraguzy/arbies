# Adding a DEX

### 1) Create the `Dex` object

Create `lib/funding/dexes/{dex}.ts` and export a `Dex` object.

```ts
export const NewDex = {
  Name: "NewDex",
  PairRegistry: NewDexPairRegistry,
  ApiUrl: "https://api.example.com",
  ApiUrlEndpoints: {
    funding: "/funding",
  },

  async GetCurrentFunding(request: NextRequest) {
    // write your get req
  },

  GetHstyFunding(request: NextRequest) {
    // write your get req
  },
} satisfies Dex
```

Fields to fill:

- `Name`: DEX name, also add it to `DexName` in `lib/funding/dexes/arbies.ts`.
- `PairRegistry`: maps API symbols to local `ArbiesAssets`.
- `ApiUrl`: API base URL.
- `ApiUrlEndpoints`: endpoint paths or builders.
- `GetCurrentFunding`: fetches current funding and returns `AssetAndFdg[]`.
- `GetHstyFunding`: placeholder for history funding.


### 2) Register the DEX
Register the DEX in `lib/funding/dexes/arbies.ts`:

- import the DEX object;
- add it to `AllDexes`;
- add its pair registry to `DexesPairsMapping`.


### 3) Create the API route:

`app/api/funding/{dex}/funding/route.ts`

```ts
import { NextRequest } from "next/server";
import { NewDex } from "@/lib/funding/dexes/newdex";

export async function GET(request: NextRequest) {
  return NewDex.GetCurrentFunding(request);
}
```