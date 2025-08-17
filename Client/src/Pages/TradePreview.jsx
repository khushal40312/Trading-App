import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const TradePreview = () => {
  const mockResponse = {
    markdown: `\n  ✅ Trade Executed!\n  🔹 ID: 68a1fbd8fa71b365d7345906\n  🔹 Action: BUY 0.3878 PI\n  🔹 Type: conditional\n  🔹 Condition: currentPrice < 0.39\n  📅 Time: Sun Aug 17 2025 21:27:12 GMT+0530 (India Standard Time)\n `,
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


               
