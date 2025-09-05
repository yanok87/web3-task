import React, { createContext, useContext, useState, ReactNode } from "react";

interface ClaimedNFTsContextType {
  claimedNFTs: Set<string>;
  transactionHashes: Map<string, string>; // NFT ID -> Transaction Hash
  markAsClaimed: (nftId: string, txHash?: string) => void;
  isClaimed: (nftId: string) => boolean;
  getTransactionHash: (nftId: string) => string | undefined;
}

const ClaimedNFTsContext = createContext<ClaimedNFTsContextType | undefined>(
  undefined
);

export function ClaimedNFTsProvider({ children }: { children: ReactNode }) {
  const [claimedNFTs, setClaimedNFTs] = useState<Set<string>>(new Set());
  const [transactionHashes, setTransactionHashes] = useState<
    Map<string, string>
  >(new Map());

  const markAsClaimed = (nftId: string, txHash?: string) => {
    setClaimedNFTs((prev) => new Set(prev).add(nftId));
    if (txHash) {
      setTransactionHashes((prev) => new Map(prev).set(nftId, txHash));
    }
  };

  const isClaimed = (nftId: string) => {
    return claimedNFTs.has(nftId);
  };

  const getTransactionHash = (nftId: string) => {
    return transactionHashes.get(nftId);
  };

  return (
    <ClaimedNFTsContext.Provider
      value={{
        claimedNFTs,
        transactionHashes,
        markAsClaimed,
        isClaimed,
        getTransactionHash,
      }}
    >
      {children}
    </ClaimedNFTsContext.Provider>
  );
}

export function useClaimedNFTs() {
  const context = useContext(ClaimedNFTsContext);
  if (context === undefined) {
    throw new Error("useClaimedNFTs must be used within a ClaimedNFTsProvider");
  }
  return context;
}
