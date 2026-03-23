export const ZoApiUrl = "https://zo-mainnet.n1.xyz";

export const ZoApiUrlEndpoints = {
  info: "/info", // contains ticker, id
  stats: (id: number) => `/market/${id}/stats`, // contains funding rate
}