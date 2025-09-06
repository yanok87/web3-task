import type { NFT } from "../api";
import { getImageUrl } from "../utils/ipfs";

interface NFTGalleryProps {
  nfts: NFT[];
  selectedId: string;
  onSelectNFT: (id: string) => void;
}

export default function NFTGallery({ nfts, onSelectNFT }: NFTGalleryProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        More from this collection
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {nfts.map((nft) => (
          <div
            key={nft.id}
            className="flex-shrink-0 cursor-pointer transition-all duration-200"
            onClick={() => onSelectNFT(nft.id)}
          >
            <div className="w-48 h-48 overflow-hidden bg-gray-100">
              <img
                src={getImageUrl(nft.metadata.image)}
                alt={nft.metadata.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-medium text-gray-900">
                {nft.metadata.name}
              </p>
              <p className="text-xs text-gray-500">0.0 ETH</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
