import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchNFTs } from "../api";
import SelectedNFT from "./SelectedNFT";
import NFTGallery from "./NFTGallery";
import CompanyInfoBox from "./CompanyInfoBox";

export default function ClaimNFTPanel() {
  const [selectedId, setSelectedId] = useState<string>("");

  // Fetch all NFTs
  const {
    data: nfts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["nfts"],
    queryFn: fetchNFTs,
    refetchOnWindowFocus: false, // NFT list doesn't change often
  });

  // Set default selected ID to first NFT when data loads
  useEffect(() => {
    if (nfts && nfts.length > 0 && !selectedId) {
      setSelectedId(nfts[0].id);
    }
  }, [nfts, selectedId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-red-500">
            Error loading NFTs: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!nfts || nfts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-500">No NFTs found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Selected NFT Display */}
        {selectedId && <SelectedNFT id={selectedId} />}

        {/* Company Info Box - Aligned with left part of SelectedNFT */}
        <div className="mt-8 mb-10 flex flex-col lg:flex-row lg:gap-8">
          <div className="lg:w-1/2">
            <CompanyInfoBox />
          </div>
          <div className="lg:w-1/2"></div>
        </div>

        {/* NFT Gallery - Show even while loading */}
        {nfts && nfts.length > 0 && (
          <NFTGallery
            nfts={nfts}
            selectedId={selectedId}
            onSelectNFT={setSelectedId}
          />
        )}
      </div>
    </div>
  );
}
