import { useQuery } from "@tanstack/react-query";
import { fetchNFTById } from "../api";
import ClaimButton from "./ClaimButton";
import { useAccount, useReadContract } from "wagmi";
import { getContractAddress, isSupportedChain } from "../config/contracts";
import { claimableNFTAbi } from "../abi/ClaimableNFT";
import { getImageUrl } from "../utils/ipfs";
import { useState } from "react";

interface SelectedNFTProps {
  id: string;
}

export default function SelectedNFT({ id }: SelectedNFTProps) {
  const { address, chainId } = useAccount();
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Check contract for NFT balance on mount
  const { data: NFTbalance, error: NFTbalanceError } = useReadContract({
    address:
      address && chainId && isSupportedChain(chainId)
        ? getContractAddress(chainId, "ClaimableNFT")
        : undefined,
    abi: claimableNFTAbi,
    functionName: "balanceOf",
    args: address ? [address, BigInt(id)] : undefined,
    query: {
      enabled: !!address && !!chainId && isSupportedChain(chainId),
    },
  });

  const {
    data: nft,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => fetchNFTById(id),
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-xl p-8">
        <div className="text-center text-red-500">
          Error loading NFT: {error.message}
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="bg-white shadow-xl p-8">
        <div className="text-center text-gray-500">NFT not found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Left Column - NFT Image */}
      <div className="lg:w-1/2 flex items-start justify-center mb-8 lg:mb-0">
        <div className="relative w-full">
          {/* Loading Skeleton */}
          {imageLoading && !imageError && (
            <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Fallback Image */}
          {imageError && (
            <div className="w-full h-96 bg-gray-100 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16 mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm font-medium">Image not available</p>
              <p className="text-xs text-gray-400 mt-1">NFT #{id}</p>
            </div>
          )}

          {/* Actual Image */}
          {!imageError && (
            <img
              src={getImageUrl(nft.metadata.image)}
              alt={nft.metadata.name}
              className={`w-full h-auto ${imageLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                console.error(
                  "Image failed to load:",
                  getImageUrl(nft.metadata.image)
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Right Column - NFT Details */}
      <div className="lg:w-1/2 relative">
        {/* Action Icons */}
        <div className="absolute  right-6 flex space-x-2">
          <button className="w-8 h-8 bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50">
            <img src="/src/assets/share.svg" alt="Share" className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50">
            <img src="/src/assets/like.svg" alt="Like" className="w-4 h-4" />
          </button>
        </div>

        {/* Title and Ownership */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {nft.metadata.name}
          </h1>
          <p className="text-gray-500 text-xs">
            You own {NFTbalance && NFTbalance > 0n ? "1" : "0"}
            {NFTbalanceError && (
              <span className="text-red-500 ml-2">
                (Unable to check ownership)
              </span>
            )}
          </p>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-gray-600 leading-relaxed text-sm">
            {nft.metadata.description}
          </p>
        </div>

        {/* Attributes */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4">
            {nft.metadata.attributes.map((attr, index) => (
              <div key={index} className="border border-gray-200 p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {attr.trait_type}
                </div>
                <div className="text-gray-500 text-xs">{attr.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Minting Info and Claim Button */}
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="bg-black text-white text-xs px-2 py-1 inline-block">
              Free Mint
            </span>
            <div className="text-xl font-bold text-gray-900">Ξ 0 ETH</div>
          </div>

          <ClaimButton id={id} />
        </div>
      </div>
    </div>
  );
}
