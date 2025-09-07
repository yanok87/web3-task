import type { NFT } from "../api";
import { getImageUrl } from "../utils/ipfs";
import { useState } from "react";

interface NFTGalleryProps {
  nfts: NFT[];
  selectedId: string;
  onSelectNFT: (id: string) => void;
}

export default function NFTGallery({ nfts, onSelectNFT }: NFTGalleryProps) {
  const [imageStates, setImageStates] = useState<
    Record<string, { loading: boolean; error: boolean }>
  >({});

  const handleImageLoad = (nftId: string) => {
    setImageStates((prev) => ({
      ...prev,
      [nftId]: { loading: false, error: false },
    }));
  };

  const handleImageError = (nftId: string) => {
    setImageStates((prev) => ({
      ...prev,
      [nftId]: { loading: false, error: true },
    }));
  };

  const getImageState = (nftId: string) => {
    return imageStates[nftId] || { loading: true, error: false };
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        More from this collection
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {nfts.map((nft) => {
          const { loading, error } = getImageState(nft.id);

          return (
            <div
              key={nft.id}
              className="flex-shrink-0 cursor-pointer transition-all duration-200"
              onClick={() => onSelectNFT(nft.id)}
            >
              <div className="w-48 h-48 overflow-hidden bg-gray-100 relative">
                {/* Loading Skeleton */}
                {loading && !error && (
                  <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {/* Fallback Image */}
                {error && (
                  <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-500">
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-center">Image unavailable</p>
                  </div>
                )}

                {/* Actual Image */}
                {!error && (
                  <img
                    src={getImageUrl(nft.metadata.image)}
                    alt={nft.metadata.name}
                    className={`w-full h-full object-cover ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
                    onLoad={() => handleImageLoad(nft.id)}
                    onError={() => handleImageError(nft.id)}
                  />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {nft.metadata.name}
                </p>
                <p className="text-xs text-gray-500">0.0 ETH</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
