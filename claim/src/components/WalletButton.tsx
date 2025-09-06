import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { formatUnits } from "viem";
import { baseSepolia } from "wagmi/chains";

export default function WalletButton() {
  const { address, isConnected, chainId } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const handleConnect = async () => {
    // Connect to the first available connector (MetaMask or injected)
    const connector = connectors[0];
    if (connector) {
      try {
        await connect({ connector });
        // After connecting, switch to Base Sepolia if not already on it
        if (chainId !== baseSepolia.id) {
          await switchChain({ chainId: baseSepolia.id });
        }
      } catch (error) {
        console.error("Connection failed:", error);
      }
    }
  };

  const handleSwitchChain = () => {
    switchChain({ chainId: baseSepolia.id });
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        {/* Chain Info */}
        <span className="text-xs text-gray-600">
          {chainId === baseSepolia.id ? "Base Sepolia" : `Chain ${chainId}`}
        </span>

        {/* Balance */}
        {balance && (
          <span className="text-xs text-gray-700">
            {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(
              10
            )}{" "}
            {balance.symbol}
          </span>
        )}

        {/* Address */}
        <span className="text-xs text-gray-600 font-mono bg-gray-200 px-2 py-1">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>

        {/* Switch Chain Button (if not on Base Sepolia) */}
        {chainId !== baseSepolia.id && (
          <button
            onClick={handleSwitchChain}
            disabled={isSwitching}
            className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 text-xs transition-colors disabled:opacity-50"
          >
            {isSwitching ? "Switching..." : "Switch to Base Sepolia"}
          </button>
        )}

        {/* Disconnect Button */}
        <button
          onClick={() => disconnect()}
          className="bg-gray-800 hover:bg-gray-900 text-white py-1 px-3 text-xs transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="bg-gray-800 hover:bg-gray-900 text-white py-1 px-3 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
