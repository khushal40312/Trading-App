import React, { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import axios from 'axios'

const TradeHistory = ({ currency = 'USDT', inrPrice = 1, setshowTradeHistory }) => {
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [status, setStatus] = useState('completed');
    const [tradeType, setTradeType] = useState('buy');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('createdAt');
    const [trades, setTrades] = useState([]);
    const token = localStorage.getItem('token');

    const limit = 3;

    const getTrades = useCallback(async (payload) => {
        const { page, status, tradeType, sortOrder, sortBy } = payload;
        
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BASE_URL}/trades/me?page=${page}&limit=${limit}&status=${status}&tradeType=${tradeType}&sortOrder=${sortOrder}&sortBy=${sortBy}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            // For first page, replace the trades array
            if (page === 1) {
                setTrades(response.data.trades);
                setInitialLoading(false);
            } else {
                // For subsequent pages, append to existing trades
                setTrades(prev => [...prev, ...response.data.trades]);
            }

            // Check if we have more data
            if (response.data.trades.length < limit) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

        } catch (error) {
            console.error('Error fetching trades:', error);
            setInitialLoading(false);
            
            // Handle session expired
            if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                localStorage.removeItem('token');
                // Navigate to session expired page if you have navigation setup
                // navigate('/session-expired');
            }
        }
    }, [limit, token]);

    // Reset and fetch initial data when filters change
    useEffect(() => {
        setPage(1);
        setTrades([]);
        setHasMore(true);
        setInitialLoading(true);
        getTrades({ page: 1, status, tradeType, sortOrder, sortBy });
    }, [status, tradeType, sortOrder, sortBy, getTrades]);

    const fetchMoreTrades = useCallback(() => {
        if (hasMore && !loadingMore && !initialLoading) {
            const nextPage = page + 1;
            setLoadingMore(true);
            setPage(nextPage);
            
            getTrades({ page: nextPage, status, tradeType, sortOrder, sortBy })
                .finally(() => {
                    setLoadingMore(false);
                });
        }
    }, [hasMore, loadingMore, initialLoading, page, status, tradeType, sortOrder, sortBy, getTrades]);

    const formatPrice = (price) => {
        const num = Number(price);
        if (num?.toString().startsWith('0.0')) {
            return num?.toFixed(6);
        } else if (num >= 0.1) {
            return num?.toFixed(4);
        } else {
            return num?.toFixed(3);
        }
    };

    // Simple infinite scroll implementation
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        
        // Trigger when user scrolls to within 100px of bottom
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            fetchMoreTrades();
        }
    };

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50'>
            <div className="bg-black p-6 rounded-xl shadow-lg w-full max-w-md text-white h-[70vh] relative">
                <h2 className="text-xl font-bold text-[#21b121] mb-4">Trades History</h2>

                <button 
                    onClick={() => setshowTradeHistory(false)} 
                    className='text-white p-1 font-bold absolute right-4 top-4 bg-green-500 rounded hover:bg-green-600 transition-colors'
                >
                    Close
                </button>

                <div className='w-full justify-between flex items-center mb-4'>
                    <div className='flex justify-between w-full gap-2'>
                        <select 
                            value={status} 
                            onChange={e => setStatus(e.target.value)} 
                            className='text-xs bg-gray-800 text-white p-1 rounded border border-gray-600'
                        >
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <select 
                            value={tradeType} 
                            onChange={e => setTradeType(e.target.value)} 
                            className='text-xs bg-gray-800 text-white p-1 rounded border border-gray-600'
                        >
                            <option value="buy">Buy</option>
                            <option value="sell">Sell</option>
                        </select>

                        <select 
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)} 
                            className='text-xs bg-gray-800 text-white p-1 rounded border border-gray-600'
                        >
                            <option value="createdAt">Date</option>
                            <option value="quantity">Quantity</option>
                            <option value="price">Price</option>
                        </select>

                        <select 
                            value={sortOrder} 
                            onChange={e => setSortOrder(e.target.value)} 
                            className='text-xs bg-gray-800 text-white p-1 rounded border border-gray-600'
                        >
                            <option value="asc">ASC</option>
                            <option value="desc">DESC</option>
                        </select>
                    </div>
                </div>

                <div
                    className="w-full overflow-auto"
                    style={{ height: '50vh' }}
                    onScroll={handleScroll}
                >
                    {initialLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader2 className="animate-spin text-green-500" size={32} />
                        </div>
                    ) : (
                        <>
                            {trades?.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="flex items-center my-2 py-3 bg-gray-900 border border-gray-700 rounded-xl hover:border-green-500 transition-colors justify-between px-3"
                                >
                                    <div className='flex items-start flex-col gap-2'>
                                        <h1 className='text-white text-sm'>
                                            <span className='text-xs text-gray-400'>Coin: </span>
                                            {item?.symbol}
                                        </h1>
                                        <h1 className='text-white text-sm'>
                                            <span className='text-xs text-gray-400'>Status: </span>
                                            <span className={`${item?.status === 'completed' ? 'text-green-400' : item?.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {item?.status}
                                            </span>
                                        </h1>
                                        <h1 className='text-white text-sm'>
                                            <span className='text-xs text-gray-400'>Fees: </span>
                                            {formatPrice(currency === 'USDT' ? item?.fees : item?.fees * inrPrice)} {currency}
                                        </h1>
                                    </div>

                                    <div className='flex items-start flex-col gap-2'>
                                        <h1 className='text-white text-sm'>
                                            <span className='text-xs text-gray-400'>Qty: </span>
                                            {formatPrice(item?.quantity)}
                                        </h1>
                                        <h1 className='text-white text-sm'>
                                            <span className={`text-xs ${item?.tradeType === 'buy' ? 'text-green-400' : "text-red-500"}`}>
                                                {item?.tradeType.toUpperCase()}: 
                                            </span>
                                            {formatPrice(currency === 'USDT' ? item?.price : item?.price * inrPrice)} {currency}
                                        </h1>
                                        <h1 className='text-white text-xs'>
                                            <span className='text-xs text-gray-400'>Date: </span>
                                            {new Date(item?.executedAt).toLocaleDateString()}
                                        </h1>
                                    </div>
                                </div>
                            ))}

                            {loadingMore && (
                                <div className="flex justify-center items-center py-4">
                                    <Loader2 className="animate-spin text-green-500" size={24} />
                                    <span className="ml-2 text-gray-400">Loading more...</span>
                                </div>
                            )}

                            {!hasMore && trades.length > 0 && (
                                <div className="text-center py-4">
                                    <span className="text-gray-400">No more trades to load</span>
                                </div>
                            )}

                            {!initialLoading && trades.length === 0 && (
                                <div className="text-center py-8">
                                    <span className="text-gray-400">No trades found</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TradeHistory;