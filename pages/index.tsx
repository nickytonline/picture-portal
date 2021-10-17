// TODO: Break this apart lol.
import type { NextPage } from 'next';
// import Image from 'next/image'; Need to sort this one out
import Head from 'next/head';
import { keyframes } from '@emotion/react';
import { useEffect, useState, useRef } from 'react';
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
  console.dir(miningStatus);

  switch (state) {
    case 'mining':
      return `Mining transaction`;
    case 'mined': {
      return `Transaction has been mined`;
    }
    case 'none':
      '';
  }
}

// TODO: Improve this.
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  onClick,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      sx={{
        backgroundColor: 'accent',
        color: '#fff',
        borderRadius: '0.5rem',
        border: 'none',
        padding: '0.25rem 0.5rem',
      }}
    >
      {children}
    </button>
  );
};

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [message, setMessage] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [artRequests, setAllArtRequests] = useState<any[]>([]);
  const [miningStatus, setMiningStatus] = useState<MiningStatus>({
    state: 'none',
  });
  const lastMessageRef = useRef<HTMLDetailsElement>(null);

  function scrollToLastMessage() {
    const { current: lastMessage } = lastMessageRef;

    lastMessage?.setAttribute('open', 'true');
    lastMessage?.scrollIntoView({
      behavior: 'smooth',
    });
  }

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
            setNewMessage(message);
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
      } else if (
        error.message.includes(
          `Cannot estimate gas; transaction may fail or may require manual gas limit`,
        )
      ) {
        setError(
          `Cannot estimate gas; transaction may fail or may require manual gas limit.`,
        );
      } else if (`Trying to withdraw more money than the contract has`) {
        setError(`Trying to withdraw more money than the contract has`);
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
      getArtRequests();
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

  const checkIfWalletIsConnected = async (ethereum: any) => {
    try {
      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        setError(
          'No authorized account found. Connect your account in your Metamask wallet.',
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    const { ethereum } = window;

    if (!ethereum) {
      setError(MISSING_METAMASK_MESSAGE);
      return;
    }

    checkIfWalletIsConnected(ethereum);
    getArtRequests();
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
          <div sx={{ margin: '1rem 0' }}>
            {currentAccount ? (
              <span
                sx={{
                  background: '#000',
                  color: 'lime',
                  fontWeight: 500,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  marginRight: '0.5rem',
                }}
              >
                Account: {currentAccount}
              </span>
            ) : (
              <Button onClick={connectWallet}>Connect Wallet</Button>
            )}
          </div>
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
              sx={{ marginRight: '0.5rem' }}
            />
            <Button onClick={requestArt}>Send message</Button>
          </form>
        </div>
        <div sx={{ height: '2rem' }}>
          {newMessage && (
            <div aria-live="polite" sx={{ fontWeight: 700 }}>
              <span sx={{ marginRight: '0.5rem' }}>{newMessage}</span>
              <Button onClick={scrollToLastMessage}>Go to new message</Button>
            </div>
          )}
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
              height: '50vh',
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
              '& li + li': {
                marginTop: '1rem',
              },
            }}
          >
            {artRequests.map((artRequest: any, index, items) => {
              const otherProps =
                index === items.length - 1
                  ? { ref: lastMessageRef, id: `message${index}` }
                  : {};
              return (
                <li key={index}>
                  <details {...otherProps}>
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
      <footer>
        <nav>
          <ul
            sx={{
              listStyle: 'none',
              display: 'flex',
              margin: 0,
              justifyContent: 'space-between',
              '& li + li': {
                paddingLeft: '1rem',
              },
            }}
          >
            <li>
              <a href="https://github.com/nickytonline/picture-portal">
                source code
              </a>
            </li>
            <li>
              <a href="https://timeline.iamdeveloper.com">more about Nick</a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
};

export default Home;
