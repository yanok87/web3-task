export const BASE_URL = "https://mint-api-production-7d50.up.railway.app";

export const ENDPOINTS = {
  NFTS: "/nfts",
  NFT_BY_ID: (id: string) => `/nfts/${id}`,
} as const;
