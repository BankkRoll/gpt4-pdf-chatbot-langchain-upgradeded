import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import GithubCorner from 'react-github-corner';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <main className={inter.variable}>
        <Component {...pageProps} />
      </main>
      {/* @ts-ignore */}
      <GithubCorner
        href="https://github.com/BankkRoll/gpt4-pdf-chatbot-langchain-upgradeded"
        bannerColor="#151513"
        octoColor="#fff"
        size={80}
        direction="right"
        ariaLabel="View source on GitHub"
      />
    </>
  );
}

export default MyApp;

