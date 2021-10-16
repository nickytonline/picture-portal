const main = async () => {
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();
  console.log('Contract addy:', waveContract.address);

  let artRequestsCount;
  artRequestsCount = await waveContract.getTotalArtRequests();
  console.log(artRequestsCount.toNumber());

  /**
   * Let's send a few waves!
   */
  let waveTxn = await waveContract.askForArt('A message!');
  await waveTxn.wait(); // Wait for the transaction to be mined

  const [_, randomPerson] = await hre.ethers.getSigners();
  waveTxn = await waveContract
    .connect(randomPerson)
    .askForArt('Another message!');
  await waveTxn.wait(); // Wait for the transaction to be mined

  let allArtRequests = await waveContract.getArtRequests();
  console.log(allArtRequests);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
