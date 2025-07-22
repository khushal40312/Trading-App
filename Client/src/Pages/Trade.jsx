import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../Components/Navbar';
import { VscGraph } from "react-icons/vsc";
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import gsap from 'gsap';
import BuySellPanel from '../Components/BuySellPanel';
import TokenInfoPanel from '../Components/TokenInfoPanel';
import { selectedTokenAction } from '../store/seletedTokenSlice';

const Trade = () => {
  const [selectedSide, setSelectedSide] = useState('buy');
  const [lastTrade, setLastTrade] = useState('buy');
  const [animate, setAnimate] = useState(false);
  const [tempTokenInfo, setTempTokenInfo] = useState({});
  const [recentTrades, setRecentTrades] = useState([]);
  const navigate = useNavigate()
  const tradeRef = useRef(null);
  const priceRef = useRef(null);
  const qtyRef = useRef(null);
  const frameIdRef = useRef();
  const tradeQueue = useRef([]);
  const isProcessing = useRef(false);
  const recentTrade = localStorage.getItem('trade');
  const { token } = useParams();
  const token_auth = localStorage.getItem('token');
  const tradecoin = (token || recentTrade)?.toUpperCase();
  const selectedToken = useSelector((store) => store.selectedToken);
  const dispatch = useDispatch()
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
    // Animate
    gsap.fromTo(priceRef.current, { scale: 1 }, { scale: 1.1, duration: 0.3 });
    gsap.fromTo(qtyRef.current, { y: -5 }, { y: 0, duration: 0.3 });

    // Continue after short delay
    setTimeout(() => {
      isProcessing.current = false;
      processQueue();
    }, 300);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token_auth || !recentTrade || !selectedToken) return;


      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/trades/get-suggestions?q=${recentTrade}`, {
          headers: {
            Authorization: `Bearer ${token_auth}`
          }
        });

        setTempTokenInfo(response.data);
        dispatch(selectedTokenAction.addToken(response.data))
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (

          error.response?.data?.message?.toLowerCase().includes('session expired')
        ) {
          localStorage.removeItem('token');
          navigate('/session-expired');
        }
      }
    };

    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!tradecoin) return;

    const socket = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    socket.onopen = () => {
      const subscribeMessage = {
        op: 'subscribe',
        args: [
          {
            instType: 'SPOT',
            channel: 'trade',
            instId: `${tradecoin}USDT`
          }
        ]
      };

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
        processQueue(); // Try to process it if nothing running
      }
    };


    socket.onerror = (error) => console.error('WebSocket error:', error);
    return () => {
      socket.close();
      cancelAnimationFrame(frameIdRef.current);
      console.log('WebSocket closed & animation frame canceled');
    };

  }, [tradecoin]);


  const handleNewTrade = (trade) => {
    setRecentTrades((prev) => [...prev.slice(-3), trade]); // only 4 total
  };

  const gotoGraph = () => {

    navigate(`/trade/${tradecoin}/candles`)

  }
  const imageSrc = selectedToken?.image || selectedToken?.thumb || tempTokenInfo?.image;
  return (
    <div className="w-screen h-screen bg-black/80">
      <div className="h-full w-screen bg-black/20 p-3 flex flex-col">
        {/* Header */}
        <div className="w-full h-20 bg-black rounded flex items-center px-3 justify-between border border-green-600 border-3">
          <h1 className="text-xl font-bold text-white">{tradecoin}/USDT</h1>
          <span onClick={() => gotoGraph()}> <VscGraph className="invert" size={23} /></span>
        </div>

        {/* Main Section */}
        <div className="flex border border-white">
          <BuySellPanel TokenDetails={selectedToken || tempTokenInfo} tradecoin={tradecoin} livePrice={tradeRef.current?.PRICE} token_auth={token_auth} selectedSide={selectedSide} setSelectedSide={setSelectedSide} />
          <TokenInfoPanel recentTrades={recentTrades} tradeRef={tradeRef} lastTrade={lastTrade} animate={animate} token={token} imageSrc={imageSrc} priceRef={priceRef} tradecoin={tradecoin} qtyRef={qtyRef} />

        </div>
      </div>

      {/* Navbar */}
      <Navbar />
    </div>
  );
};

export default Trade;