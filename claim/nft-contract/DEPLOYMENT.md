# ClaimableNFT Deployment Guide

## Prerequisites

1. **Private Key**: You need a private key with some Base Sepolia ETH for gas fees
2. **Base Sepolia ETH**: Get testnet ETH from [Base Sepolia Faucet](https://bridge.base.org/deposit)
3. **Environment Variables**: Set up your environment variables

## Setup

1. **Create `.env` file**:

```bash
cp .env.example .env
```

2. **Edit `.env` file** with your values:

```bash
PRIVATE_KEY=your_private_key_without_0x_prefix
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_api_key_optional
```

## Deployment Commands

### Deploy to Base Sepolia Testnet

```bash
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify
```

### Deploy without verification

```bash
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast
```

### Deploy and verify later

```bash
# Deploy first
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast

# Verify later (replace with actual contract address)
forge verify-contract <CONTRACT_ADDRESS> src/ClaimableNFT.sol:ClaimableNFT --chain base-sepolia --etherscan-api-key $ETHERSCAN_API_KEY
```

## Contract Features

- **ERC-1155 Standard**: Multi-token standard
- **Claim Function**: `claim(uint256 id, uint256 amount)` - Claim specific NFT
- **Batch Claim**: `batchClaim(uint256[] ids, uint256[] amounts)` - Claim multiple NFTs
- **URI Function**: `uri(uint256 id)` - Returns metadata URI for token ID
- **Max Supply**: Set maximum supply per token ID
- **One-time Claim**: Each address can only claim each token once

## Contract Address

After deployment, the contract address will be displayed in the terminal. Save this address for your frontend integration.

## Integration with Frontend

The contract's `uri(uint256 id)` function returns:

```
https://mint-api-production-7d50.up.railway.app/nfts/{id}
```

This matches your API's metadata structure where each NFT has an ID that corresponds to the token ID.

## Testing the Contract

After deployment, you can test the contract by:

1. **Claiming an NFT**:

```solidity
nft.claim(1, 1); // Claim token ID 1, amount 1
```

2. **Checking if claimed**:

```solidity
bool claimed = nft.hasClaimed(userAddress, 1);
```

3. **Getting metadata URI**:

```solidity
string memory metadataURI = nft.uri(1);
// Returns: https://mint-api-production-7d50.up.railway.app/nfts/1
```
