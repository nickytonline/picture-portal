import type { NextPage } from 'next';
import Head from 'next/head';
import { keyframes } from '@emotion/react';
import { useEffect } from 'react';

// Extend the window object.
declare global {
  interface Window {
    ethereum: any; // TODO, type this out at some point.
  }
}

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

const checkIfWalletIsConnected = () => {
  /*
   * First make sure we have access to window.ethereum
   */
  const { ethereum } = window;

  if (!ethereum) {
    console.log('Make sure you have metamask!');
    return;
  } else {
    console.log('We have the ethereum object', ethereum);
  }
};

function requestArt() {
  console.log('implement me');
}

const Home: NextPage = () => {
  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <>
      <Head>
        <title>Welcome to the Art Portal 🎨</title>
        <meta name="description" content="Welcome to Web3" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header sx={{ margin: '1rem 0' }}>
        <h1 sx={{ fontFamily: 'heading' }}>
          Welcome to the <span sx={web3Styles}>art portal 🎨</span>
        </h1>
      </header>
      <main>
        <p>
          <em>Hi! 👋</em> I&apos;m Nick. Connect your Ethereum wallet and
          request some art!
        </p>

        <button onClick={requestArt}>Request a piece of art!</button>
      </main>
    </>
  );
};

export default Home;
