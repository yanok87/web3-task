import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNFTById } from "../api";
import ClaimButton from "./ClaimButton";
import { useAccount, useReadContract } from "wagmi";
import { getContractAddress, isSupportedChain } from "../config/contracts";
import { claimableNFTAbi } from "../abi/ClaimableNFT";
import { useEffect, useState } from "react";
import { useClaimedNFTs } from "../contexts/ClaimedNFTsContext";

interface SelectedNFTProps {
  id: string;
}

export default function SelectedNFT({ id }: SelectedNFTProps) {
  const { address, chainId } = useAccount();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const { isClaimed: isClaimedInContext } = useClaimedNFTs();

  const {
    data: nft,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nft", id],
    queryFn: () => fetchNFTById(id),
  });

  // Check user's balance for this specific NFT
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address:
      address && chainId && isSupportedChain(chainId)
        ? getContractAddress(chainId, "ClaimableNFT")
        : undefined,
    abi: claimableNFTAbi,
    functionName: "balanceOf",
    args: address ? [address, BigInt(id)] : undefined,
    query: {
      refetchOnWindowFocus: true,
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache the data
    },
  });

  // Listen for NFT claimed events and refetch balance
  useEffect(() => {
    const handleNFTClaimed = (event: CustomEvent) => {
      const { tokenId, address: claimedAddress } = event.detail;
      console.log(
        `SelectedNFT ${id} received claim event for token ${tokenId} by ${claimedAddress}`
      );

      // If this is the same NFT and same address, refetch the balance
      if (tokenId === id && claimedAddress === address) {
        console.log(`Refetching balance for NFT ${id}`);
        console.log(`Current balance before refetch:`, balance);

        // Force a new query by updating the refresh key
        setRefreshKey((prev) => prev + 1);
        console.log(`Updated refresh key to force new query`);

        // Clear all queries and force fresh fetch
        queryClient.clear();
        console.log(`Cleared all queries`);

        // Wait a bit then refetch
        setTimeout(() => {
          refetchBalance()
            .then((result) => {
              console.log(`Balance refetch result:`, result);
            })
            .catch((error) => {
              console.error(`Balance refetch error:`, error);
            });
        }, 100);
      }
    };

    window.addEventListener("nftClaimed", handleNFTClaimed as EventListener);

    return () => {
      window.removeEventListener(
        "nftClaimed",
        handleNFTClaimed as EventListener
      );
    };
  }, [id, address, refetchBalance]);

  // Debug logging
  console.log(`SelectedNFT ${id} - balance:`, balance, "address:", address);
  console.log(`SelectedNFT query config:`, {
    address:
      address && chainId && isSupportedChain(chainId)
        ? getContractAddress(chainId, "ClaimableNFT")
        : undefined,
    functionName: "balanceOf",
    args: address ? [address, BigInt(id)] : undefined,
  });

  // Let's also check what the actual contract address is
  const contractAddress =
    address && chainId && isSupportedChain(chainId)
      ? getContractAddress(chainId, "ClaimableNFT")
      : undefined;
  console.log(`SelectedNFT contract address:`, contractAddress);
  console.log(`SelectedNFT chainId:`, chainId);
  console.log(
    `SelectedNFT isSupportedChain:`,
    chainId ? isSupportedChain(chainId) : false
  );

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

  // Console log the returned object
  console.log("NFT Data:", nft);

  // Convert IPFS URL to HTTP URL
  const getImageUrl = (url: string) => {
    if (url.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`;
    }
    return url;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:gap-8">
      {/* Left Column - NFT Image */}
      <div className="lg:w-1/2 flex items-start justify-center">
        <img
          src={getImageUrl(nft.metadata.image)}
          alt={nft.metadata.name}
          className="w-full h-auto"
          onError={(e) => {
            console.error(
              "Image failed to load:",
              getImageUrl(nft.metadata.image)
            );
            e.currentTarget.src =
              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
          }}
          onLoad={() => {
            console.log(
              "Image loaded successfully:",
              getImageUrl(nft.metadata.image)
            );
          }}
        />
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
            You own{" "}
            {address && chainId && isSupportedChain(chainId)
              ? isClaimedInContext(id)
                ? "1"
                : (balance || 0n).toString()
              : "0"}
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
