const main = async () => {
  const [owner, randomPerson] = await hre.ethers.getSigners();
  const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
  const waveContract = await waveContractFactory.deploy();
  await waveContract.deployed();

  console.log('Contract deployed to:', waveContract.address);
  console.log('Contract deployed by:', owner.address);

  let artRequestsCount;
  artRequestsCount = await waveContract.getTotalArtRequests();

  let waveTxn = await waveContract.askForArt();
  await waveTxn.wait();

  artRequestsCount = await waveContract.getTotalArtRequests();
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
