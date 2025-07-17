import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { RiBtcFill } from "react-icons/ri";
import {
    LineChart, Line, Tooltip, ResponsiveContainer,
    BarChart
} from "recharts";
import { useDispatch } from 'react-redux'
import { SearchAction } from '../store/trendingSearchSlice';


const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black text-white text-sm p-2 rounded shadow-md border border-green-500">
                ${payload[0].value}
            </div>
        );
    }

    return null;
};


const Dashboard = () => {
    const [balance, setBalance] = useState('----');
    const [portfolioInfo, setportfolioInfo] = useState();
    const [stocks, setStocks] = useState([]);
    const token = localStorage.getItem('token')
    const dispatch = useDispatch()
    useEffect(() => {


        if (token) {
            const fetchUserBalance = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/balance`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })

                    setBalance(response.data.balance)
                } catch (error) {
                    console.error(error)
                }
            }
            const fetchUserProtfolio = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })

                    setportfolioInfo(response.data)
                } catch (error) {
                    console.error(error)
                }
            }
            const fetchStocks = async () => {

                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/dashboard-stocks`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })

                    setStocks(response.data.coins)
                    dispatch(SearchAction.addTrendingCoins(response.data))

                } catch (error) {
                    console.error(error)

                }
            }
            fetchStocks()
            fetchUserProtfolio()
            fetchUserBalance()
        }

    }, [])


    const chartData = portfolioInfo?.performanceHistory?.map(entry => ({
        name: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: entry.value
    })).reverse();

    return (
        <>
            <div className='flex items-center justify-between  p-2 w-full   '> <img className='w-12  border border-[#21b121] rounded-xl' src="/logo.png" alt="logo" />
                <h2 className=' font-bold  text-xl text-[#21b121] '>Dashboard</h2></div>
            <div className='flex items-center mt-3  p-2 border-[#21b121] border-3 border-r-0  rounded-l-lg '>
                <div>
                    <h3 className='text-sm font-bold text-[#808080]'>Total Balance</h3>
                    <h1 className='font-bold text-xl text-[#21b121]  '>{(Number(balance) / 85.9).toFixed(2)}  <span className='font-bolder text-sm rounded bg-black text-white'>USDT</span></h1>

                    <p className='bg-[#21b121] text-center w-1/2 rounded font-bold text-sm text-white'>{
                        parseFloat(portfolioInfo?.totalProfitLossPercentage.toFixed(2))} %</p>

                </div>

            </div>
            <div className='w-full px-2 mt-3 bg-[#000000] rounded border-2 border-[#21b121] overflow-x-auto space-x-4 flex items-start'>
                {stocks?.map((crypto) => (
                    <div
                        key={crypto?.item?.symbol}
                        className='flex flex-col items-center min-w-[100px]  bg-[#000000] rounded border border-[#21b121]'
                    >
                        <h1 className='font-bold text-sm text-[#808080]'>
                            {crypto?.item?.data?.price?.toString().startsWith('0.0')
                                ? `${crypto.item.data.price.toFixed(5)}$`
                                : `${crypto.item.data.price.toFixed(2)}$`}
                        </h1>
                        <img
                            className='w-7 h-7 my-2 rounded-2xl'
                            src={crypto?.item?.thumb}
                            alt={crypto?.item?.symbol}
                        />
                        <p className='font-bold text-md text-[#21b121] text-center'>
                            {crypto?.item?.symbol}
                        </p>
                    </div>
                ))}
            </div>

            <div className='flex justify-between p-1'>
                <h1 className=' font-bold text-[#808080]  text-center '>My Portfolio</h1>
                <p className=' font-bold text-[#21b121]   text-center   '>View All</p>

            </div>
            <div className='w-full h-33 p-2'>

                {portfolioInfo?.assets.length === 0 && <div className='flex justify-center h-full items-center'><h2 className="p-3 bg-[#21b121] text-white font-bold rounded-md hover:bg-green-700 transition text-center">No assets Lets Buy some </h2></div>}
                {portfolioInfo?.assets.length !== 0 && portfolioInfo?.assets?.map(data => (<div className='flex overflow-x-auto space-x-4 h-full'>
                    {/* Card 1 */}
                    <div className='min-w-56 flex justify-between bg-[#0e0e0e] rounded p-3'>
                        <div className='flex flex-col justify-between h-full'>
                            <div>
                                <p className='text-[#808080] font-bold text-sm'>{data?.name}</p>
                                <h2 className='text-white font-bold'>{data?.symbol}</h2>
                            </div>
                            <h2 className='text-white font-bold'>{data?.quantity}</h2>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <span className='invert'>
                                <RiBtcFill size={20} />
                            </span>
                            <p className='bg-[#21b121] text-center w-14 h-6 rounded font-bold text-sm text-white'>+10%</p>
                        </div>
                    </div>



                    {/* Add more cards as needed */}
                </div>))}
            </div>

            <div className='flex justify-between p-1'>
                <h1 className=' font-bold text-[#808080] text-sm  text-center   '>Weekly Stats</h1>
                <p className=' font-bold text-[#21b121] text-sm  text-center   '>View All</p>
            </div>
            <div className="w-full h-64 p-4 flex justify-center">
                <div className="bg-[#0e0e0e] rounded-xl p-2 min-w-[300px] w-full max-w-sm relative">
                    <div className="flex justify-between items-center text-white text-sm mb-2">
                        <span className="opacity-60">Weekly Stats</span>
                        <span className="text-green-500 font-medium cursor-pointer hover:underline">View More</span>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData || []}>
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#00FF7F"
                                strokeWidth={3}
                                dot={{ r: 5, stroke: '#000', strokeWidth: 2, fill: '#00FF7F' }}
                                activeDot={{ r: 6, fill: '#00FF7F', stroke: '#000', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <div className="text-white text-xs mt-2 opacity-50">Jan 12 2022</div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
