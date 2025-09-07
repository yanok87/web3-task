import {
  useAccount,
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getContractAddress, isSupportedChain } from "../config/contracts";
import { claimableNFTAbi } from "../abi/ClaimableNFT";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ClaimButtonProps {
  id: string;
}

export default function ClaimButton({ id }: ClaimButtonProps) {
  const { address, chainId } = useAccount();
  const { writeContract, isPending, error, data: hash } = useWriteContract();
  const [txHash, setTxHash] = useState<string>("");
  const queryClient = useQueryClient();

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Check contract for NFT balance
  const { data: NFTbalance, refetch: refetchNFTbalance } = useReadContract({
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

  // Reset txHash when NFT ID changes
  useEffect(() => {
    setTxHash("");
  }, [id]);

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

  // Update local state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash);

      // Wait a moment for blockchain state to update, then refresh
      setTimeout(() => {
        // Invalidate all queries to trigger refetch
        queryClient.invalidateQueries();

        // Explicitly refetch the NFT balance
        refetchNFTbalance();
      }, 1000); // 1 second delay to allow blockchain state to update
    }
  }, [isConfirmed, hash, queryClient, refetchNFTbalance]);

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

  // Show claimed state if NFT is claimed
  if (NFTbalance && NFTbalance > 0n) {
    return (
      <div className="space-y-2">
        <button
          disabled
          className="w-full bg-green-600 text-white py-1 px-3 text-sm cursor-not-allowed"
        >
          ✓ Claimed (1)
        </button>

        {/* Show stored transaction hash if available */}
        {txHash && (
          <div className="text-xs text-center">
            <p className="text-gray-600 mb-1">Transaction Hash:</p>
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline break-all"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
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

      {error && (
        <div className="text-red-500 text-xs text-center space-y-1">
          <p className="font-medium">Transaction Failed</p>
          <p className="text-gray-600">
            {error.message.includes("User rejected")
              ? "You rejected the transaction in your wallet"
              : error.message.includes("insufficient funds")
                ? "Insufficient funds for gas fees"
                : error.message.includes("execution reverted")
                  ? "Transaction reverted - NFT may already be claimed"
                  : error.message}
          </p>
        </div>
      )}
    </div>
  );
}
