const { model } = require("../aiModel/gemini");
const {
    getLatest3Interactions
} = require("../services/ai.service");

const marketAnalysisGenerator = {
    name: "marketAnalysisGenerator",
    description: "Generate response to user according to input and old conversation and provided data from browser or APIs",

    func: async ({ input, user, sessionId, marketClassificationContext }) => {
        try {
            // Input validation
            if (!input?.trim()) {
                throw new Error("User input is required");
            }

            if (!user?.id) {
                console.warn("User ID not provided, continuing without user context");
            }

            // Fetch conversation memory with error handling
            let oldChats = [];
            try {
                if (user?.id && sessionId) {
                    [oldChats] = await Promise.all([
                        getLatest3Interactions(user.id, sessionId)
                    ]);
                }
            } catch (memoryError) {
                console.error('Error fetching conversation memory:', memoryError);
                // Continue without memory - don't fail the entire request
            }

            // Sanitize input to prevent injection
            const sanitizedInput = input.trim().replace(/[<>]/g, '');
            console.log(sanitizedInput)
            // Enhanced prompt with image handling instructions
            const enhancedPrompt = `
You are a **Professional Market Analysis Assistant** providing comprehensive cryptocurrency and trading insights.

---

## CONTEXT DATA

**Market Classification Context:**
${marketClassificationContext ? `\`\`\`json\n${JSON.stringify(marketClassificationContext, null, 2)}\n\`\`\`` : 'No market data provided.'}

**Recent Conversation Memory:**
${oldChats && oldChats.length > 0 ? `\`\`\`json\n${JSON.stringify(oldChats, null, 2)}\n\`\`\`` : 'No recent conversation history.'}

**User Information:**
- **Name:** ${user?.fullname?.firstname || 'User'}
- **Session:** ${sessionId || 'Unknown'}

---

## USER INPUT
"${sanitizedInput}"

---

## RESPONSE GUIDELINES

### 1. **Content Priority**
- Address the user's specific question directly first
- Provide relevant market insights based on available data
- Use conversation memory to maintain context continuity
- Include supporting analysis when beneficial

### 2. **Visual Content Handling** 
**CRITICAL:** If you find any of these in the provided data, include them in your response:
- **Image URLs** (ending in .jpg, .jpeg, .png, .gif, .webp, .svg)
- **Chart/Graph Links** 
- **Sparkline SVG URLs**
- **Trading Chart Images**
- **Cryptocurrency logos/icons**

**Format for images:**
\`![Chart/Image Description](image_url)\`

**Format for sparklines:**
\`📈 **Price Trend:** ![Sparkline](sparkline_svg_url)\`

**Format for logos:**
\`![Coin Logo](logo_url) **Bitcoin (BTC)**\`

### 3. **Structure & Formatting**
- Use \`***Content***\` for main headers (NOT # ## ###)
- Use **bold** for important data points
- Use *italic* for notes and explanations
- Use bullet points (•) for lists
- Use \`\`\`json for code/data blocks
- Organize information logically with clear sections

### 4. **Tone & Style**
- **Professional yet conversational**
- **Data-driven but accessible**
- **Use appropriate emojis**: 📈📉💰🎯📊⚡🚀⚠️
- **Supportive for losses**, **encouraging for gains**
- **Analytical for market data**


### 5. **Currency & Numbers**
- Always display prices in **USDT** when showing values
- Use proper number formatting (e.g., $1,234.56)
- Include percentage changes with appropriate emojis
- Show both absolute and percentage changes when relevant

### 6. **Market Analysis Requirements**
- **Price Analysis**: Include current prices, changes, trends
- **Technical Analysis**: Mention key indicators if available
- **Market Context**: Reference broader market conditions
- **Risk Assessment**: Include appropriate warnings when needed
- **Actionable Insights**: Provide clear, helpful conclusions

### 7. **Output Requirements**
- **If context has sources include them**
- **If response contains search metadata** (e.g., search time, results count), clearly mention that it was from a browser search, include the time it took, and present source links in AI-style references.
- **Single Markdown String**: No raw line breaks outside markdown
- **No HTML Tags**: Pure markdown only
- **Consistent Formatting**: Maintain structure throughout
- **Engagement Ending**: End with relevant question or offer for more help
- **never include template literals  in output.
- ** generate output like it would work on npm react-markdown.

---

## EXAMPLE RESPONSE STRUCTURE

\`\`\`markdown
***Bitcoin Market Analysis 📊***

![BTC Logo](https://logo-url.com/btc.png) **Bitcoin (BTC)** is currently showing strong momentum.

***Current Price Action***
• **Current Price**: $43,250 USDT
• **24h Change**: +$1,875 (+4.54%) 📈
• **7d Change**: +$3,200 (+8.00%) 🚀

![Bitcoin Chart](https://chart-url.com/btc-chart.png)

📈 **Price Trend:** ![BTC Sparkline](https://sparkline-url.com/btc.svg)

***Technical Indicators***
• **RSI**: 68 (Approaching overbought)
• **Moving Averages**: Price above 50MA and 200MA ✅
• **Volume**: Above average trading volume

***Market Context***
The recent surge appears to be driven by institutional adoption news and positive regulatory developments.

⚠️ **Risk Note**: Consider profit-taking levels as RSI approaches overbought territory.


**Sources**
*Web Search took 1.42s* [(Gemini)](https://www.gemini.com/cryptopedia/bitcoin-for-dummies-how-does-bitcoin-work-blockchain-btc) [(Investopedia)](https://www.investopedia.com/terms/b/bitcoin.asp)

*Would you like me to analyze any specific aspects of Bitcoin or other cryptocurrencies?*
\`\`\`

---

Generate your response following these guidelines. Focus on delivering valuable market insights while maintaining professional presentation and including any visual content found in the data.
`;

            // Get AI response
            const result = await model.invoke(enhancedPrompt);

            // Validate response
            if (!result) {
                throw new Error("Empty response from AI model");
            }

            return result;

        } catch (error) {
            console.error('Error in marketAnalysisGenerator:', error);

            // Enhanced fallback response
            const fallbackPrompt = `
You are a professional market analysis assistant. There was a technical issue processing the complete market data.

**User Query:** "${input?.trim() || 'Market analysis request'}"
**Error Context:** Data processing temporarily unavailable

Please provide a helpful response that:

1. **Acknowledges the technical issue professionally**
2. **Provides general market guidance related to their query (if possible)**
3. **Offers alternative suggestions**
4. **Maintains a supportive, professional tone**

**Response Format Requirements:**
- Use markdown formatting with \`***Content***\` for headers
- Include relevant emojis (📊💰🎯📈📉)
- Keep response concise but helpful
- End with offer for additional assistance

**Example Structure:**
\`\`\`markdown
***Market Analysis - Technical Issue ⚠️***

I apologize for the temporary difficulty accessing complete market data for your analysis.

***What I Can Still Help With***
• General market trend discussions
• Cryptocurrency education and explanations
• Trading strategy concepts
• Risk management guidance

***Immediate Suggestions***
• Try your query again in a few moments
• Check major exchanges for real-time data
• Consider multiple data sources for confirmation

*Is there a specific aspect of market analysis I can help explain while we resolve the data access issue?*
\`\`\`

Provide a response following this format.`;

            try {
                const fallbackResult = await model.invoke(fallbackPrompt);
                return fallbackResult || "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
            } catch (fallbackError) {
                console.error('Error in fallback response:', fallbackError);
                return `***Technical Difficulty ⚠️***

I apologize, but I'm currently experiencing technical issues that prevent me from providing a complete market analysis.

***Please Try Again***
• Refresh and retry your request in a moment
• Check your connection and try again
• Contact support if the issue persists

*I'm here to help once the technical issue is resolved.*`;
            }
        }
    }
};

module.exports = { marketAnalysisGenerator };