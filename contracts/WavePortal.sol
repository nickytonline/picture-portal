// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
    uint256 totalArtRequests;

    constructor() {
        console.log('This contract is dope and has some neurons!');
    }

    function askForArt() public {
        totalArtRequests += 1;
        console.log(unicode'%s requested some art! 🎨', msg.sender);
    }

    function getTotalArtRequests() public view returns (uint256) {
        console.log(
            unicode'We have %d total art requests! 🎨',
            totalArtRequests
        );
        return totalArtRequests;
    }
}
