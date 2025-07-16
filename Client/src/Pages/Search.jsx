import React, { useEffect, useState } from 'react';
import { CiSearch } from 'react-icons/ci';
import Skeleton from 'react-loading-skeleton';
import axios from 'axios';
import useDebounce from '../Functions/DebounceSearch';

const Search = () => {
    const [input, setInput] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem('token')
    const debouncedInput = useDebounce(input, 600);

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
                setSuggestions(response.data);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
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

    return (
        <div className="w-full">
            <form onSubmit={submitHandler} className="relative">
                <span className="absolute top-8 left-3">
                    <CiSearch size={30} />
                </span>
                <input
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-[#eeeeee] rounded w-full h-15 text-lg placeholder:text-base mt-4 pl-12 mb-2 border-2 border-[#21b121] "
                    type="text"
                    placeholder="Search Token (e.g., BTC)"
                />
            </form>

            <div className="p-2  w-full">
                {loading ? (
                    <Skeleton count={6} height={60} containerClassName="space-y-3" />
                ) : (
                    suggestions?.map((item, index) => (
                        <div key={index} className="flex items-center my-3 p-2 border-[#eeeeee] border-2 rounded-xl cursor-pointer active:border-black transition">
                            <img src={item.thumb || ''} alt={item.name} className="w-10 h-10 rounded-full bg-[#eeeeee] mr-3 object-contain" />
                            <h4 className="font-medium">{item.name || 'Unknown Token'}</h4>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Search;
