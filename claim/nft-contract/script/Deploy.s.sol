// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ClaimableNFT} from "../src/ClaimableNFT.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with the account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the ClaimableNFT contract
        // Base URI should point to your API endpoint
        string memory baseURI = "https://mint-api-production-7d50.up.railway.app/nfts/";
        
        ClaimableNFT nft = new ClaimableNFT(baseURI, deployer);
        
        console.log("ClaimableNFT deployed to:", address(nft));
        
        // Set max supply for some tokens (optional)
        // nft.setMaxSupply(1, 1000); // Max 1000 of token ID 1
        
        vm.stopBroadcast();
        
        console.log("Deployment completed!");
    }
}
