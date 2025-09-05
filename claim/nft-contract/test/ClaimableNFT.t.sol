// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ClaimableNFT} from "../src/ClaimableNFT.sol";

contract ClaimableNFTTest is Test {
    ClaimableNFT public nft;
    address public owner;
    address public user1;
    address public user2;
    
    string constant BASE_URI = "https://mint-api-production-7d50.up.railway.app/nfts/";
    
    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vm.prank(owner);
        nft = new ClaimableNFT(BASE_URI, owner);
    }
    
    function testInitialState() public {
        assertEq(nft.owner(), owner);
        assertEq(nft.maxSupply(1), 0); // 0 means unlimited
        assertEq(nft.totalSupply(1), 0);
        assertFalse(nft.hasClaimed(user1, 1));
    }
    
    function testClaim() public {
        vm.prank(user1);
        nft.claim(1, 1);
        
        assertEq(nft.balanceOf(user1, 1), 1);
        assertEq(nft.totalSupply(1), 1);
        assertTrue(nft.hasClaimed(user1, 1));
    }
    
    function testCannotClaimTwice() public {
        vm.prank(user1);
        nft.claim(1, 1);
        
        vm.prank(user1);
        vm.expectRevert("Token already claimed by this address");
        nft.claim(1, 1);
    }
    
    function testMaxSupply() public {
        vm.prank(owner);
        nft.setMaxSupply(1, 2);
        
        vm.prank(user1);
        nft.claim(1, 1);
        
        vm.prank(user2);
        nft.claim(1, 1);
        
        // Third claim should fail
        address user3 = makeAddr("user3");
        vm.prank(user3);
        vm.expectRevert("Exceeds max supply");
        nft.claim(1, 1);
    }
    
    function testURI() public {
        string memory expectedURI = string(abi.encodePacked(BASE_URI, "1"));
        assertEq(nft.uri(1), expectedURI);
    }
    
    function testBatchClaim() public {
        uint256[] memory ids = new uint256[](2);
        uint256[] memory amounts = new uint256[](2);
        
        ids[0] = 1;
        ids[1] = 2;
        amounts[0] = 1;
        amounts[1] = 1;
        
        vm.prank(user1);
        nft.batchClaim(ids, amounts);
        
        assertEq(nft.balanceOf(user1, 1), 1);
        assertEq(nft.balanceOf(user1, 2), 1);
        assertTrue(nft.hasClaimed(user1, 1));
        assertTrue(nft.hasClaimed(user1, 2));
    }
    
    function testOnlyOwnerCanSetMaxSupply() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setMaxSupply(1, 100);
    }
    
    function testOnlyOwnerCanSetBaseURI() public {
        vm.prank(user1);
        vm.expectRevert();
        nft.setBaseURI("https://new-uri.com/");
    }
}
