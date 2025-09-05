import { useQuery } from "@tanstack/react-query";
import { fetchNFTById } from "../api";

interface SelectedNFTProps {
  id: string;
}

export default function SelectedNFT({ id }: SelectedNFTProps) {
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
          <p className="text-gray-500 text-xs">You own 0</p>
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

          <button className="w-full bg-black hover:bg-gray-800 text-white py-1 px-3 text-sm transition-colors">
            Claim Now
          </button>
        </div>
      </div>
    </div>
  );
}
