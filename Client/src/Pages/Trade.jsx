import React, { useEffect, useRef, useState } from 'react';
import CandleChart from '../Components/CandleChart'
// Single symbol (you said "only for one token")
const SYMBOL = 'BINANCE:BTCUSDT';

// Store your token in env for safety; fallback to literal if needed
const FINNHUB_WS_TOKEN = import.meta.env.VITE_FINNHUB_WS_TOKEN || 'd0fl0hpr01qr6dbso5ugd0fl0hpr01qr6dbso5v0';

function formatPrice(num, maxDecimals = 2) {
  if (num == null) return '—';
  // BTC price can need more decimals depending on feed; tune if needed
  return Number(num).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  });
}

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
  const [trade, setTrade] = useState(null);          // latest trade object
  const [initialPrice, setInitialPrice] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');

  const socketRef = useRef(null);
  const initialPriceRef = useRef(null);

  useEffect(() => {
    const url = `wss://ws.finnhub.io?token=${FINNHUB_WS_TOKEN}`;
    const ws = new WebSocket(url);
    socketRef.current = ws;

    const handleOpen = () => {
      setConnectionState('open');
      console.log('✅ Finnhub WS connected');

      // Subscribe once open
      ws.send(JSON.stringify({ type: 'subscribe', symbol: SYMBOL }));
    };

    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'trade' && Array.isArray(msg.data) && msg.data.length) {
          // For a single symbol feed, just take the last trade in the batch
          const last = msg.data[msg.data.length - 1];

          // capture first price once
          if (initialPriceRef.current == null && typeof last.p === 'number') {
            initialPriceRef.current = last.p;
            setInitialPrice(last.p);
          }

          setTrade({
            symbol: last.s,
            price: last.p,
            volume: last.v,
            time: last.t,     // already ms per Finnhub docs for crypto feed
            conditions: last.c,
          });
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    const handleClose = () => {
      setConnectionState('closed');
      console.log('❌ Finnhub WS disconnected');
    };

    const handleError = (err) => {
      setConnectionState('error');
      console.error('WS error:', err);
    };

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', handleClose);
    ws.addEventListener('error', handleError);

    return () => {
      // Unsubscribe (only if still open)
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'unsubscribe', symbol: SYMBOL }));
      }
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('error', handleError);
      ws.close();
    };
  }, []);

  // compute change vs initial
  const lastPrice = trade?.price ?? null;
  const change = (lastPrice != null && initialPrice != null) ? lastPrice - initialPrice : null;
  const changePct = (change != null && initialPrice) ? (change / initialPrice) * 100 : null;

  const handleBuy = () => {
    alert(`🟢 Buy ${SYMBOL} @ ${formatPrice(lastPrice, 2)}`);
  };

  const handleSell = () => {
    alert(`🔴 Sell ${SYMBOL} @ ${formatPrice(lastPrice, 2)}`);
  };

  const changeColor =
    change == null
      ? ''
      : change > 0
      ? 'text-green-400'
      : change < 0
      ? 'text-red-400'
      : 'text-zinc-100';

  return (
    <div className="p-6 text-white bg-black min-h-screen flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6">📈 Live Trading – {SYMBOL}</h2>

      <div className="w-full max-w-sm bg-zinc-900 rounded-xl p-6 shadow-xl space-y-4">
        {/* Connection status */}
        <div className="text-sm text-zinc-400">
          Status: {connectionState === 'open' ? 'Connected' : connectionState}
        </div>

        {/* Price */}
        <div className="text-center">
          <div className="text-4xl font-bold">{formatPrice(lastPrice, 2)}</div>
          <div className={`text-sm mt-1 ${changeColor}`}>
            {change != null
              ? `${change > 0 ? '+' : ''}${change.toFixed(2)} (${changePct?.toFixed(2)}%)`
              : '—'}
          </div>
        </div>

        {/* Trade meta */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-zinc-400">Last Volume</span>
            <span>{formatVolume(trade?.volume)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-400">Last Trade Time</span>
            <span>{formatTime(trade?.time)}</span>
          </div>
          <div className="flex flex-col col-span-2">
            <span className="text-zinc-400">Conditions</span>
            <span className="break-words">
              {trade?.conditions == null
                ? '—'
                : Array.isArray(trade.conditions)
                ? trade.conditions.join(', ')
                : String(trade.conditions)}
            </span>
          </div>
        </div>

        {/* Buy/Sell */}
        <div className="flex justify-center gap-6 pt-2">
          <button
            onClick={handleBuy}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-lg font-medium"
          >
            Buy
          </button>
          <button
            onClick={handleSell}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg text-lg font-medium"
          >
            Sell
          </button>
        </div>
      </div>
      <CandleChart/>
    </div>
  );
};

export default Trade;
