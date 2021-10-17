import type { NextPage } from 'next';
import Image from 'next/image';
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

const contractAddress = '0xD0F1A318b25149093bb1C8568B392970cA184631';
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

type MiningStatus =
  | {
      state: 'mining' | 'mined';
      transactionHash: string;
    }
  | { state: 'none' };

function getMiningStyles(miningStatus: MiningStatus) {
  switch (miningStatus.state) {
    case 'mining':
      return {
        ...web3Styles,
        marginRight: '0.5rem',
      };
    case 'mined': {
      return {
        marginRight: '0.5rem',
      };
    }
    case 'none': {
      return { display: 'none' };
    }
  }
}

function getMiningMessage(miningStatus: MiningStatus) {
  const { state } = miningStatus;

  switch (state) {
    case 'mining':
      return `Mining transaction ${miningStatus.transactionHash}`;
    case 'mined': {
      return `${miningStatus.transactionHash} transaction has been mined`;
    }
    case 'none':
      '';
  }
}

const Home: NextPage = () => {
  const [artRequestCount, setArtRequestCount] = useState(0);
  const [currentAccount, setCurrentAccount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');
  const [artRequests, setAllArtRequests] = useState([]);
  const [miningStatus, setMiningStatus] = useState<MiningStatus>({
    state: 'none',
  });

  /*
   * Create a method that gets all waves from your contract
   */
  async function getArtRequests() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer,
        );

        /*
         * Call the getArtRequests method from your Smart Contract
         */
        const rawArtRequests = await wavePortalContract.getArtRequests();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        const artRequests = rawArtRequests.map((artRequest: any) => {
          return {
            address: artRequest.waver,
            timestamp: new Date(artRequest.timestamp * 1000),
            message: artRequest.message,
            imageUrl: artRequest.imageUrl,
          };
        });

        /*
         * Store our data in React State
         */
        setAllArtRequests(artRequests);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

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

  async function requestArt(event: any) {
    event.preventDefault;

    intializeErrorMessaging();

    if (!message || message.length === 0) {
      setError('You need to specify a message before requesting to view art');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    try {
      const { ethereum } = window;

      if (ethereum) {
        const wavePortalContract = getContract(ethereum);

        const imageUrl = `https://http.cat/${
          Math.floor(Math.random() * 599) + 99
        }`;

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.askForArt(message, imageUrl);
        setMiningStatus({ state: 'mining', transactionHash: waveTxn.hash });

        await waveTxn.wait();
        setMiningStatus({ state: 'mined', transactionHash: waveTxn.hash });
        getArtRequests();
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
      } else if (error.message.includes('execution reverted: Wait 15m')) {
        setError(
          `Please don't spam. You can send another message after 15 minutes.`,
        );
      } else {
        setError('an unknown error occurred');
        console.log(error);
      }
    } finally {
      setTimeout(() => {
        setMiningStatus({ state: 'none' });
      }, 3000);
      setMessage('');
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
    // TODO: Stuff in here will error out if the wallet isn't connected
    checkIfWalletIsConnected();
    const contract = getContract(window.ethereum);
    getLatestArtRequestsCount(contract);
    getArtRequests();
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
          <form
            onSubmit={(event) => {
              event?.preventDefault();
            }}
          >
            <input
              required={true}
              type="text"
              value={message}
              placeholder="Message"
              onChange={(e) => setMessage(e.target.value)}
            />
            <button sx={{ marginRight: '1rem' }} onClick={requestArt}>
              Request to view some art!
            </button>
          </form>
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
        {miningStatus.state !== 'none' && (
          <p aria-live="polite" sx={{ color: 'darkgreen', fontWeight: 700 }}>
            <span aria-hidden="true" sx={getMiningStyles(miningStatus)}>
              💎
            </span>
            {getMiningMessage(miningStatus)}
          </p>
        )}

        {artRequests.length > 0 && (
          <ul
            sx={{
              listStyle: 'none',
              overflowX: 'hidden',
              overflowY: 'scroll',
              height: '60vh',
              padding: '1rem',
              '& li': {
                borderRadius: '0.5rem',
                backgroundImage: `linear-gradient(to right top, #d8ff10, #ffb900, #ff5843, #ff0099, #c312eb)`,
                padding: '1rem',
              },
              '& [data-list-item-wrapper]': {
                display: 'flex',
                flexDirection: 'column',
                fontWeight: 500,
                padding: '1rem',
                background: '#000',
                color: '#fff',
                borderRadius: '0.5rem',
              },
            }}
          >
            {artRequests.map((artRequest: any, index) => {
              return (
                <li key={index}>
                  <div data-list-item-wrapper={true}>
                    <div>Address: {artRequest.address}</div>
                    <time dateTime={artRequest.timestamp.toString()}>
                      {artRequest.timestamp.toString()}
                    </time>
                    <div>Message: {artRequest.message}</div>
                    <Image
                      src={artRequest.imageUrl}
                      alt="Art for this request"
                      width="375"
                      height="300"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
};

export default Home;
