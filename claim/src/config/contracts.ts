// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  // Base Sepolia testnet
  [84532]: {
    ClaimableNFT: "0xCfF851B047da6431d228F0f8534B05166Ee88D13" as const,
  },
} as const;

// Helper function to get contract address for current chain
export function getContractAddress(
  chainId: number,
  contractName: keyof (typeof CONTRACT_ADDRESSES)[84532]
) {
  const chainContracts =
    CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!chainContracts) {
    throw new Error(
      `No contracts found for chain ID ${chainId}. Please switch to Base Sepolia (Chain ID: 84532)`
    );
  }
  return chainContracts[contractName];
}

// Check if the current chain is supported
export function isSupportedChain(chainId: number): boolean {
  return chainId in CONTRACT_ADDRESSES;
}

// Get the supported chain IDs
export function getSupportedChainIds(): number[] {
  return Object.keys(CONTRACT_ADDRESSES).map(Number);
}
