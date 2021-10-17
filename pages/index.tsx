// TODO: Break this apart lol.
import type { NextPage } from 'next';
// import Image from 'next/image'; Need to sort this one out
import Head from 'next/head';
import { keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import abi from '../utils/WavePortal.json';

const httpStatusCodes = [
  '100',
  '101',
  '102',
  '103',
  '200',
  '201',
  '202',
  '203',
  '204',
  '205',
  '206',
  '207',
  '208',
  '226',
  '300',
  '301',
  '302',
  '303',
  '304',
  '305',
  '306',
  '307',
  '308',
  '400',
  '401',
  '402',
  '403',
  '404',
  '405',
  '406',
  '407',
  '408',
  '409',
  '410',
  '411',
  '412',
  '413',
  '414',
  '415',
  '416',
  '417',
  '418',
  '421',
  '422',
  '423',
  '424',
  '425',
  '426',
  '427',
  '428',
  '429',
  '430',
  '431',
  '451',
  '500',
  '501',
  '502',
  '503',
  '504',
  '505',
  '506',
  '507',
  '508',
  '509',
  '510',
  '511',
];

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

const MISSING_METAMASK_MESSAGE = `Missing the Metamask browser extension, or if on mobile, open the app in the Metamask app's browser.`;

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
  const [currentAccount, setCurrentAccount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');
  const [artRequests, setAllArtRequests] = useState<any[]>([]);
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

        wavePortalContract.on(
          'NewWave',
          (from, timestamp, message, imageUrl) => {
            console.log('NewWave', from, timestamp, message, imageUrl);

            setAllArtRequests((prevState) => [
              ...prevState,
              {
                address: from,
                timestamp: new Date(timestamp * 1000),
                message,
                imageUrl,
              },
            ]);
          },
        );
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
          httpStatusCodes[
            Math.floor(Math.random() * httpStatusCodes.length - 1)
          ]
        }`;

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.askForArt(message, imageUrl);
        setMiningStatus({ state: 'mining', transactionHash: waveTxn.hash });

        await waveTxn.wait();
        setMiningStatus({ state: 'mined', transactionHash: waveTxn.hash });
      } else {
        setError(MISSING_METAMASK_MESSAGE);
      }
    } catch (error: any) {
      if (
        error.message.includes(
          `MetaMask Tx Signature: User denied transaction signature.`,
        )
      ) {
        setError(
          'You changed your mind and did not request to see a picture. 😭',
        );
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
        setError(MISSING_METAMASK_MESSAGE);
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
        return false;
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

      return true;
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    (async () => {
      // TODO: Stuff in here will error out if the wallet isn't connected
      if (await checkIfWalletIsConnected()) {
        const contract = getContract(window.ethereum);
        getArtRequests();
      } else {
        setError(MISSING_METAMASK_MESSAGE);
      }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to the Picture Portal 📷</title>
        <meta name="description" content="Welcome to Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header sx={{ margin: '1rem 0' }}>
        <marquee
          sx={{
            fontSize: '2rem',
            background: '#000',
            color: 'lime',
            padding: '0.5rem',
          }}
        >
          {artRequests.length} picture requests! 💥
        </marquee>
        <h1 sx={{ fontFamily: 'heading' }}>
          Welcome to the <span sx={{ color: 'accent' }}>picture portal 📷</span>
        </h1>
      </header>
      <aside sx={{ display: 'grid', placeItems: 'center' }}>
        <p>
          Scrappy source code at{' '}
          <a href="https://github.com/nickytonline/picture-portal">
            github.com/nickytonline/picture-portal
          </a>
        </p>
        <p>
          More about Nick Taylor at{' '}
          <a href="https://timeline.iamdeveloper.com">
            timeline.iamdeveloper.com
          </a>
        </p>
      </aside>
      <main>
        <p>
          <em>Hi! 👋</em> I&apos;m Nick. Connect your Metamask Ethereum wallet
          and request to see some pictures! (not purchase an NFT). Note that
          this is a test dApp.
        </p>
        <div
          sx={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '1rem',
          }}
        >
          <p sx={{ color: 'accent', fontWeight: 500 }}>
            Connected account: {currentAccount || 'disconnected'}
          </p>
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
              Request to view a picture!
            </button>
          </form>
          {!currentAccount && (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
        <div sx={{ height: '2rem' }}>
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
        </div>

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
              '& details': {
                cursor: 'pointer',
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
            {artRequests.map((artRequest: any, index, items) => {
              return (
                <li key={index}>
                  <details open={index === items.length - 1}>
                    <summary sx={{ userSelect: 'none' }}>
                      {artRequest.message}
                    </summary>
                    <p>Address: {artRequest.address}</p>
                    <p>Message: {artRequest.message}</p>
                    <time dateTime={artRequest.timestamp.toString()}>
                      {artRequest.timestamp.toString()}
                    </time>
                    <img
                      src={artRequest.imageUrl}
                      alt="Art for this request"
                      width="375"
                      height="300"
                    />
                  </details>
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
