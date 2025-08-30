import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../Components/Navbar';
import { VscGraph } from "react-icons/vsc";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import gsap from 'gsap';
import BuySellPanel from '../Components/BuySellPanel';
import TokenInfoPanel from '../Components/TokenInfoPanel';
import { selectedTokenAction } from '../store/seletedTokenSlice';
import { handleSessionError } from '../Functions/HandleSessionError';
import { Timer } from 'lucide-react';
import PendingTradeHistory from '../Components/PendingTradesHistory';


const Trade = () => {
  const [selectedSide, setSelectedSide] = useState('buy');
  const [lastTrade, setLastTrade] = useState('buy');

  const [tempTokenInfo, setTempTokenInfo] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);
  const [showTradeHistory, setshowTradeHistory] = useState(false);

  const navigate = useNavigate()
  const tradeRef = useRef(null);
  const priceRef = useRef(null);
  const qtyRef = useRef(null);

  const tradeQueue = useRef([]);
  const isProcessing = useRef(false);
  const recentTrade = localStorage.getItem('trade');
  const { token } = useParams();
  const token_auth = localStorage.getItem('token');
  const tradecoin = useMemo(() => (token || recentTrade || "BTC")?.toUpperCase(), [token, recentTrade]);

  const selectedToken = useSelector((store) => store.selectedToken);
  const dispatch = useDispatch()
  const theme = useSelector(store => store.selectedTheme)


  const timeoutRef = useRef(null);

  const processQueue = () => {
    if (isProcessing.current || tradeQueue.current.length === 0) return;
    isProcessing.current = true;

    const nextTrade = tradeQueue.current.shift();
    if (!nextTrade) {
      isProcessing.current = false;
      return;
    }

    tradeRef.current = nextTrade;
    setLastTrade(nextTrade.SIDE);
    handleNewTrade(nextTrade);

    if (priceRef.current && qtyRef.current) {
      gsap.fromTo(priceRef.current, { scale: 1 }, { scale: 1.1, duration: 0.3 });
      gsap.fromTo(qtyRef.current, { y: -5 }, { y: 0, duration: 0.3 });
    }


    timeoutRef.current = setTimeout(() => {
      isProcessing.current = false;
      processQueue();
    }, 300);
  };




  useEffect(() => {
    if (!token_auth || !tradecoin || selectedToken?.symbol === tradecoin) return;

    const fetchSuggestions = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/trades/get-suggestions?q=${tradecoin}`,
          { headers: { Authorization: `Bearer ${token_auth}` } }
        );
        setTempTokenInfo(data);
        dispatch(selectedTokenAction.addToken(data));
      } catch (error) {
        handleSessionError(error, navigate);

        console.error('Error fetching suggestions:', error);
      }
    };

    fetchSuggestions();
  }, [tradecoin, token_auth, selectedToken?.symbol]);


  useEffect(() => {
    // if (!tradecoin)
    return 'test';

    const socket = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    const subscribeMessage = {
      op: 'subscribe',
      args: [{
        instType: 'SPOT',
        channel: 'trade',
        instId: `${tradecoin}USDT`
      }]
    };

    const unsubscribeMessage = {
      op: 'unsubscribe',
      args: [{
        instType: 'SPOT',
        channel: 'trade',
        instId: `${tradecoin}USDT`
      }]
    };

    socket.onopen = () => {
      socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if ((msg.action === 'snapshot' || msg.action === 'update') && msg.arg.channel === 'trade') {
        const last = msg.data.at(-1);
        if (!last) return;

        const newTrade = {
          PRICE: parseFloat(last.price),
          LAST_TRADE_QUANTITY: parseFloat(last.size),
          TIMESTAMP: last.ts,
          SIDE: last.side,
        };

        tradeQueue.current.push(newTrade);
        processQueue();
      }
    };

    socket.onerror = console.error.message;

    return () => {

      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(unsubscribeMessage));
      }

      socket.close();

    };
  }, [tradecoin]);


  const handleNewTrade = (trade) => {
    setRecentTrades((prev) => {
      const updated = [...prev, trade];
      return updated.length > 4 ? updated.slice(-4) : updated;
    });
  };

  const gotoGraph = () => {

    navigate(`/trade/${tradecoin}/candles`)

  }
  // ${theme === 'light' ?'border-white':'border-green-300'} 
  const imageSrc = selectedToken?.image || selectedToken?.thumb || tempTokenInfo?.image;
  return (
    <div className={`w-screen h-screen  ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800 ' : 'bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-900'}`}>
      <div className="h-full w-screen bg-black/20 p-3 flex flex-col">
        {/* Header */}
        <div className={`w-full h-20  ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-600 border-white' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900  border-green-300'} rounded flex items-center px-3 justify-between border  border-2 rounded`}>
          <h1 className={`text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{tradecoin}/USDT</h1>
          <h1 className='flex gap-3'>
            <span onClick={() => setshowTradeHistory(true)} title='Conditional Trades'>  <Timer className={`${theme === 'light' ? 'text-black' : 'text-white'}`} /> </span>
            <span title='Coin Chart' onClick={() => gotoGraph()}> <VscGraph className={`${theme === 'light' ? 'text-black' : 'text-white'}`} size={23} /></span>


          </h1>
        </div>

        {/* Main Section */}
        <div className={`flex border ${theme === 'light' ? ' border-white' : '  border-green-300'} rounded`}>
          <BuySellPanel theme={theme} TokenDetails={selectedToken || tempTokenInfo} tradecoin={tradecoin} livePrice={tradeRef.current?.PRICE} token_auth={token_auth} selectedSide={selectedSide} setSelectedSide={setSelectedSide} />
          <TokenInfoPanel theme={theme} recentTrades={recentTrades} tradeRef={tradeRef} lastTrade={lastTrade} token={token} imageSrc={imageSrc} priceRef={priceRef} tradecoin={tradecoin} qtyRef={qtyRef} />

        </div>
      </div>

      {showTradeHistory && (
        <PendingTradeHistory
          setshowTradeHistory={setshowTradeHistory}
        />
      )}
      {/* Navbar */}
      <Navbar />
    </div>
  );
};

export default Trade;