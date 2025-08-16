import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TradePreview = () => {
  const mockResponse = {
    markdown: `***What is Bitcoin?***\n\nBitcoin (BTC) is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network without the need for intermediaries.\n\n• **Decentralized**: It operates on a blockchain, a distributed public ledger, maintained by a network of computers.\n• **Cryptocurrency**: Transactions are verified by network nodes through cryptography and recorded in the blockchain.\n• **Limited Supply**: The total supply of Bitcoin is capped at 21 million coins, making it a finite asset.\n\n---\n*Is there anything else you’d like to know?*`,
  };

  const { markdown } = mockResponse;

  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayed(markdown.slice(0, index));
      index++;
      if (index > markdown.length) clearInterval(interval);
    }, 10); // adjust speed here (ms per character)

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


               
