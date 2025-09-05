export default function CompanyInfoBox() {
  return (
    <div className="bg-white border border-gray-200 p-6">
      {/* Company Identity */}
      <div className="flex items-start space-x-4 mb-4">
        {/* Logo */}
        <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center relative">
          <img
            src="/src/assets/kiln-header-logo.svg"
            alt="Kiln Logo"
            className="w-8 h-8"
          />
          <img
            src="/src/assets/verified.svg"
            alt="Verified"
            className="w-4 h-4 absolute -bottom-0.5 -right-0.5"
          />
        </div>

        {/* Name & Handle */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">KILN</h3>
          <p className="text-xs text-gray-500">@Kiln</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-xs mb-4 leading-relaxed">
        Hundreds of companies use Kiln to earn rewards on their digital assets,
        or to whitelabel earning functionality into their products.
      </p>

      {/* Social Media Links */}
      <div className="flex items-center space-x-6 mb-4">
        {/* Twitter */}
        <div className="flex items-center space-x-1">
          <img
            src="/src/assets/twitter.svg"
            alt="Twitter"
            className="w-4 h-4"
          />
          <span className="text-xs text-gray-900">@Kiln</span>
        </div>

        {/* Instagram */}
        <div className="flex items-center space-x-1">
          <img
            src="/src/assets/instagram.svg"
            alt="Instagram"
            className="w-4 h-4"
          />
          <span className="text-xs text-gray-900">@Kiln</span>
        </div>
      </div>

      {/* Website Button */}
      <div className="flex items-center space-x-1">
        <a
          href="https://www.kiln.fi/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-gray-800 hover:bg-gray-900 text-white px-4 py-1 text-xs transition-colors text-center block"
        >
          Website
        </a>
        <div className="h-6 bg-white border border-gray-300 flex items-center justify-center flex-shrink-0 px-1">
          <img
            src="/src/assets/link.svg"
            alt="External link"
            className="h-4 w-4"
          />
        </div>
      </div>
    </div>
  );
}
