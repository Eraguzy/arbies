# Todo

- fix extended funding: api returns 403 when the `?market=` url is over ~2.1k chars (~124 markets), registry now has ~330
  - fetch `/info/markets` without filter and filter locally, or chunk the requests
- search bar keywords
- vari swaps: not listed
  - indexes: `US500S`, `US100S`, `US30S`, `US2KS`, `US400S`, `USFNGS`, `CNA50S`, `TWIS`, `VXIP`, `DXIP`
  - commodities: `XAUS`, `XAGS`, `COPPP`, `USOILP`, `UKOILP`, `HOILP`, `GASOLP`, `COCOAP`
- collateral/fx handling: pairs not listed because they are quoted in non-USD with no fx conversion
  - QFEX: `SAMSUNG-KRW`, `SKHYNIX-KRW`, `HYUNDAI-KRW`, `KIOXIA-JPY`, `SOFTBANK-JPY`, `CXMT-CNY`, `UNITREE-CNY`, `SIVE-SEK`
- add history
