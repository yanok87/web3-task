pragma solidity ^0.8.20;

import "./MockERC20.sol";

contract Mock4626Vault {
    MockERC20 public immutable asset;
    mapping(address => uint256) public balanceOf;
    uint256 public totalSupply;
    uint256 public maxDepositVal = type(uint256).max;

    constructor(MockERC20 _asset) { asset = _asset; }

    function setMaxDeposit(uint256 v) external { maxDepositVal = v; }

    function maxDeposit(address) external view returns (uint256) {
        return maxDepositVal;
    }

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "zero");
        // pull asset
        asset.transferFrom(msg.sender, address(this), assets);
        // 1:1 shares <-> assets
        shares = assets;
        balanceOf[receiver] += shares;
        totalSupply += shares;
        return shares;
    }
}
