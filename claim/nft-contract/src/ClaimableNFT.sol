// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ClaimableNFT is ERC1155, Ownable {
    using Strings for uint256;
    
    // Base URI for metadata
    string private _baseURI;
    
    // Note: We use _balances from ERC1155 instead of separate _claimed mapping
    
    // Mapping to track total supply per token ID
    mapping(uint256 => uint256) private _totalSupply;
    
    // Mapping to track max supply per token ID (0 = unlimited)
    mapping(uint256 => uint256) private _maxSupply;
    
    // Events
    event TokenClaimed(address indexed account, uint256 indexed id, uint256 amount);
    event MaxSupplySet(uint256 indexed id, uint256 maxSupply);
    
    constructor(
        string memory baseURI_,
        address initialOwner
    ) ERC1155("") Ownable(initialOwner) {
        _baseURI = baseURI_;
    }
    
    /**
     * @dev Claim a specific NFT token
     * @param id The token ID to claim
     * @param amount The amount to claim (usually 1 for NFTs)
     */
    function claim(uint256 id, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender, id) == 0, "Token already claimed by this address");
        
        // Check max supply if set
        if (_maxSupply[id] > 0) {
            require(_totalSupply[id] + amount <= _maxSupply[id], "Exceeds max supply");
        }
        
        // Update total supply
        _totalSupply[id] += amount;
        
        // Mint the token
        _mint(msg.sender, id, amount, "");
        
        emit TokenClaimed(msg.sender, id, amount);
    }
    
    /**
     * @dev Check if an address has claimed a specific token
     * @param account The address to check
     * @param id The token ID
     * @return claimed Whether the token has been claimed
     */
    function hasClaimed(address account, uint256 id) external view returns (bool claimed) {
        return balanceOf(account, id) > 0;
    }
    
    /**
     * @dev Get the total supply of a token ID
     * @param id The token ID
     * @return supply The total supply
     */
    function totalSupply(uint256 id) external view returns (uint256 supply) {
        return _totalSupply[id];
    }
    
    /**
     * @dev Get the max supply of a token ID
     * @param id The token ID
     * @return maxSupply The max supply (0 = unlimited)
     */
    function maxSupply(uint256 id) external view returns (uint256) {
        return _maxSupply[id];
    }
    
    /**
     * @dev Set the max supply for a token ID (only owner)
     * @param id The token ID
     * @param maxSupply_ The max supply (0 = unlimited)
     */
    function setMaxSupply(uint256 id, uint256 maxSupply_) external onlyOwner {
        _maxSupply[id] = maxSupply_;
        emit MaxSupplySet(id, maxSupply_);
    }
    
    /**
     * @dev Set the base URI for metadata (only owner)
     * @param baseURI_ The new base URI
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURI = baseURI_;
    }
    
    /**
     * @dev Get the URI for a specific token ID
     * @param id The token ID
     * @return The token URI
     */
    function uri(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(_baseURI, id.toString()));
    }
    
    /**
     * @dev Batch claim multiple tokens
     * @param ids Array of token IDs to claim
     * @param amounts Array of amounts to claim
     */
    function batchClaim(uint256[] calldata ids, uint256[] calldata amounts) external {
        require(ids.length == amounts.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < ids.length; i++) {
            require(amounts[i] > 0, "Amount must be greater than 0");
            require(balanceOf(msg.sender, ids[i]) == 0, "Token already claimed by this address");
            
            // Check max supply if set
            if (_maxSupply[ids[i]] > 0) {
                require(_totalSupply[ids[i]] + amounts[i] <= _maxSupply[ids[i]], "Exceeds max supply");
            }
            
            // Update total supply
            _totalSupply[ids[i]] += amounts[i];
            
            emit TokenClaimed(msg.sender, ids[i], amounts[i]);
        }
        
        // Mint all tokens at once
        _mintBatch(msg.sender, ids, amounts, "");
    }
}
