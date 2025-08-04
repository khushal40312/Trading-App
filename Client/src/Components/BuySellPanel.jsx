import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatPrice } from '../Functions/FormatPrice';
import { handleSessionError } from '../Functions/HandleSessionError';


const BuySellPanel = React.memo(({ selectedSide, setSelectedSide, token_auth, livePrice, tradecoin, TokenDetails,theme }) => {
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState(0);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [availableToken, setAvailableToken] = useState(0);
    const [selected, setSelected] = useState('USDT');
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/balance`, {
                    headers: { Authorization: `Bearer ${token_auth}` }
                });

                setAvailableBalance(response.data.balance); // assume USDT balance
            } catch (error) {
                console.error('Error fetching balance:', error);
                handleSessionError(error, navigate);
            }
        };
        fetchBalance();
    }, [token_auth, navigate]);

    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/assets/${tradecoin}`, {
                    headers: { Authorization: `Bearer ${token_auth}` }
                });
                
                setAvailableToken(response?.data?.asset?.quantity); // assume USDT balance
            } catch (error) {
                console.error('Error fetching asset:', error);
                handleSessionError(error, navigate);
            }
        };
        fetchAsset();
    }, [token_auth, navigate]);

    const buyAsset = (payload) => {
        const { tradecoin, assetName, price, amount } = payload;
        if (price <= 0 || amount <= 0) {
            toast.error("Invalid price or amount");
            return;
          }
          
        if (!tradecoin || !assetName || !price || !amount) return;
        let RoundoffQuantity = Number(formatPrice(amount / price));

        let RoundoffAmount = Number(formatPrice(amount))


        const tradeData = {
            symbol: tradecoin,
            assetName,
            quantity: selected === 'USDT' ? RoundoffQuantity : RoundoffAmount,
            price,
            notes: 'Long-term investment'
        };
        return toast.promise(
            axios.post(
                `${import.meta.env.VITE_BASE_URL}/trades/buy`,
                tradeData,
                {
                    headers: {
                        Authorization: `Bearer ${token_auth}`
                    }
                }
            ),
            {
                pending: 'Buying assets...',
                success: {
                    render({ data }) {
                        const res = data.data;
                       
                        setAvailableBalance(Number(res?.balance))
                        const tokenQuantity = res?.portfolioSummary?.assets.find((element) => element.symbol === tradecoin);
                        setAvailableToken(Number(tokenQuantity?.quantity))


                        return `✅Bought ${tradecoin} ${selected === 'USDT' ? RoundoffQuantity : RoundoffAmount} price: ${price}!`;
                    }
                },
                error: {
                    render({ data }) {
                        return data?.response?.data?.message || '❌ Failed to buy assets';
                    }
                }
            }
        );
    };
    const sellAsset = (payload) => {
        const { tradecoin, assetName, price, amount } = payload;
        if (price <= 0 || amount <= 0) {
            toast.error("Invalid price or amount");
            return;
          }
          
        if (!tradecoin || !assetName || !price || !amount) return;
        
        let RoundoffQuantity = Number(formatPrice(amount / price));
        let RoundoffAmount = Number(formatPrice(amount))



        const tradeData = {
            symbol: tradecoin,
            assetName,
            quantity: selected === 'USDT' ? RoundoffQuantity : RoundoffAmount,
            price,
            notes: 'Long-term investment'
        };
        return toast.promise(
            axios.post(
                `${import.meta.env.VITE_BASE_URL}/trades/sell`,
                tradeData,
                {
                    headers: {
                        Authorization: `Bearer ${token_auth}`
                    }
                }
            ),
            {
                pending: 'Selling assets...',
                success: {
                    render({ data }) {
                        const res = data.data;
                        setAvailableBalance(res.balance)
                        const tokenQuantity = res.portfolioSummary?.assets.find((element) => element.symbol === tradecoin);

                        setAvailableToken(tokenQuantity.quantity)
                        return `sold ${tradecoin} ${selected === 'USDT' ? RoundoffQuantity : RoundoffAmount} price: ${price}!`;
                    }
                },
                error: {
                    render({ data }) {
                        return data?.response?.data?.message || '❌ Failed to buy assets';
                    }
                }
            }
        );
    };

    useEffect(() => {
        if (livePrice && livePrice > 0) {
            setPrice(livePrice);
        }
    }, [livePrice]);

    const handleSideClick = (side) => {
        setSelectedSide(side);
        setAmount('');
    };
 
      
    const handlePercentageClick = (percent) => {
        if (!livePrice || livePrice <= 0) return;

        const balance = availableBalance;
        const token = availableToken;

        let calculatedToken;

        if (selectedSide === 'buy' && selected === 'USDT') {
            const amountInBase = (balance * percent) / 100;

            setAmount(formatPrice(amountInBase));

        } else if (selectedSide === 'buy' && selected === tradecoin.toString()) {
            const amountInBase = (balance * percent) / 100;
            calculatedToken = amountInBase / livePrice;
            setAmount(formatPrice(calculatedToken));
        } else if (selectedSide === 'sell' && selected === 'USDT') {
            const quantityToSell = (availableToken * percent) / 100;

            const usdtValue = quantityToSell * livePrice;
            setAmount(formatPrice(usdtValue));
        } else if (selectedSide === 'sell' && selected === tradecoin.toString()) {
            const amountInBase = (token * percent) / 100;
            setAmount(formatPrice(amountInBase));
        }

    };

    const handleAssetChange = (e) => {
        setSelected(e.target.value)
        setAmount('');

    };
   
      
      const handleAmountChange = (e) => {


        let input = e.target.value;
        setAmount(formatPrice(input))


        if (selected === 'USDT' && selectedSide === 'buy') {
            if (input > availableBalance) {
                input = availableBalance;
                setAmount(input)
            } else {
                setAmount(input)
            }
        } else if (selected === tradecoin.toString() && selectedSide === 'buy') {
            let maxToken = availableBalance / livePrice;

            if (!input || input < 0) {
                setAmount('');
                return;
            } else if (input > maxToken) {
                input = maxToken;
                setAmount(input)
            } else {

                setAmount(input)
            }
        } else if (selected === 'USDT' && selectedSide === 'sell') {
            let maxPrice = availableToken * livePrice;
            if (input > maxPrice) {
                input = maxPrice;
                setAmount(input)
            } else {
                setAmount(input)
            }
        } else if (selected === tradecoin.toString() && selectedSide === 'sell') {


            if (!input || input < 0) {
                setAmount('');
                return;
            } else if (input > availableToken) {
                input = availableToken;
                setAmount(input)
            } else {

                setAmount(input)
            }
        }
    };

    return (
        <div className={`w-[50vw] h-[70vh]  ${theme === 'light' ? 'bg-black/30  border-r-1 border-white  ' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900  border-r-1 border-green-300'} rounded py-6 backdrop-blur-xs`}>
            <div className="flex justify-center gap-2 mt-2">
                {['buy', 'sell'].map((side) => (
                    <button
                        key={side}
                        onClick={() => handleSideClick(side)}
                        className={`border border-2 px-5 py-2 rounded-xl font-bold text-white ${
                            selectedSide === side
                              ? (side === 'buy' ? 'bg-green-500 border-white' : 'bg-red-500 border-white')
                              : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900 border-white'
                          }`}
                    >
                        {side.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="flex flex-col items-center gap-8 mt-6">
                <button className="w-40 rounded-xl text-white bg-[#413f3f]">Market</button>

                <div className="flex flex-col items-center">
                    {/* Base Asset Select */}
                    <select
                        value={selected}
                        onChange={handleAssetChange}
                        className="text-white rounded mb-2 bg-[#413f3f] px-2 py-1"
                    >
                        <option value="USDT">USDT</option>
                        <option value={tradecoin}>{tradecoin}</option>
                    </select>

                    {/* Token Amount Input */}
                    <input
                        className="h-10 w-37 rounded text-white bg-[#413f3f] m-1 px-2"
                        type="number"
                        placeholder="Amount (token)"
                        value={amount}
                        onChange={handleAmountChange}
                    />

                    {/* Live Price Input (readonly or synced with livePrice) */}
                    <input
                        className="h-10 w-37 rounded text-white bg-[#413f3f] m-1 px-2"
                        type="number"
                        placeholder="Live Price"
                        value={price}
                        readOnly
                    />

                    {/* Percentage Buttons */}
                    <div className="flex gap-1 mt-2">
                        {[25, 50, 75, 100].map((percent) => (
                            <button
                                key={percent}
                                onClick={() => handlePercentageClick(percent)}
                                className="px-1 py-1 text-white border border-white rounded text-sm hover:bg-white hover:text-black transition"
                            >
                                {percent}%
                            </button>
                        ))}
                    </div>

                    <p className={`${theme === 'light' ?'text-black':'text-white'} text-xs mt-2`}>
                        Balance: {selectedSide === 'buy' ? formatPrice(availableBalance) : formatPrice(availableToken)} {selectedSide === 'buy' ? 'USDT' : tradecoin}
                    </p>
                </div>

                {selectedSide === "buy" ? <button
                    onClick={() => buyAsset({ tradecoin, assetName: TokenDetails.coingeckoId, price, amount })}
                    className='bg-green-600
                         text-xl font-bold text-white rounded-2xl w-40 px-6 py-6'
                >
                    Buy
                </button> :
                    <button
                        onClick={() => sellAsset({ tradecoin, assetName: TokenDetails.coingeckoId, price, amount })}
                        className='bg-red-600
                         text-xl font-bold text-white rounded-2xl w-40 px-6 py-6'
                    >
                        Sell
                    </button>}
            </div>
        </div>
    );
});

export default BuySellPanel;
