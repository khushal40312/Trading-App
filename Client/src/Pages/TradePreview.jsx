import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TradePreview = () => {
  const mockResponse = {
    markdown: `Khushal, based on your request for an \"opinion\" on your portfolio's performance, I can provide a factual analysis of what the current data shows:\n\n***Portfolio Performance Analysis 📉***\n\nCurrently, your overall portfolio shows a total loss of **-$2.18 (-9.68%)**. This indicates that the current value of your holdings is less than your total investment.\n\n***Key Observations***\n\n• **Chainbase (C)** is experiencing the most significant decline, with a loss of **-$1.50 (-40.69%)**. This asset is the primary contributor to your portfolio's overall negative performance.\n\n• **Pi Network (PI)** also shows a loss of **-$0.61 (-6.91%)**, contributing to the overall decline.\n\n• **The Open Network (TON)** is performing relatively close to its average buy price, with a minimal loss of **-$0.07 (-0.74%)**.\n\n---\n\n*Is there anything else you’d like to know about your portfolio or trading activity?*`,
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


               
