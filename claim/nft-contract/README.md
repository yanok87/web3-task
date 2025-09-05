# ClaimableNFT - ERC-1155 Contract

A minimal OpenZeppelin-based ERC-1155 contract with claim functionality that matches your API's metadata structure.

## Features

- ✅ **ERC-1155 Standard**: Multi-token standard for efficient batch operations
- ✅ **Claim Function**: `claim(uint256 id, uint256 amount)` - Claim specific NFT
- ✅ **Batch Claim**: `batchClaim(uint256[] ids, uint256[] amounts)` - Claim multiple NFTs at once
- ✅ **URI Function**: `uri(uint256 id)` - Returns metadata URI matching your API
- ✅ **One-time Claim**: Each address can only claim each token once
- ✅ **Max Supply Control**: Set maximum supply per token ID
- ✅ **Owner Controls**: Only owner can set max supply and base URI

## Contract Functions

### Public Functions

- `claim(uint256 id, uint256 amount)` - Claim a specific NFT
- `batchClaim(uint256[] ids, uint256[] amounts)` - Claim multiple NFTs
- `hasClaimed(address account, uint256 id)` - Check if address claimed token
- `totalSupply(uint256 id)` - Get total supply of token ID
- `maxSupply(uint256 id)` - Get max supply of token ID
- `uri(uint256 id)` - Get metadata URI for token ID

### Owner Functions

- `setMaxSupply(uint256 id, uint256 maxSupply_)` - Set max supply for token
- `setBaseURI(string memory baseURI_)` - Update base URI for metadata

## API Integration

The contract's `uri(uint256 id)` function returns:

```
https://mint-api-production-7d50.up.railway.app/nfts/{id}
```

This perfectly matches your existing API structure where:

- Token ID 1 → `https://mint-api-production-7d50.up.railway.app/nfts/1`
- Token ID 2 → `https://mint-api-production-7d50.up.railway.app/nfts/2`
- etc.

## Testing

All tests pass:

```bash
forge test
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Base Sepolia

```bash
# Set your private key
export PRIVATE_KEY=your_private_key_here

# Deploy
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

## Contract Architecture

```
ClaimableNFT
├── ERC1155 (OpenZeppelin)
├── Ownable (OpenZeppelin)
└── Custom Functions
    ├── claim()
    ├── batchClaim()
    ├── hasClaimed()
    ├── setMaxSupply()
    └── uri()
```

## Gas Optimization

- Uses OpenZeppelin's optimized ERC-1155 implementation
- Batch operations for multiple claims
- Efficient storage patterns
- Minimal external calls

## Security Features

- ✅ One-time claim per address per token
- ✅ Max supply enforcement
- ✅ Owner-only administrative functions
- ✅ OpenZeppelin battle-tested contracts
- ✅ No reentrancy vulnerabilities
- ✅ Proper access controls
