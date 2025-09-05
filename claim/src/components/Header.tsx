import WalletButton from "./WalletButton";

export default function Header() {
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

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
