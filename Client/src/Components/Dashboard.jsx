import axios from 'axios';
import React, { useState } from 'react'
import { useEffect } from 'react';
import { RiBtcFill } from "react-icons/ri";
import {
    LineChart, Line, Tooltip, ResponsiveContainer,
    BarChart
} from "recharts";
import { useDispatch, useSelector } from 'react-redux'
import { SearchAction } from '../store/trendingSearchSlice';
import { selectedTokenAction } from '../store/seletedTokenSlice';
import { Link, useNavigate } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';




const Dashboard = () => {
    const [balance, setBalance] = useState('----');
    const [portfolioInfo, setportfolioInfo] = useState();
    const [stocks, setStocks] = useState([]);
    const token = localStorage.getItem('token')
    const dispatch = useDispatch()
    const trendingSearch = useSelector(store => store.search)
   const navigate = useNavigate()
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
                    if (
                       
                        error.response?.data?.message?.toLowerCase().includes('session expired')
                      ) {
                        localStorage.removeItem('token');
                        navigate('/session-expired');
                      }
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
                    if (
                       
                        error.response?.data?.message?.toLowerCase().includes('session expired')
                      ) {
                        localStorage.removeItem('token');
                        navigate('/session-expired');
                      }
                }
            }
            if (trendingSearch.length === 0 && token) {
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
                        if (
                            
                            error.response?.data?.message?.toLowerCase().includes('session expired')
                          ) {
                            localStorage.removeItem('token');
                            navigate('/session-expired');
                          }

                    }
                }

                fetchStocks()
            }
            fetchUserProtfolio()
            fetchUserBalance()
        }

    }, [navigate,token])
    const filteredPerformance = (portfolioInfo?.performanceHistory || [])
    .filter((_, index) => index % 15 === 0); // ✅ pick every 3rd point
    const recentHistory =filteredPerformance?.slice(-10) || [];
    const uniqueChartData = [
      ...new Map(
        recentHistory.map(entry => [
          new Date(entry.date).getTime(),
          Number(entry.value.toFixed(2))
        ])
      ).entries()
    ].map(([time, value]) => [time, value]);
    
      
      const chartSeries = [
        {
          name: "Portfolio Value",
          data: uniqueChartData
        }
      ];
      
    
            
    const findToken = (token, info) => {
        localStorage.setItem("trade", token)
        dispatch(selectedTokenAction.addToken(info?.item))
        navigate(`/trade/${token}`);
    };
    const displayList = stocks?.length === 0 ? trendingSearch?.coins : stocks;
    return (
        <>
            <div className='flex items-center justify-between  p-2 w-full   '> <img className='w-12  border border-[#21b121] rounded-xl' src="/logo.png" alt="logo" />
                <h2 className=' font-bold  text-xl text-[#21b121] '>Dashboard</h2></div>
            <div className='flex items-center mt-3  p-2 border-[#21b121] border-3 border-r-0  rounded-l-lg '>
                <div>
                    <h3 className='text-sm font-bold text-[#808080]'>Total Balance</h3>
                    <h1 className='font-bold text-xl text-[#21b121]  '>{Number(balance).toFixed(2)}  <span className='font-bolder text-sm rounded bg-black text-white'>USDT</span></h1>

                    <p className='bg-[#21b121] text-center w-1/2 rounded font-bold text-sm text-white'>{
                        parseFloat(portfolioInfo?.totalProfitLossPercentage.toFixed(2))} %</p>

                </div>

            </div>
            
<div className='w-full px-2 mt-3 bg-[#000000] rounded border-2 border-[#21b121] overflow-x-auto space-x-4 flex items-start'>
  {displayList?.map((crypto) => (
    <div
      onClick={() => findToken(crypto?.item?.symbol, crypto)}
      key={crypto?.item?.symbol}
      className='flex flex-col items-center min-w-[100px] bg-[#000000] rounded border border-[#21b121]'
    >
      <h1 className='font-bold text-sm text-[#808080]'>
        {crypto?.item?.data?.price.toString().startsWith('0.0')
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
                <Link to='/portfolio' className=' font-bold text-[#21b121]   text-center   '>View All</Link>

            </div>
            <div className='w-full h-33 p-2'>

                <div  className='flex overflow-x-auto space-x-4 h-full'>
                    {/* Card 1 */}
                    {portfolioInfo?.assets.length === 0 && <div className='flex justify-center h-full items-center'><h2 className="p-3 bg-[#21b121] text-white font-bold rounded-md hover:bg-green-700 transition text-center">No assets Lets Buy some </h2></div>}
                {portfolioInfo?.assets.length !== 0 && portfolioInfo?.assets?.map(data => (<div key={data._id} className='min-w-56 flex justify-between bg-[#0e0e0e] rounded p-3'>
                        <div className='flex flex-col justify-between h-full'>
                            <div>
                                <p className='text-[#808080] font-bold text-sm'>{data?.name}</p>
                                <h2 className='text-white font-bold'>{data?.symbol}</h2>
                            </div>
                            <h2 className='text-white font-bold'>{data?.quantity.toFixed(3)}</h2>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                           <img className='w-7 h-7 rounded-xl ' src={data?.imageURL?.small} alt="token_logo" />
                            <p className='bg-[#21b121] text-center w-14 h-6 rounded font-bold text-sm text-white'>{data?.profitLossPercentage.toFixed(2)}%</p>
                        </div>
                    </div>))}



                    {/* Add more cards as needed */}
                </div>
            </div>

            <div className='flex justify-between p-1'>
                <h1 className=' font-bold text-[#808080] text-sm  text-center   '>Weekly Stats</h1>
                <p className=' font-bold text-[#21b121] text-sm  text-center   '>View All</p>
            </div>
            <div className="w-full px-4 py-3">
  <div className="bg-[#0e0e0e] rounded-xl p-3 w-full">
    <h2 className="text-sm text-white font-bold mb-2">Portfolio Performance</h2>
    {chartSeries[0].data.length === 0 ? (
      <p className="text-[#888] text-sm">No performance data</p>
    ) : (
        <ReactApexChart
  options={{
    chart: {
      type: 'area',
      background: '#0e0e0e',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    grid: {
      borderColor: '#333',
      strokeDashArray: 3
    },
    xaxis: {
      type: 'datetime',
      labels: {
        format: 'dd MMM',
        rotate: -45,
        style: {
          colors: '#888',
          fontSize: '10px'
        }
      },
      tickAmount: 5
    },
    yaxis: {
      show: false, // 👈 Hide Y-axis labels
    },
    dataLabels: {
      enabled: false // 👈 Don't show values on the chart itself
    },
    tooltip: {
      enabled: true,
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: val => `$${val.toFixed(2)}`
      },
      theme: 'dark'
    },
    stroke: {
      curve: 'smooth',
      width: 4,
      colors: ['#21b121']
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.7,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 90, 100]
      }
    },
    markers: {
      size: 0,
      hover: { size: 5 }
    }
  }}
  series={chartSeries}
  type="area"
  height={250}
/>

    )}
  </div>
</div>

        </>
    )
}

export default Dashboard
