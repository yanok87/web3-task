import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getContractAddress, isSupportedChain } from "../config/contracts";
import { claimableNFTAbi } from "../abi/ClaimableNFT";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useClaimedNFTs } from "../contexts/ClaimedNFTsContext";

interface ClaimButtonProps {
  id: string;
}

export default function ClaimButton({ id }: ClaimButtonProps) {
  const { address, chainId } = useAccount();
  const { writeContract, isPending, error, data: hash } = useWriteContract();
  const queryClient = useQueryClient();
  const {
    markAsClaimed,
    isClaimed: isClaimedInContext,
    getTransactionHash,
  } = useClaimedNFTs();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check if user has already claimed this NFT
  const { data: hasClaimed, isLoading: isLoadingClaimed } = useReadContract({
    address:
      address && chainId && isSupportedChain(chainId)
        ? getContractAddress(chainId, "ClaimableNFT")
        : undefined,
    abi: claimableNFTAbi,
    functionName: "hasClaimed",
    args: address ? [address, BigInt(id)] : undefined,
    query: {
      refetchOnWindowFocus: true,
    },
  });

  // Check user's balance for this NFT
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
    },
  });

  // Debug logging
  console.log(
    `ClaimButton NFT ${id} - hasClaimed:`,
    hasClaimed,
    "balance:",
    balance,
    "address:",
    address,
    "isLoadingClaimed:",
    isLoadingClaimed
  );
  console.log(`ClaimButton query config:`, {
    address:
      address && chainId && isSupportedChain(chainId)
        ? getContractAddress(chainId, "ClaimableNFT")
        : undefined,
    functionName: "balanceOf",
    args: address ? [address, BigInt(id)] : undefined,
  });

  // Let's also check what the actual contract address is
  const claimButtonContractAddress =
    address && chainId && isSupportedChain(chainId)
      ? getContractAddress(chainId, "ClaimableNFT")
      : undefined;
  console.log(`ClaimButton contract address:`, claimButtonContractAddress);
  console.log(`ClaimButton chainId:`, chainId);
  console.log(
    `ClaimButton isSupportedChain:`,
    chainId ? isSupportedChain(chainId) : false
  );

  const handleClaim = async () => {
    if (!address || !chainId) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const contractAddress = getContractAddress(chainId, "ClaimableNFT");

      await writeContract({
        address: contractAddress,
        abi: claimableNFTAbi,
        functionName: "claim",
        args: [BigInt(id), 1n], // tokenId and amount (1 for NFT)
      });
    } catch (err) {
      console.error("Claim failed:", err);
    }
  };

  // Get transaction hash from context
  const contextTxHash = getTransactionHash(id);

  // Store transaction hash and refetch balance when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      // Refetch the balance to show updated count immediately
      refetchBalance();
      // Invalidate all balance-related queries to ensure UI consistency
      queryClient.invalidateQueries({
        predicate: (query): boolean => {
          // Invalidate all readContract queries with balanceOf function
          if (query.queryKey[0] === "readContract") {
            const queryConfig = query.queryKey[1];
            if (
              queryConfig &&
              typeof queryConfig === "object" &&
              "functionName" in queryConfig
            ) {
              return queryConfig.functionName === "balanceOf";
            }
          }
          return false;
        },
      });

      // Also invalidate all queries to be safe
      queryClient.invalidateQueries();

      console.log("Invalidated all queries after claim confirmation");
      console.log("Current balance after refetch:", balance);

      // Mark as claimed in context with transaction hash
      markAsClaimed(id, hash);
      console.log(`Marked NFT ${id} as claimed in context with tx hash:`, hash);

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("nftClaimed", {
          detail: { tokenId: id, address, hash },
        })
      );
    }
  }, [isConfirmed, hash, refetchBalance, queryClient]);

  // Don't show button if user is not connected
  if (!address) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-1 px-3 text-sm cursor-not-allowed"
      >
        Connect Wallet to Claim
      </button>
    );
  }

  // Show loading state while checking claim status
  if (isLoadingClaimed) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-1 px-3 text-sm cursor-not-allowed"
      >
        Checking...
      </button>
    );
  }

  // Check if current chain is supported
  if (!chainId || !isSupportedChain(chainId)) {
    return (
      <button
        disabled
        className="w-full bg-red-500 text-white py-1 px-3 text-sm cursor-not-allowed"
      >
        Switch to Base Sepolia
      </button>
    );
  }

  // Check if NFT is claimed (prioritize context over blockchain)
  const isClaimedByContext = isClaimedInContext(id);
  const isClaimedByBlockchain = hasClaimed || (balance && balance > 0n);
  const isClaimed = isClaimedByContext || isClaimedByBlockchain;

  // Show claimed state if NFT is claimed (either by context or blockchain)
  if (isClaimed) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full bg-green-600 text-white py-1 px-3 text-sm cursor-not-allowed"
        >
          ✓ Claimed (1)
        </button>

        {/* Show stored transaction hash if available */}
        {contextTxHash && (
          <div className="text-xs text-center">
            <p className="text-gray-600 mb-1">Transaction Hash:</p>
            <a
              href={`https://sepolia.basescan.org/tx/${contextTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline break-all"
            >
              {contextTxHash.slice(0, 10)}...{contextTxHash.slice(-8)}
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClaim}
        disabled={isPending || isConfirming}
        className="w-full bg-black hover:bg-gray-800 text-white py-1 px-3 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? "Confirming..."
          : isConfirming
            ? "Confirming..."
            : "Claim Now"}
      </button>

      {/* Transaction Hash - Show active hash or stored hash */}
      {(hash || contextTxHash) && (
        <div className="text-xs text-center">
          <p className="text-gray-600 mb-1">Transaction Hash:</p>
          <a
            href={`https://sepolia.basescan.org/tx/${hash || contextTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline break-all"
          >
            {(hash || contextTxHash)?.slice(0, 10)}...
            {(hash || contextTxHash)?.slice(-8)}
          </a>
        </div>
      )}

      {/* Success Message */}
      {isConfirmed && (
        <p className="text-green-600 text-xs text-center">
          ✓ Successfully claimed! Check your wallet.
        </p>
      )}

      {error && (
        <p className="text-red-500 text-xs text-center">
          Error: {error.message}
        </p>
      )}
    </div>
  );
}
