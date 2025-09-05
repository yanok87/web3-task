import { BASE_URL, ENDPOINTS } from "./urls";
import type { NFT } from "../types";

/**
 * Fetch all NFTs from the API
 * @returns Promise<NFT[]> - Array of all NFTs
 */
export async function fetchNFTs(): Promise<NFT[]> {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.NFTS}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch NFTs: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch a single NFT by ID from the API
 * @param id - The NFT ID
 * @returns Promise<NFT> - Single NFT data
 */
export async function fetchNFTById(id: string): Promise<NFT> {
  const response = await fetch(`${BASE_URL}${ENDPOINTS.NFT_BY_ID(id)}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch NFT ${id}: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
