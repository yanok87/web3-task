/**
 * Convert IPFS URL to HTTP URL for display
 * @param url - The IPFS URL (ipfs://...) or regular HTTP URL
 * @returns HTTP URL that can be used in img src
 */
export function getImageUrl(url: string): string {
  if (url.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
  }
  return url;
}
