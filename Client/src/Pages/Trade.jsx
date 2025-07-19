import React, { useEffect, useRef, useState } from 'react';
import CandleChart from '../Components/CandleChart'
import Navbar from '../Components/Navbar';
import { VscGraph } from "react-icons/vsc";
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';




// function formatPrice(num, maxDecimals = 2) {
//   if (num == null) return '—';
//   // BTC price can need more decimals depending on feed; tune if needed
//   return Number(num).toLocaleString(undefined, {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: maxDecimals,
//   });
// }

function formatVolume(num) {
  if (num == null) return '—';
  // Show up to 8 decimals for crypto lots
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  });
}

function formatTime(ms) {
  if (!ms) return '—';
  const d = new Date(ms);
  return d.toLocaleString();
}

const Trade = () => {
  const [trade, setTrade] = useState(null);
  const [initialPrice, setInitialPrice] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [selectedSide, setSelectedSide] = useState('buy');
  const [lastTrade, setLastTrade] = useState('buy');
  const [animate, setAnimate] = useState(false);
  const socketRef = useRef(null);
  const recentTrade = localStorage.getItem('trade')

  const { token } = useParams(); // token should be like 'BTCUSDT' or 'ETHUSDT'
 const tradecoin = !token?recentTrade.toString().toUpperCase():token.toString().toUpperCase();
  const selectedToken = useSelector((store) => store.selectedToken)
//  useEffect(() => {
//         const fetchCoin = async () => {
//           try {
//             const res = await fetch(
//               `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=chainbase`
//             );
//             const data = await res.json();
//             setCoin(data[0]);
//           } catch (err) {
//             console.error('Failed to fetch coin data:', err);
//           }
//         };
    
//         fetchCoin();
//       }, []);
  useEffect(() => {
    if (!token &&!recentTrade) return;

    const instId = token?.toUpperCase(); // for spot market
    const socket = new WebSocket('wss://ws.bitget.com/v2/ws/public');

    socket.onopen = () => {
      console.log('WebSocket connected to', instId || tradecoin?.toUpperCase());

      const subscribeMessage = {
        "op": "subscribe",
        "args": [
          {
            "instType": "SPOT",
            "channel": "trade",
            "instId": `${tradecoin}USDT`
          }
        ]
      };

      socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if ((msg.action === "snapshot" || msg.action === "update") && msg.arg.channel === "trade") {
        const tradeList = msg.data;
        if (!Array.isArray(tradeList) || tradeList.length === 0) return;

        const last = tradeList[tradeList.length - 1]; // Get latest trade

        const formattedTrade = {
          PRICE: parseFloat(last.price),
          LAST_TRADE_QUANTITY: parseFloat(last.size),
          TIMESTAMP: last.ts,
          SIDE: last.side, // "buy" or "sell"
        };

        setTrade(formattedTrade);
        setLastTrade(last.side);
        setAnimate(true);

        setTimeout(() => setAnimate(false), 300);
      }

    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
      console.log('WebSocket closed');
    };
  }, [token]);

  const handleSideClick = (side) => {
    setSelectedSide(side);

  };
  return (
    <div className="w-screen h-screen bg-black/80">
      <div className="h-full w-screen bg-black/20 p-3 flex flex-col">
        {/* Header */}
        <div className="w-full h-20 bg-black rounded flex items-center px-3 justify-between border border-green-600 border-3">
          <h1 className="text-xl font-bold text-white">{token?.toUpperCase() || recentTrade?.toUpperCase()}/USTD</h1>

          <span>
            <VscGraph className="invert" size={23} />
          </span>
        </div>

        {/* === Last Trade Indicator === */}
        <div className="flex justify-center my-2">

        </div>



        {/* Main Section */}
        <div className="flex border border-white">
          {/* Buy/Sell Panel */}
          <div className="w-[50vw] h-[70vh] bg-black py-6 ">
            <div className="flex justify-center gap-2 mt-2">
              <button
                onClick={() => handleSideClick('buy')}
                className={`border border-2 px-5 py-2 rounded-xl font-bold text-white ${selectedSide === 'buy'
                  ? 'bg-green-500 border-white-500'
                  : 'bg-black border-white'
                  }`}
              >
                BUY
              </button>
              <button
                onClick={() => handleSideClick('sell')}
                className={`border border-2 px-5 py-2 rounded-xl font-bold text-white ${selectedSide === 'sell'
                  ? 'bg-red-500 border-white-500'
                  : 'bg-black border-white'
                  }`}
              >
                SELL
              </button>
            </div>
            <div className='flex flex-col items-center gap-8 h-25 mt-6 '>
              <button className='w-40 rounded-xl text-white bg-[#413f3f]'> Market </button>
              <div className='flex flex-col items-center'>
                <select className='text-white rounded mb-1' name="" id="">
                  <option>USTD (Total) </option>
                  <option className='text-black'>USTD (Total) </option>
                </select>
                <input className='h-10 w-43 rounded text-white bg-[#413f3f]' type="number" />
              </div>
              <button className={` ${selectedSide === "buy" ? "bg-green-600" : "bg-red-600"}  text-xl font-bold text-white rounded-2xl  w-40 px-6 text-center py-6 transition-all duration-300`}>
                {selectedSide.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[44vw] h-[70vh] bg-black text-white p-4">
            <div className='flex items-center justify-center my-2'>
              <img className='w-12 rounded-2xl' src={selectedToken?.image||selectedToken?.thumb} alt="logo" />
            </div>

            <div
              className={` rounded-full text-white text-md font-semibold flex items-center justify-center gap-2 
  shadow-lg transition-all duration-500 
  ${lastTrade === 'buy' ? 'bg-green-500' : 'bg-red-500'}
  ${animate ? 'scale-105' : 'scale-100'}`}
            >
              {lastTrade === 'buy' ? (
                <>
                  <AiOutlineArrowUp className="text-white text-xl text-center" />
                  BUY
                </>
              ) : (
                <>
                  <AiOutlineArrowDown className="text-white text-xl text-center" />
                  SELL
                </>
              )}
            </div>
            {/* Price */}
            <div className='flex flex-col justify-between items-center mb-4'>
              <h5 className='text-md text-[#808080]'>
                Price <span className='text-sm font-bold'>(USDT)</span>
              </h5>
              <h5 className='text-md font-bold rounded bg-[#413f3f] h-7 w-32 text-center flex items-center justify-center'>
                {trade?.PRICE.toFixed(4)}
              </h5>
            </div>

            {/* Quantity */}
            <div className='flex flex-col justify-between items-center mb-4'>
              <h5 className='text-md text-[#808080]'>
                Quantity <span className='text-sm font-bold'>({token?.toUpperCase() || recentTrade?.toUpperCase()})</span>
              </h5>
              <h5 className='text-md font-bold rounded bg-[#413f3f] h-7 w-32 text-center flex items-center justify-center'>
                {trade?.LAST_TRADE_QUANTITY.toFixed(3)}
              </h5>
            </div>

            {/* Total (USDT) */}
            <div className='flex flex-col justify-between items-center mt-7'>
              <h5 className='text-xl font-bold'>Price ({token?.toUpperCase() || recentTrade?.toUpperCase()})</h5>
              <h5
                className={`text-xl font-bold rounded-xl ${lastTrade === 'buy' ? 'bg-green-600' : 'bg-red-600'
                  } h-14 w-40 px-1 text-center py-3 transition-all duration-300`}
              >
                {trade?.PRICE.toFixed(3)} <span className='text-sm'>USTD</span>
              </h5>

            </div>
          </div>

        </div>
      </div>

      {/* Chart and Navbar */}
      {/* <CandleChart /> */}
      <Navbar />
    </div>
  );
};

export default Trade;