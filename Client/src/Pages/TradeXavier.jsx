import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User, Loader2, Bell, X, Brain, Wifi, WifiOff, Globe, Ellipsis, CircleSmall, Pen, Circle, WandSparkles, StopCircle, BadgeAlert, ChevronLeft, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const TradeX = () => {
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState({});
  const navigate = useNavigate()

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTypingMessage, setCurrentTypingMessage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [currentActivity, setCurrentActivity] = useState(null); // { event: "Web searching", status: true }
  const [activityMessage, setActivityMessage] = useState(null); // For showing activity in chat area
  const [isRateLimited, setIsRateLimited] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const token = localStorage.getItem('token')
  useEffect(() => {
    if (token) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setUser(response.data.user)


        } catch (error) {
          console.error(error)
          if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
            localStorage.removeItem('token');
            navigate('/session-expired');
          }
        }
      }


      fetchUserProfile()
    }
  }, [navigate, token])

  useEffect(() => {
    connectWebSocket();

    // Load saved session ID
    const savedSessionId = localStorage.getItem('tradex_session_id');
    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    // Add initial welcome message
    setMessages([{
      id: 1,
      type: 'ai',
      content: 'Welcome to TradeX! 🚀 I\'m your AI trading assistant. Ask me about market analysis, crypto prices, trading strategies, or any financial questions you have.',
      timestamp: new Date(),
      isGenerating: false
    }]);

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 7000);
  };
  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    setConnectionStatus('connecting');

    // Replace with your actual WebSocket URL
    const wsUrl = `${import.meta.env.VITE_WS_URL}/ai`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');

      // Clear any reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      setCurrentActivity(null);
      setActivityMessage(null);

      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectWebSocket();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };
  };

  const handleWebSocketMessage = (data) => {
    const { event, status, sessionId: newSessionId, notification, reply, message, reason, retryAfter } = data

    switch (event) {
      case 'session:new':
        if (newSessionId) {
          localStorage.setItem('tradex_session_id', newSessionId);
          setSessionId(newSessionId);
        }
        if (notification) {
          showNotification(notification);
        }
        break;

      case 'Web searching':
        if (status) {
          const activityId = Date.now();
          setActivityMessage({
            id: activityId,
            event: 'Web searching',
            icon: Globe,
            message: 'Searching the web for latest information...',
            timestamp: new Date()
          });
        } else {
          setActivityMessage(null);
        }
        setCurrentActivity(status ? { event: 'Web searching', icon: Bot } : null);
        break;

      case 'Analysing':
        if (status) {
          const activityId = Date.now();
          setActivityMessage({
            id: activityId,
            event: 'Analyzing',
            icon: Brain,
            message: 'Analyzing market data and trends...',
            timestamp: new Date()
          });
        } else {
          setActivityMessage(null);
        }
        setCurrentActivity(status ? { event: 'Analyzing market data', icon: Bot } : null);
        break;

      case 'typing':
        if (status) {
          // AI started typing
          const typingId = Date.now();
          setCurrentActivity({ event: 'Typing', icon: Bot });
          setActivityMessage({
            id: typingId,
            event: 'Typing',
            icon: Ellipsis,
            message: 'AI is typing a response...',
            timestamp: new Date()
          });
        } else {
          // AI stopped typing
          setCurrentActivity(null);
          setActivityMessage(null);
          setIsLoading(false);
        }
        break;


      case 'reply':
        if (reply) {
          setActivityMessage({
            id: "12dfhnmnbvdrt565",
            event: "",
            icon: WandSparkles,
            message: '',
            timestamp: new Date()
          });
          setCurrentActivity({ event: "generating", icon: Bot });

          const aiMsgId = Date.now();
          setMessages(prev => [...prev, {
            id: aiMsgId,
            type: 'ai',
            content: '',
            timestamp: new Date(),
            isGenerating: true
          }]);
          typeMessage(reply, aiMsgId);
        }
        break;
      case 'rate_limit_exceeded':
        setIsLoading(false);
        setCurrentActivity(null);
        setActivityMessage(null);

        // Show rate limit notification
        const rateLimitMessage = reason === 'burst_limit_exceeded'
          ? `Too many messages too quickly! Please wait ${retryAfter} seconds.`
          : `Rate limit reached. Please wait ${retryAfter} seconds.`;

        showNotification(rateLimitMessage);
        setActivityMessage({
          id: "12dfhnmnbvdrt565",
          event: "",
          icon: BadgeAlert,
          message: 'Let me Breath Bro...',
          timestamp: new Date()
        });
        setCurrentActivity({ event: "Rate Limit", icon: Bot });

        // Temporarily disable input
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
        }, retryAfter * 1000);

        // Add system message to chat
        const rateLimitMsgId = Date.now();
        setMessages(prev => [...prev, {
          id: rateLimitMsgId,
          type: 'ai',
          content: `⚠️ ${rateLimitMessage}`,
          timestamp: new Date(),
          isRateLimit: true
        }]);
        break;

      case 'error':
        setIsLoading(false);
        setCurrentActivity(null);
        setActivityMessage(null);
        if (message) {
          showNotification(`Error: ${message}`);
        }
        break;

      default:
        console.log('Unhandled WebSocket event:', event, data);
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    // find the latest message
    const lastMessage = messages[messages.length - 1];

    // only scroll when a message finishes generating
    if (lastMessage && !lastMessage.isGenerating) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);


  const typeMessage = (content, messageId) => {
    let index = 0;
    const words = content.split(" "); // split into words

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      // join up to current index
      setCurrentTypingMessage({
        id: messageId,
        content: words.slice(0, index + 1).join(" "),
        isGenerating: true
      });

      index++;

      if (index >= words.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;

        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, content, isGenerating: false }
            : msg
        ));

        setCurrentTypingMessage(null);
        setCurrentActivity(null);
        setIsLoading(false);
        setActivityMessage(null);
      }
    }, 90); // <-- tweak speed here (faster/slower)
  };


  const sendMessage = (userMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const token = localStorage.getItem('token');
      // You might need to decode the token to get user info or send it differently
      const user = { id: 'user_id' }; // Replace with actual user data

      wsRef.current.send(JSON.stringify({
        message: userMessage,
        sessionId: sessionId,
        token: `Bearer ${token}`
      }));
      return true;
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || connectionStatus !== 'connected') return;

    const userMessage = inputValue.trim();
    const userMsgId = Date.now();

    // Add user message
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
      isGenerating: false
    }]);

    setInputValue("");
    setIsLoading(true);

    // Send message via WebSocket
    const sent = sendMessage(userMessage);
    if (!sent) {
      setIsLoading(false);
      showNotification('Connection lost. Trying to reconnect...');
      connectWebSocket();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickAction = (action) => {
    if (!isLoading && connectionStatus === 'connected') {
      setInputValue(action);
      inputRef.current?.focus();
    }
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-400';
      case 'connecting': return 'bg-yellow-400';
      default: return 'bg-red-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      default: return 'Disconnected';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-blue-500/50 flex items-center space-x-3 max-w-sm">
          <Bell className="w-5 h-5 text-blue-200" />
          <span className="text-sm flex-1">{notification}</span>
          <button
            onClick={dismissNotification}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className=" rounded-lg flex items-center justify-center">
              <img src="/logo.png" className="w-17   rounded-2xl text-white" />
            </div>
            <div>
              
              <h1 className="text-md  font-bold text-white">TradeXavier</h1>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-400">Your intelligent trading companion</p>
               
              </div>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor()} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs text-slate-400">{getConnectionStatusText()}</span>
                {connectionStatus === 'connected' ?
                  <Wifi className="w-4 h-4 text-green-400" /> :
                  <WifiOff className="w-4 h-4 text-red-400" />
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[97%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center `}>
                  {message.type === 'user' ?
                    <img src={user?.profilePicture} className="w-[30px] h-[27px] rounded-2xl ml-4  text-white" /> :
                    <img src="/logo.png" className="w-6 rounded-2xl h-6 text-white" />
                  }
                </div>

                {/* Message Content */}
                <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                  }`}>
                  {message.type === 'user' ? (
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2 text-white" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-2 text-slate-300" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 text-sm text-slate-300 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="mb-3 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm text-slate-300" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                          em: ({ node, ...props }) => <em className="italic text-slate-400" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 hover:underline" {...props} />,
                          hr: ({ node, ...props }) => <hr className="border-slate-600 my-4" {...props} />
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      {message.isGenerating && (
                        <WandSparkles className="inline-block w-4 h-4  animate-pulse ml-1 " />

                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-green-100' : 'text-slate-500'
                    }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Activity Message in Chat Area */}
          {activityMessage && (
            <div className="flex justify-start">
              <div className="flex max-w-[97%] items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center `}>

                  <img src="/logo.png" className="w-6 rounded-2xl h-6 text-white" />


                </div>
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-200 rounded-2xl px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <activityMessage.icon className={`w-4 h-4 ${currentActivity.event === 'Web searching' ? "animate-spin" : "animate-pulse"}`} />
                    <span className="text-sm font-medium">{activityMessage.event}</span>
                  </div>
                  <p className="text-xs text-yellow-300 mt-1">{activityMessage.message}</p>
                  <div className="text-xs mt-2 text-yellow-400">
                    {activityMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator for current message */}
          {currentTypingMessage && (
            <div className="flex justify-start">
              <div className="flex max-w-[97%] items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center `}>

                  <img src="/logo.png" className="w-6 rounded-2xl h-6 text-white" />


                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-2xl px-4 py-3">
                  <div className="prose prose-sm prose-invert max-w-none ">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-3 text-white" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-2 text-white" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-medium mb-2 text-slate-300" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-3 text-sm text-slate-300 leading-relaxed" {...props} />,
                        ul: ({ node, ...props }) => <ul className="mb-3 space-y-1" {...props} />,
                        li: ({ node, ...props }) => <li className="text-sm text-slate-300" {...props} />,
                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                        em: ({ node, ...props }) => <em className="italic text-slate-400" {...props} />,
                        hr: ({ node, ...props }) => <hr className="border-slate-600 my-4" {...props} />
                      }}
                    >
                      {currentTypingMessage.content}
                    </ReactMarkdown>

                    <WandSparkles className="inline-block w-4 h-4  animate-pulse ml-1 " />
                  </div>
                </div>
              </div>
            </div>
          )}


          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm fixed bottom-0 w-full">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onClick={handleKeyPress}
                  placeholder={connectionStatus === 'connected' ?
                    "Ask anything" :
                    "Connecting to TradeX AI..."
                  }
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-12 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none max-h-32"
                  rows={1}
                  disabled={isLoading || connectionStatus !== 'connected'}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isLoading || connectionStatus !== 'connected' || isRateLimited}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 mb-2 rounded-xl transition-all duration-200 flex items-center justify-center"
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
          <div className="flex  gap-2 mt-3">
            <div
            title="Go to Home"
              onClick={() => navigate('/home')}
              className="fixed bottom-36 hover:bg-gradient-to-r from-blue-600 to-purple-600 right-3 z-50 cursor-pointer flex flex-col items-center border-1 border-gray-600 hover: p-3 rounded-xl hover:scale-110 transition-transform"
            >
              <span
                // title='Your Personal AI Assistant'
                //   src="/logo.png" 
                //   alt="Tradexavier AI" 
                className=""
              >
                <Home className="w-6 h-6 text-white" />                 </span>
              {/* <span className="text-[10px] text-green-300 mt-1 font-semibold bg-black/60 px-2 py-0.5 rounded">
                TradeXavier Ai
              </span> */}
            </div>
            {['current BTC Price', "tell me about Today's trending coins"].map((action) => (
              <button
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading || connectionStatus !== 'connected'}
                className="px-1 py-1 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50  rounded-lg text-xs text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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