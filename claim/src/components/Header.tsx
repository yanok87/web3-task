import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";

export default function Header() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    // Connect to the first available connector (MetaMask or injected)
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  return (
    <header className="bg-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Kiln Logo */}
          <div className="flex items-center">
            <img
              src="/src/assets/kiln-header-logo.svg"
              alt="Kiln Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Wallet Section */}
          {isConnected ? (
            <div className="flex items-center space-x-4">
              {/* Balance */}
              {balance && (
                <span className="text-sm text-gray-700 font-medium">
                  {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </span>
              )}

              {/* Address */}
              <span className="text-sm text-gray-600 font-mono bg-gray-200 px-2 py-1 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>

              {/* Disconnect Button */}
              <button
                onClick={() => disconnect()}
                className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            /* Connect Wallet Button */
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-1 px-3 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
