import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, TrendingUp, Bot, User, Loader2 } from "lucide-react";

const TradeX = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Welcome to TradeX! 🚀 I\'m your AI trading assistant. Ask me about market analysis, crypto prices, trading strategies, or any financial questions you have.',
      timestamp: new Date(),
      isGenerating: false
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, currentTypingMessage]);

  // Simulate API call to your backend
  const callTradeXAPI = async (userMessage) => {
    try {
      // Replace this with your actual API endpoint
      // const response = await fetch('/api/tradex/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: userMessage })
      // });
      // const data = await response.json();
      // return data.response;

      // Mock response for demonstration
      const mockResponses = {
        default: `***TradeX Market Analysis 📊***

Based on your query about "${userMessage}", here's my analysis:

***Current Market Insights***
• **Market Sentiment**: Bullish trend detected across major cryptocurrencies
• **Volume Analysis**: Increased trading activity in the last 24 hours
• **Technical Indicators**: RSI showing potential buying opportunities

***Key Recommendations***
1. **Bitcoin (BTC)**: Strong support at $108,000 level
2. **Ethereum (ETH)**: Bullish momentum above $4,200
3. **Risk Management**: Consider 2-3% position sizing for new entries

***Trading Strategy***
Based on current market conditions:
- **Entry Points**: Look for pullbacks to key support levels
- **Stop Loss**: Set at 5-8% below entry for risk management
- **Take Profit**: Target 15-20% gains with trailing stops

***Market Alerts***
⚠️ **Important**: Monitor Federal Reserve announcements this week
📈 **Opportunity**: DeFi tokens showing strong momentum

***Next Steps***
Would you like me to:
1. Analyze specific cryptocurrencies
2. Provide detailed technical analysis
3. Create a custom trading plan
4. Set up price alerts

*Analysis generated in 2.3s using TradeX AI Engine v2.1*`,

        price: `***Price Analysis for ${userMessage.includes('BTC') ? 'Bitcoin' : userMessage.includes('ETH') ? 'Ethereum' : 'Requested Asset'} 💰***

***Real-time Data***
• **Current Price**: $${Math.floor(Math.random() * 50000 + 50000).toLocaleString()}
• **24h Change**: ${(Math.random() * 10 - 5).toFixed(2)}%
• **Volume**: $${(Math.random() * 10 + 5).toFixed(1)}B
• **Market Cap**: $${Math.floor(Math.random() * 500 + 1000)}B

***Technical Analysis***
- **Support Level**: Strong support around $${Math.floor(Math.random() * 5000 + 45000).toLocaleString()}
- **Resistance Level**: Key resistance at $${Math.floor(Math.random() * 10000 + 55000).toLocaleString()}
- **RSI**: ${Math.floor(Math.random() * 40 + 30)} (${Math.random() > 0.5 ? 'Neutral' : 'Oversold'})

***Recommendation***
${Math.random() > 0.5 ? '🟢 **BUY Signal**' : '🔴 **HOLD Signal**'} - Based on current market conditions and technical indicators.`,

        strategy: `***Trading Strategy Analysis 🎯***

***Strategy Overview***
Your query about trading strategies is excellent timing! Here's a comprehensive approach:

***Short-term Strategy (1-7 days)***
1. **Scalping**: Quick 1-3% gains on high-volume pairs
2. **Swing Trading**: 5-15% targets on technical breakouts
3. **Risk Management**: Never risk more than 1% per trade

***Medium-term Strategy (1-4 weeks)***
1. **Trend Following**: Ride momentum with proper stop-losses
2. **Support/Resistance**: Buy dips, sell rallies
3. **Portfolio Allocation**: 60% major coins, 40% altcoins

***Long-term Strategy (3-12 months)***
1. **DCA Strategy**: Dollar-cost averaging into blue chips
2. **Hodl Approach**: Hold through volatility with conviction
3. **Rebalancing**: Monthly portfolio adjustments

***Risk Management Rules***
⚠️ **Critical Guidelines**:
- Maximum 5% portfolio risk per trade
- Use stop-losses on every position
- Take profits incrementally (25%, 50%, 75%)
- Keep 20% cash for opportunities

Would you like me to elaborate on any specific strategy?`
      };

      // Simple keyword matching for demo
      const response = userMessage.toLowerCase().includes('price') ? mockResponses.price :
                      userMessage.toLowerCase().includes('strategy') ? mockResponses.strategy :
                      mockResponses.default;

      return response;
    } catch (error) {
      console.error('API Error:', error);
      return 'Sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.';
    }
  };

  // Typewriter effect for AI responses
  const typeMessage = (content, messageId) => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentTypingMessage({
        id: messageId,
        content: content.slice(0, index),
        isGenerating: true
      });
      index++;
      if (index > content.length) {
        clearInterval(interval);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content, isGenerating: false }
            : msg
        ));
        setCurrentTypingMessage(null);
        setIsLoading(false);
      }
    }, 8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;

    // Add user message
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      isGenerating: false
    }]);

    // Add placeholder AI message
    setMessages(prev => [...prev, {
      id: aiMsgId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isGenerating: true
    }]);

    setInputValue("");
    setIsLoading(true);

    // Get AI response
    const aiResponse = await callTradeXAPI(userMessage);
    typeMessage(aiResponse, aiMsgId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TradeX AI Assistant</h1>
              <p className="text-sm text-slate-400">Your intelligent trading companion</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-400">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 ml-3' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 mr-3'
                }`}>
                  {message.type === 'user' ? 
                    <User className="w-4 h-4 text-white" /> : 
                    <Bot className="w-4 h-4 text-white" />
                  }
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                }`}>
                  {message.type === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-white" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-sm font-medium mb-2 text-slate-300" {...props} />,
                          p: ({node, ...props}) => <p className="mb-3 text-sm text-slate-300 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="mb-3 space-y-1" {...props} />,
                          li: ({node, ...props}) => <li className="text-sm text-slate-300" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-slate-400" {...props} />,
                          a: ({node, ...props}) => <a className="text-blue-400 hover:text-blue-300 hover:underline" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isGenerating && (
                        <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>
                      )}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-green-100' : 'text-slate-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator for current message */}
          {currentTypingMessage && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-2xl px-4 py-3">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-semibold mb-2 text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-medium mb-2 text-slate-300" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 text-sm text-slate-300 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="text-sm text-slate-300" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-slate-400" {...props} />
                      }}
                    >
                      {currentTypingMessage.content}
                    </ReactMarkdown>
                    <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about market analysis, prices, trading strategies..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-12 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none max-h-32"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            {['Market Overview', 'BTC Price', 'Trading Strategy', 'Risk Analysis'].map((action) => (
              <button
                key={action}
                onClick={() => setInputValue(action)}
                disabled={isLoading}
                className="px-3 py-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeX;