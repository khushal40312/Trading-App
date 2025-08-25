import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TradePreview = () => {
  const mockResponse = {
    markdown: `***Trending Cryptocurrencies Today 📊***\n\nHere are the coins currently trending, Khushal, along with their key performance metrics for the last 24 hours:\n\n***1. PinLink (PIN)***\n![PinLink Logo](https://coin-images.coingecko.com/coins/images/51611/standard/pin200.png?1736609796) **PinLink (PIN)**\n• **Market Cap Rank**: #768\n• **Current Price**: **$0.68 USDT**\n• **24h Change**: -$0.03 (-5.01%) 📉\n• **Market Cap**: **$54,073,793 USDT**\n• **Total Volume (24h)**: **$1,530,277 USDT**\n📈 **Price Trend:** ![PinLink Sparkline](https://www.coingecko.com/coins/51611/sparkline.svg)\n*PinLink is experiencing a slight pullback today, showing a moderate decrease in price.*\n\n***2. FLOCK (FLOCK)***\n![FLOCK Logo](https://coin-images.coingecko.com/coins/images/53178/standard/FLock_Token_Logo.png?1735561398) **FLOCK (FLOCK)**\n• **Market Cap Rank**: #832\n• **Current Price**: **$0.42 USDT**\n• **24h Change**: +$0.15 (+35.19%) 🚀\n• **Market Cap**: **$46,263,139 USDT**\n• **Total Volume (24h)**: **$116,076,915 USDT**\n📈 **Price Trend:** ![FLOCK Sparkline](https://www.coingecko.com/coins/53178/sparkline.svg)\n*About FLOCK*: FLOCK.io is a decentralized AI model training and validation network focused on making compute, data contribution, and training composable.\n*FLOCK is showing impressive bullish momentum, surging over 35% in the last 24 hours with significant trading volume.*\n\n***3. Hyperliquid (HYPE)***\n![Hyperliquid Logo](https://coin-images.coingecko.com/coins/images/50882/standard/hyperliquid.jpg?1729431300) **Hyperliquid (HYPE)**\n• **Market Cap Rank**: #15\n• **Current Price**: **$45.31 USDT**\n• **24h Change**: +$1.45 (+3.19%) 📈\n• **Market Cap**: **$15,122,528,100 USDT**\n• **Total Volume (24h)**: **$461,299,199 USDT**\n📈 **Price Trend:** ![Hyperliquid Sparkline](https://www.coingecko.com/coins/50882/sparkline.svg)\n*About Hyperliquid*: Hyperliquid is a performant L1 blockchain optimized for a fully on-chain open financial system.\n*Hyperliquid is seeing positive growth, recording a 3.19% increase today, indicating continued interest and development within its ecosystem.*\n\n***4. Bitcoin (BTC)***\n![Bitcoin Logo](https://coin-images.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400) **Bitcoin (BTC)**\n• **Market Cap Rank**: #1\n• **Current Price**: **$111,189.33 USDT**\n• **24h Change**: -$3,288.60 (-2.96%) 📉\n• **Market Cap**: **$2,213,656,480,966 USDT**\n• **Total Volume (24h)**: **$51,921,413,410 USDT**\n📈 **Price Trend:** ![Bitcoin Sparkline](https://www.coingecko.com/coins/1/sparkline.svg)\n*About Bitcoin (BTC)*: Bitcoin is the first decentralized digital currency based on cryptography, operating on a peer-to-peer network without a central authority.\n*The leading cryptocurrency, Bitcoin, is experiencing a slight downturn today along with the broader market, despite its strong overall market capitalization.*\n\n***5. Ethereum (ETH)***\n![Ethereum Logo](https://coin-images.coingecko.com/coins/images/279/standard/ethereum.png?1696501628) **Ethereum (ETH)**\n• **Market Cap Rank**: #2\n• **Current Price**: **$4,631.46 USDT**\n• **24h Change**: -$133.28 (-2.88%) 📉\n• **Market Cap**: **$559,572,702,710 USDT**\n• **Total Volume (24h)**: **$51,049,851,462 USDT**\n📈 **Price Trend:** ![Ethereum Sparkline](https://www.coingecko.com/coins/279/sparkline.svg)\n*What is Ethereum?*: Ethereum is a Proof-of-Stake blockchain powering decentralized applications through smart contracts, with the largest dApp ecosystem.\n*Ethereum, the second-largest cryptocurrency, is also facing a downward trend similar to Bitcoin today.*\n\n***6. Solana (SOL)***\n![Solana Logo](https://coin-images.coingecko.com/coins/images/4128/standard/solana.png?1718769756) **Solana (SOL)**\n• **Market Cap Rank**: #6\n• **Current Price**: **$197.24 USDT**\n• **24h Change**: -$7.45 (-3.78%) 📉\n• **Market Cap**: **$106,354,413,946 USDT**\n• **Total Volume (24h)**: **$13,536,802,272 USDT**\n📈 **Price Trend:** ![Solana Sparkline](https://www.coingecko.com/coins/4128/sparkline.svg)\n*About Solana (SOL)*: Solana is a Layer 1 blockchain known for its fast speeds and low costs, supporting smart contracts and a diverse range of dApps and NFT marketplaces.\n*Solana shows a moderate decline today, reflecting the general market sentiment affecting major altcoins.*\n\n***7. Bio Protocol (BIO)***\n![Bio Protocol Logo](https://coin-images.coingecko.com/coins/images/53022/standard/bio.jpg?1735011002) **Bio Protocol (BIO)**\n• **Market Cap Rank**: #187\n• **Current Price**: **$0.23 USDT**\n• **24h Change**: -$0.05 (-20.60%) ⚠️📉\n• **Market Cap**: **$465,263,020 USDT**\n• **Total Volume (24h)**: **$860,100,363 USDT**\n📈 **Price Trend:** ![Bio Protocol Sparkline](https://www.coingecko.com/coins/53022/sparkline.svg)\n*Bio Protocol is experiencing a significant drop today, with its price decreasing over 20%. Investors should monitor this closely.*\n\n***Market Overview***\nWhile some specific altcoins like FLOCK and Hyperliquid are showing positive momentum and strong gains, the broader market, including major assets like Bitcoin, Ethereum, and Solana, is experiencing a slight correction today. This indicates a mixed sentiment across the trending list.\n\n*Would you like to delve deeper into any of these trending coins or explore other market classifications?*`,
  };

  const { markdown } = mockResponse;

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(markdown.slice(0, index));
      index++;
      if (index > markdown.length) clearInterval(interval);
    }, 7); // adjust speed here (ms per character)

    return () => clearInterval(interval);
  }, [markdown]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Markdown Preview</h2>
      <div
        className="text-md font-[Open Sans]"
        style={{
          background: "#262323",
          padding: "10px",
          borderRadius: "8px",
          color: "white",
          whiteSpace: "pre-wrap",
        }}
      >
        <ReactMarkdown>{displayed.replace(/\n/g, "\n")}</ReactMarkdown>
      </div>
    </div>
  );
};

export default TradePreview;


               
