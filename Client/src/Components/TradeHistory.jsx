import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from './Loading'
import axios from 'axios';
const TradeHistory = ({ currency, inrPrice, setshowTradeHistory }) => {

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [status, setStatus] = useState('completed');
    const [tradeType, setTradeType] = useState('buy');
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortBy, setSortBy] = useState('createdAt');
    const [trades, setTrades] = useState([]);
    const token = localStorage.getItem('token');

    const limit = 3;

    useEffect(() => {
        setPage(1);
        setTrades([]);
        setHasMore(true);
        getTrades({ page: 1, status, tradeType, sortOrder, sortBy });
    }, [status, tradeType, sortOrder, sortBy]);

    const getTrades = async (payload) => {

        const { page, status, tradeType, sortOrder, sortBy } = payload;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/trades/me?page=${page}&limit=${limit}&status=${status}&tradeType=${tradeType}&sortOrder=${sortOrder}&sortBy=${sortBy}`,

                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
            setTrades(prev => [...prev, ...response.data.trades]);

            if (response.data.trades.length < limit) {
                setHasMore(false);
            }

        } catch (error) {
            console.error(error)
            if (

                error.response?.data?.message?.toLowerCase().includes('session expired')
            ) {
                localStorage.removeItem('token');
                navigate('/session-expired');
            }
        }
    }
    const fetchMoreTrades = () => {
        if (hasMore && !loadingMore) {
            const nextPage = page + 1;
            setLoadingMore(true);
            setPage(nextPage); // optional if you use page only for tracking
            getTrades({ page: nextPage, status, tradeType, sortOrder, sortBy }).finally(() => {
                setLoadingMore(false);
            });
        }
    };


    const formatPrice = (price) => {
        let num;
        num = Number(price)
        if (num?.toString().startsWith('0.0')) {
            return num?.toFixed(6)
        } else if (num >= 0.1) {
            return num?.toFixed(4)
        } else {
            return num?.toFixed(3)
        }

    }

    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50 '>
            <div className="bg-black p-6 rounded-xl shadow-lg w-full max-w-md text-white h-[70vh] relative ">
                <h2 className="text-xl font-bold text-[#21b121] mb-4">Trades History</h2>

                <button onClick={() => setshowTradeHistory(false)} className='text-white p-1 font-bold absolute right-4 top-4 bg-green-500 rounded'>Close</button>

                <div className=' w-full justify-between flex  items-center '>




                    <div className='flex  justify-between w-full'>

                        <div className=' flex  items-center '>

                            <select value={status} onChange={e => setStatus(e.target.value)} className='w-20 text-xs bg-black' >

                                <option value="completed">completed</option>
                                <option value="pending">pending</option>
                                <option value="cancelled">cancelled</option>
                            </select>

                        </div>
                        <div className=' flex  items-center '>

                            <select value={tradeType} onChange={e => setTradeType(e.target.value)} className='w-13 text-xs bg-black' >

                                <option value="buy">buy</option>
                                <option value="sell">sell</option>

                            </select>

                        </div>
                        <div className=' flex  items-center '>

                            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className='w-19 text-xs bg-black'>
                                <option value="createdAt">createdAt</option>
                                <option value="quantity">quantity</option>
                                <option value="price">price</option>
                            </select>


                        </div>

                        <div className=' flex  items-center '>

                            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className='w-12 text-xs bg-black'>
                                <option value="asc">asc</option>
                                <option value="desc">desc</option>
                            </select>



                        </div>
                    </div>
                </div>
                <div
                    id="scrollable-content"
                    style={{ height: '60vh', overflow: 'auto' }}
                    className="w-full"
                >


                    <InfiniteScroll
                        dataLength={trades.length}
                        next={fetchMoreTrades}
                        hasMore={hasMore}
                        loader={loadingMore && <Loading />}
                        scrollableTarget="scrollable-content"
                        endMessage={
                            <div style={{ textAlign: 'center', marginTop: '3px' }}>
                                {/* <MoreSpinner /> */}
                                <b className='text-white'>Thats It</b>
                            </div>
                        }
                    >
                        {trades?.map((item) => (<div key={item._id} className="flex items-center my-1 py-2 bg-black  border  border-dotted border-2  border-white/30 rounded-xl cursor-pointer active:border-green-500 transition justify-between px-1 h-30">
                            <div className='flex items-start px-1   py-2   h-27 flex-col gap-4'>

                                <h1 className=' text-white text-left text-sm '><span className='text-xs text-gray-400'>Coin</span> {item?.symbol} </h1>
                                <h1 className=' text-white text-left text-sm '><span className='text-xs text-gray-400'>status</span> {item?.status} </h1>

                                <h1 className=' text-white text-left text-sm '><span className='text-xs text-gray-400'>fees</span> {formatPrice(currency === 'USDT' ? item?.fees : item?.fees * inrPrice)} {currency} </h1>


                            </div>

                            <div className='flex items-start  py-2   h-27 flex-col gap-4'>
                                <h1 className=' text-white text-sm'> <span className='text-xs text-gray-400'>Quantity</span> {formatPrice(item?.quantity)}</h1>

                                <h1 className=' text-white text-sm '> <span className={` ${item?.tradeType === 'buy' ? 'text-green-400' : "text-red-500"}  text-xs `}> {item?.tradeType.toUpperCase()}</span>  {formatPrice(currency === 'USDT' ? item?.price : item?.price * inrPrice)} {currency}</h1>



                                <h1 className=' text-white text-xs'> <span className='text-xs text-gray-400'>D&T</span> {new Date(item?.executedAt).toLocaleString()}</h1>


                            </div>
                        </div>))}
                    </InfiniteScroll>


                </div>



            </div>
        </div>
    )
}

export default TradeHistory
