npx hardhat run scripts/deploy.js --network rinkeby
mv artifacts/contracts/WavePortal.sol/WavePortal.json utils
git add utils/WavePortal.json
echo "\n****************"
echo "Remember to update your contract address in the UI!"
echo "****************"