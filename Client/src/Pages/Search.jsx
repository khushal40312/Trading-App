import React, { useEffect, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import Skeleton from 'react-loading-skeleton';
import axios from 'axios';
import useDebounce from '../Functions/DebounceSearch';
import { useDispatch, useSelector } from 'react-redux';
import { SearchAction } from '../store/trendingSearchSlice';
import Navbar from '../Components/Navbar';
import { useNavigate } from 'react-router-dom';
import { selectedTokenAction } from '../store/seletedTokenSlice';

const AssetListSkeleton = () => (
    <div className="flex items-center mt-3 p-4 border border-gray-600 bg-black/20 backdrop-blur-xs rounded-lg animate-pulse overflow-y-auto ">
      <div className="space-y-3 w-full  ">
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>



      </div>
    </div>
  )
const Search = () => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState({});
    const [loading, setLoading] = useState(false);
    const [loading2, setLoading2] = useState(false);

    const token = localStorage.getItem('token')
    const debouncedInput = useDebounce(input.toUpperCase(), 600);
    const trendingSearch = useSelector(store => store.search)
    const dispatch = useDispatch()
    const navigate = useNavigate()
      const theme = useSelector(store=>store.selectedTheme)
    
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!debouncedInput || !token) return;
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/trades/get-suggestions?q=${debouncedInput}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setSuggestions(response.data)
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                                handleSessionError(error, navigate);
                
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedInput, token]);

    const submitHandler = (e) => {
        e.preventDefault();
        // Handle search submission logic if needed
    };
    useEffect(() => {

        if (trendingSearch.length === 0 && token) {
            setLoading2(true)
            const fetchStocks = async () => {

                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/dashboard-stocks`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })


                    dispatch(SearchAction.addTrendingCoins(response.data))
                    setLoading2(false)

                } catch (error) {
                    console.error(error)
                    setLoading2(false)
                                   handleSessionError(error, navigate);
                   
                } finally {

                    setLoading2(false)
                }
            }
            fetchStocks()
        }

    }, [trendingSearch])
   

    const findToken = (token, info) => {
        localStorage.setItem("trade", token)
        dispatch(selectedTokenAction.addToken(info))
        navigate(`/trade/${token}`);
    };
   

    
    return (
        <div className={`w-full  ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900'}`}>
            <form onSubmit={submitHandler} className="relative">
                <span className="absolute top-8 left-3">
                    <CiSearch size={30} />
                </span>
                <input
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-green-200 rounded w-full h-15 text-lg placeholder:text-black mt-4 pl-12 mb-2 border-2 border-[#21b121] "
                    type="text"
                    placeholder="BTC"
                />
            </form>
            {input.length === 0 && <div className="p-2  w-full h-screen overflow-y-auto space-y-4">
                <h2 className='text-white font-bold text-sm'>Top Searches</h2>
                {loading2 ? (
                                        <AssetListSkeleton />

                ) : (
                    trendingSearch?.map((item) => (
                        <div onClick={() => findToken(item.item.symbol, {coingeckoId:item.item.id,
                            image:item.item.thumb,name:item.item.name,symbol:item.item.symbol,
                            source:item.item.slug
                        })} key={item.item.symbol}  className="flex items-center my-3 p-2  border border-black/30 rounded-xl cursor-pointer active:border-green-500 transition justify-between">
                            <div className='flex items-center w-10'> <img src={item.item.thumb || ''} alt={item.item.name} className="w-10 h-10 rounded-full bg-[#eeeeee] mr-3 object-contain" />
                                <h4 className="font-medium text-white">{item.item.symbol || 'Unknown Token'}</h4>
                            </div>
                            <h1 className='font-bold text-sm text-center text-gray-300'>
                                {item?.item?.data?.price?.toString().startsWith('0.0')
                                    ? `${item.item.data.price.toFixed(5)} $`
                                    : `${item.item.data.price.toFixed(2)} $`}
                            </h1>

                            <p className='bg-[#21b121] text-center  rounded font-bold text-sm text-white'>
                                {item?.item?.data?.price_change_percentage_24h?.usd.toString().startsWith("-") ? `${(item?.item?.data?.price_change_percentage_24h.usd).toFixed(3)}` : `+${(item.item.data.price_change_percentage_24h.usd).toFixed(3)}`}
                            </p>
                        </div>
                    ))
                )}
            </div>}
            {loading ? (
                <div className="p-2  w-full h-screen">
                    <AssetListSkeleton />
                </div>

            ) : (input.length !=0 && <div className="p-2  w-full h-screen">


                    <div onClick={() => findToken(suggestions?.symbol, suggestions)}  className="flex items-center my-3 p-2 border-[#eeeeee] border-2 rounded-xl cursor-pointer active:border-green-500 transition">
                        <img src={suggestions?.image} alt={suggestions?.symbol} className="w-10 h-10 rounded-full bg-[#eeeeee] mr-3 object-contain" />
                        
                        <div className='flex justify-between w-full items-center'>

                        <h4 className="font-medium text-white">{suggestions?.symbol || 'Unknown Token'}</h4>
                        <p className='bg-[#21b121] text-center  rounded font-bold text-sm text-white p-2 '>{suggestions?.name} </p>
                        </div>
                       
                    </div>

                </div>
            )}

            <Navbar />
        </div>
    );
};

export default Search;
