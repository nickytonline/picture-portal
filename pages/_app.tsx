import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from 'theme-ui';
import { defaultTheme } from '../themes/defaultTheme';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to the Picture Portal 📷</title>
        <meta name="description" content="Welcome to the picture portal." />
        <link rel="icon" href="/favicon.ico" />
        <meta
          property="og:site_name"
          content="Welcome to the picture portal 📷"
        />
        <meta property="og:title" content="Welcome to the picture portal 📷" />
        <meta property="og:type" content="website"></meta>
        <meta property="og:url" content="https://pics.iamdeveloper.com/" />
        <meta name="twitter:creator" content="@nickytonline" />
        <meta
          name="twitter:description"
          content="Welcome to the picture portal 📷. Send a message and receive a picture with your stored message on the blockchain"
        />
        <meta
          property="og:description"
          content="Welcome to the picture portal 📷. Send a message and receive a picture with your stored message on the blockchain"
        />
        <meta name="twitter:image" content="/assets/social-cards/twitter.png" />
        <meta
          property="og:image:alt"
          content="A screengrab of part of the picture portal app"
        />
        <meta
          name="twitter:image:alt"
          content="A screengrab of part of the picture portal app"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <ThemeProvider theme={defaultTheme}>
        <div
          sx={{
            display: 'grid',
            placeItems: 'center',
            margin: '1rem',
            maxWidth: '70ch',
            '@media screen and (max-width : 480px)': { maxWidth: '100vw' },
          }}
        >
          <Component {...pageProps} />{' '}
        </div>
      </ThemeProvider>
    </>
  );
}
export default MyApp;
