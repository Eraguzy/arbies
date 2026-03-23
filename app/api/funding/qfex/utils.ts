export const QfexApiUrl = 'https://api.qfex.com';

// elliot uses paths
export const QfexApiUrlEndpoints = {
  symbolsMetrics: '/symbols/metrics',
  fundingHsty: '/funding', // /funding/{symbol}
};
// WIP : i requested them to add a get funding feature
// https://docs.qfex.com/api-reference/rest/market-data/symbol-metrics