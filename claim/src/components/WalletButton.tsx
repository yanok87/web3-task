import type { Connector } from "wagmi";

interface WalletButtonProps {
  connector: Connector;
  onClick: () => void;
  disabled?: boolean;
}

export default function WalletButton({
  connector,
  onClick,
  disabled,
}: WalletButtonProps) {
  const getWalletIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "metamask":
        return "🦊";
      case "injected":
        return "💼";
      default:
        return "🔌";
    }
  };

  const getWalletName = (name: string) => {
    switch (name.toLowerCase()) {
      case "injected":
        return "Browser Wallet";
      default:
        return name;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center space-x-3 py-4 px-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-2xl">{getWalletIcon(connector.name)}</span>
      <span className="font-medium text-gray-900">
        {getWalletName(connector.name)}
      </span>
      {disabled && (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
    </button>
  );
}
