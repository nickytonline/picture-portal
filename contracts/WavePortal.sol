// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import 'hardhat/console.sol';

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;

    /*
     * A little magic, Google what events are in Solidity!
     */
    event NewWave(
        address indexed from,
        uint256 timestamp,
        string message,
        string imageUrl
    );

    /*
     * I created a struct here named Wave.
     * A struct is basically a custom datatype where we can customize what we want to hold inside it.
     */
    struct Wave {
        address waver; // The address of the user who waved.
        string message; // The message the user sent.
        uint256 timestamp; // The timestamp when the user waved.
        string imageUrl; // The image URL they got.
    }

    /*
     * I declare a variable waves that lets me store an array of structs.
     * This is what lets me hold all the waves anyone ever sends to me!
     */
    Wave[] waves;

    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastWavedAt;

    constructor() payable {
        console.log('This contract is dope and has some neurons!');
    }

    /*
     * You'll notice I changed the wave function a little here as well and
     * now it requires a string called _message. This is the message our user
     * sends us from the frontend!
     */
    function askForArt(string memory _message, string memory _imageUrl) public {
        /*
         * We need to make sure the current timestamp is at least 15-minutes bigger than the last timestamp we stored
         */
        require(
            lastWavedAt[msg.sender] + 15 minutes < block.timestamp,
            'Wait 15m'
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log(unicode'%s requested to view some art! 🎨', msg.sender);

        /*
         * This is where I actually store the wave data in the array.
         */
        waves.push(Wave(msg.sender, _message, block.timestamp, _imageUrl));

        /*
         * Generate a Psuedo random number between 0 and 100
         */
        uint256 randomNumber = (block.difficulty + block.timestamp + seed) %
            100;
        console.log('Random # generated: %s', randomNumber);

        seed = randomNumber;

        /*
         * Give a 50% chance that the user wins the prize.
         */
        if (randomNumber < 50) {
            console.log('%s won!', msg.sender);

            /*
             * The same code we had before to send the prize.
             */
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                'Trying to withdraw more money than the contract has.'
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}('');
            require(success, 'Failed to withdraw money from contract.');
        }

        /*
         * I added some fanciness here, Google it and try to figure out what it is!
         * Let me know what you learn in #general-chill-chat
         */
        emit NewWave(msg.sender, block.timestamp, _message, _imageUrl);
    }

    /*
     * I added a function getAllWaves which will return the struct array, waves, to us.
     * This will make it easy to retrieve the waves from our website!
     */
    function getArtRequests() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalArtRequests() public view returns (uint256) {
        // Optional: Add this line if you want to see the contract print the value!
        // We'll also print it over in run.js as well.
        console.log(unicode'We have %d total art requests! 🎨', totalWaves);
        return totalWaves;
    }
}
