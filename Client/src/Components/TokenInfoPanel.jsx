import React, { useMemo } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import { formatPrice } from '../Functions/FormatPrice';

const TokenInfoPanel = React.memo(({
  tradeRef,
  lastTrade,

  imageSrc,
  priceRef,
  tradecoin,
  qtyRef,
  recentTrades,
  theme
}) => {

  const formattedRecentTrades = useMemo(() => {
    return recentTrades?.slice().reverse().map((trade, idx) => ({
      ...trade,
      formattedPrice: formatPrice(trade?.PRICE),
      formattedQuantity: formatPrice(trade.LAST_TRADE_QUANTITY)
    }));
  }, [recentTrades]); // Only re-compute when `recentTrades` changes
  const formattedCurrentPrice = useMemo(() => formatPrice(tradeRef.current?.PRICE), [tradeRef.current?.PRICE]);
  const formattedCurrentQty = useMemo(() => formatPrice(tradeRef.current?.LAST_TRADE_QUANTITY), [tradeRef.current?.LAST_TRADE_QUANTITY]);

  return (
    <div className={`w-[48vw] h-[70vh]  ${theme === 'light' ? 'bg-black/30  border-l-1 border-white' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900  border-l-1 border-green-300'} rounded text-white p-1 backdrop-blur-xs `}>
      <div className="flex items-center justify-center my-2">
        <img
          className="w-12 rounded-2xl"
          src={imageSrc || '/logo.png'}
          alt="logo"
        />

      </div>

      {/* Trade Side Indicator */}
      <div
        title={`Last Trade: ${lastTrade}`}
        aria-label={`Last Trade: ${lastTrade}`}
        className={`rounded-full text-white text-md font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-500 ${lastTrade === 'buy' ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-800' : 'bg-gradient-to-r from-red-500 via-red-400 to-red-500'}`}
      >

        {lastTrade === 'buy' ? (
          <>
            <AiOutlineArrowUp className="text-white text-xl" />
            BUY
          </>
        ) : (
          <>
            <AiOutlineArrowDown className="text-white text-xl" />
            SELL
          </>
        )}
      </div>

      <div className="flex justify-center items-center px-3 gap-1 w-full rounded bg-gray-600 border border-2 border-white my-1 ">


        <table className={`w-full  mt-2 text-xs ${formattedRecentTrades?.length > 3 ? 'h-70' : ''}`}>
          <thead>
            <tr className="text-white bg-gray-700">
              <th className="px-2 py-1 text-left">Price (USDT)</th>
              <th className="px-2 py-1 text-right">Quantity ({tradecoin})</th>
            </tr>
            <tr className="text-white bg-gray-700 backdrop-blur-md ">
              <th ref={priceRef} className="px-4 py-2 text-left ">{formattedCurrentPrice}</th>
              <th ref={qtyRef} className="px-2 py-2 text-right ">{formattedCurrentQty}</th>
            </tr>
          </thead>
          <tbody>
            {formattedRecentTrades?.map((trade) => (
              <tr
                key={`${trade.TIMESTAMP}-${trade.SIDE}`}
                className={`${trade.SIDE === 'buy' ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-800' : 'bg-gradient-to-r from-red-500 via-red-400 to-red-500'} text-black `}
              >
                <td className="px-2 py-2 font-bold ">{trade.formattedPrice}</td>
                <td className="px-2 py-2 font-bold text-right ">{trade.formattedQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Total */}
      <div className="flex flex-col items-center ">
        <h5 className="text-md font-bold">Price ({tradecoin})</h5>
        <h5
          className={`text-xl font-bold rounded-xl 
            bg-gradient-to-r from-green-500 via-green-400 to-green-800 p-2 `}
        >
          {formattedCurrentPrice} <span className="text-sm">USDT</span>
        </h5>
      </div>
    </div>
  );
});

export default TokenInfoPanel;