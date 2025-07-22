import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BuySellPanel = React.memo(({ selectedSide, setSelectedSide, token_auth, livePrice, tradecoin, TokenDetails }) => {
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [availableBalance, setAvailableBalance] = useState(0);
    const [selected, setSelected] = useState('USDT');

    const navigate = useNavigate();
    // console.log(TokenDetails)
    // Fetch balance from API
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/balance`, {
                    headers: { Authorization: `Bearer ${token_auth}` }
                });

                setAvailableBalance(response.data.balance); // assume USDT balance
            } catch (error) {
                console.error('Error fetching balance:', error);
                if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                    localStorage.removeItem('token');
                    navigate('/session-expired');
                }
            }
        };
        fetchBalance();
    }, [token_auth, navigate]);

    const buyAsset = (payload) => {
        const { tradecoin, assetName, price, amount } = payload;
        if (!tradecoin || !assetName || !price || !amount) return;
        console.log(amount,price)
        const tradeData = {
            symbol: tradecoin,
            assetName,
            quantity: selected === 'USDT' ? (amount * price) : amount,
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
                        console.log(res);
                        return '✅ Successfully bought assets!';
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

        let calculatedToken;

        if (selectedSide === 'buy' && selected === 'USDT') {
            const amountInBase = (balance * percent) / 100;

            setAmount(amountInBase.toFixed(5));

        } else if (selectedSide === 'buy' && selected === tradecoin.toString()) {
            const amountInBase = (balance * percent) / 100;
            calculatedToken = amountInBase * livePrice;
            setAmount(calculatedToken.toFixed(5));



        }

    };

    const handleAssetChange = (e) => {
        setSelected(e.target.value)
        setAmount('');

    };

    const handleAmountChange = (e) => {


        let input = e.target.value;
        setAmount(input)


        if (selected === 'USDT' && selectedSide === 'buy') {
            if (input > availableBalance) {
                input = availableBalance;
                setAmount(input)
            } else {

                setAmount(input)
            }
        } else if (selected === tradecoin.toString() && selectedSide === 'buy') {
            let maxToken = availableBalance * livePrice;

            if (!input || input < 0) {
                setAmount('');
                return;
            } else if (input > maxToken) {
                input = maxToken;
                setAmount(input)
            } else {

                setAmount(input)
            }




        }
    };

    return (
        <div className="w-[50vw] h-[70vh] bg-black py-6">
            <div className="flex justify-center gap-2 mt-2">
                {['buy', 'sell'].map((side) => (
                    <button
                        key={side}
                        onClick={() => handleSideClick(side)}
                        className={`border border-2 px-5 py-2 rounded-xl font-bold text-white ${selectedSide === side
                            ? `bg-${side === 'buy' ? 'green' : 'red'}-500 border-white-500`
                            : 'bg-black border-white'
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

                    <p className="text-gray-400 text-xs mt-2">
                        Balance: {availableBalance} {selectedSide === 'buy' ? 'USDT' : tradecoin}
                    </p>
                </div>

                <button
                    onClick={() => buyAsset({ tradecoin, assetName: TokenDetails.coingeckoId, price, amount })}
                    className={`${selectedSide === 'buy' ? 'bg-green-600' : 'bg-red-600'
                        } text-xl font-bold text-white rounded-2xl w-40 px-6 py-6`}
                >
                    {selectedSide.toUpperCase()}
                </button>
            </div>
        </div>
    );
});

export default BuySellPanel;
