import type { NextPage } from 'next';
import Head from 'next/head';
import { keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/WavePortal.json';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLMarqueeElement>,
        HTMLMarqueeElement
      >;
    }
  }
}

// Extend the window object.
declare global {
  interface Window {
    ethereum: any; // TODO, type this out at some point.
  }
}

const contractAddress = '0xc9632fc4B6D01A82781B19b197e05dfdc98912Cf';
const contractABI = abi.abi;

const fadeInfadeOut = keyframes`
  from {
  	opacity: 0;
  }
  to {
 	opacity: 1;
  }
`;

const web3Styles = {
  color: 'accent',
  opacity: 1,
  '@media screen and (prefers-reduced-motion: no-preference)': {
    animation: `${fadeInfadeOut} 2.5s ease-in-out infinite`,
  },
};

const Home: NextPage = () => {
  const [artRequestCount, setArtRequestCount] = useState(0);
  const [currentAccount, setCurrentAccount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function intializeErrorMessaging() {
    setError('');
    setSuccessMessage('');
  }

  function getContract(ethereum: any) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );

    return wavePortalContract;
  }

  async function getLatestArtRequestsCount(contract: any) {
    const count = (await contract.getTotalArtRequests()).toNumber();
    setArtRequestCount(count);

    return count;
  }

  async function requestArt() {
    intializeErrorMessaging();

    try {
      const { ethereum } = window;

      if (ethereum) {
        const wavePortalContract = getContract(ethereum);
        let count = getLatestArtRequestsCount(wavePortalContract);
        console.log('Retrieved total art requests...', count);

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.askForArt();
        console.log('Mining...', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined -- ', waveTxn.hash);

        count = getLatestArtRequestsCount(wavePortalContract);
        console.log('Retrieved total art requests...', count);
      } else {
        setError('You need the MetaMask browser extension!');
      }
    } catch (error: any) {
      if (
        error.message.includes(
          `MetaMask Tx Signature: User denied transaction signature.`,
        )
      ) {
        setError('You changed your mind and did not request art.');
      } else {
        setError('an unknown error occurred');
        console.log(error);
      }
    }
  }

  async function connectWallet() {
    intializeErrorMessaging();

    try {
      const { ethereum } = window;

      if (!ethereum) {
        setError('You need the MetaMask browser extension!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      setCurrentAccount(accounts[0]);
      setError('');
      setSuccessMessage(`Wallet ${accounts[0]} has been connected`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      console.log(error);

      if (
        error.message.includes(
          `Request of type 'wallet_requestPermissions' already pending`,
        )
      ) {
        setError(
          `You've already requested to connect your Metamask wallet. Click on the Metamask wallet extension to bring it back to focus so you can connect your wallet.`,
        );
      } else if (error.message.includes(`User rejected the request.`)) {
        setError(`That's so sad. You decided to not connect your wallet. 😭`);
      } else {
        setError('An unknown error occurred');
      }
    }
  }

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    const contract = getContract(window.ethereum);
    getLatestArtRequestsCount(contract);
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to the Art Portal 🎨</title>
        <meta name="description" content="Welcome to Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header sx={{ margin: '1rem 0' }}>
        <marquee
          sx={{
            fontSize: '2rem',
            background: '#000',
            color: 'lime',
          }}
        >
          {artRequestCount} art requests! 💥
        </marquee>
        <h1 sx={{ fontFamily: 'heading' }}>
          Welcome to the <span sx={web3Styles}>art portal 🎨</span>
        </h1>
      </header>
      <main>
        <p>
          <em>Hi! 👋</em> I&apos;m Nick. Connect your Metamask Ethereum wallet
          and request to see some art! (not purchase an NFT)
        </p>
        <div
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            marginBottom: '1rem',
          }}
        >
          <button sx={{ marginRight: '1rem' }} onClick={requestArt}>
            Request a piece of art!
          </button>
          <button onClick={connectWallet}>Connect Wallet</button>
        </div>
        {error && (
          <p aria-live="assertive" sx={{ color: 'darkred', fontWeight: 700 }}>
            {error}
          </p>
        )}
        {successMessage && (
          <p aria-live="polite" sx={{ color: 'darkgreen', fontWeight: 700 }}>
            {successMessage}
          </p>
        )}
      </main>
    </>
  );
};

export default Home;
