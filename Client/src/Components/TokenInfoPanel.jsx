import React, { useMemo } from 'react';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';

const TokenInfoPanel = React.memo(({ 
  tradeRef, 
  lastTrade, 
  animate, 
  token, 
  imageSrc, 
  priceRef, 
  tradecoin, 
  qtyRef, 
  recentTrades 
}) => {
  // Format price and quantity to avoid duplication of logic
  const formatPrice = (price) => {
    return price?.toString().startsWith('0.0') 
      ? price?.toFixed(5) 
      : price?.toFixed(2);
  };

  const formattedRecentTrades = useMemo(() => {
    return recentTrades?.slice().reverse().map((trade, idx) => ({
      ...trade,
      formattedPrice: formatPrice(trade?.PRICE),
      formattedQuantity: formatPrice(trade.LAST_TRADE_QUANTITY)
    }));
  }, [recentTrades]); // Only re-compute when `recentTrades` changes

  return (
    <div className="w-[44vw] h-[70vh] bg-black text-white p-1 ">
      <div className="flex items-center justify-center my-2">
        <img
          className="w-12 rounded-2xl"
          src={imageSrc}
          alt="logo"
        />
      </div>

      {/* Trade Side Indicator */}
      <div
        className={`rounded-full text-white text-md font-semibold flex items-center justify-center gap-2 shadow-lg transition-all duration-500 ${lastTrade === 'buy' ? 'bg-green-500' : 'bg-red-500'
          } ${animate ? 'scale-105' : 'scale-100'}`}
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

      <div className='border border-white border-3 rounded  py-1 mt-3 h-70'>
        <div className="flex justify-center items-center px-3  gap-1  rounded bg-gray-600 border border-2 border-black mx-1">
          <h5 className="text-xs text-white text-center">Price <span className="font-bold text-xs">(USDT)</span></h5>
          <h5 className="text-xs text-white text-right ">
            Quantity <span className="text-xs font-bold text-center">({tradecoin})</span>
          </h5>
        </div>

        {/* Price */}
        <div ref={priceRef} className='flex justify-center items-center py-3 gap-1  rounded bg-gray-600 border border-2 border-black mx-1'>
          <h5 className="text-xs text-white w-[50px] text-center  font-bold">
            {formatPrice(tradeRef.current?.PRICE)}
          </h5>
          <h5
            ref={qtyRef}
            className="text-xs text-white w-[50px] text-right font-bold"
          >
            {formatPrice(tradeRef.current?.LAST_TRADE_QUANTITY)}
          </h5>
        </div>

        <div className="">
          {formattedRecentTrades?.map((trade, idx) => (
            <div key={idx} className={`flex justify-center items-center py-3 gap-1  rounded bg-black/40 border border-2 border-black m-1 ${trade.SIDE === 'buy' ? 'bg-green-500' : 'bg-red-500'}   `}>
              <span className="text-xs text-black w-[50px] text-center  font-bold  ">
                {trade.formattedPrice}
              </span>
              <span className=" font-bold text-black text-right  w-[50px] text-xs  w-1">
                {trade.formattedQuantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex flex-col items-center ">
        <h5 className="text-md font-bold">Price ({tradecoin})</h5>
        <h5
          className={`text-xl font-bold rounded-xl 
            bg-green-500 p-2 `}
        >
          {formatPrice(tradeRef.current?.PRICE)} <span className="text-sm">USDT</span>
        </h5>
      </div>
    </div>
  );
});

export default TokenInfoPanel;