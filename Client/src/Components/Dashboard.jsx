import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { RiBtcFill } from "react-icons/ri"
import { useDispatch, useSelector } from 'react-redux'
import { SearchAction } from '../store/trendingSearchSlice'
import { selectedTokenAction } from '../store/seletedTokenSlice'
import { Link, useNavigate } from 'react-router-dom'
import ReactApexChart from 'react-apexcharts'
import Cookies from 'js-cookie'
import { handleSessionError } from '../Functions/HandleSessionError'
import { Loader2, TrendingUp, Wallet, BarChart3 } from 'lucide-react'

// Skeleton Components
const BalanceSkeleton = () => (
  <div className="flex items-center mt-3 p-4 border border-gray-600 bg-black/20 backdrop-blur-xs rounded-lg animate-pulse">
    <div className="space-y-3 w-full">
      <div className="h-4 bg-gray-700 rounded w-1/3"></div>
      <div className="h-8 bg-gray-700 rounded w-2/3"></div>
      <div className="h-6 bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
)

const CryptoListSkeleton = () => (
  <div className="w-full px-2 mt-3 bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900 rounded overflow-x-auto space-x-4 flex items-start p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex flex-col items-center min-w-[100px] bg-black/30 border border-gray-600 rounded-xl backdrop-blur-xs p-3 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
        <div className="w-7 h-7 bg-gray-700 rounded-full my-2"></div>
        <div className="h-4 bg-gray-700 rounded w-12"></div>
      </div>
    ))}
  </div>
)

const PortfolioSkeleton = () => (
  <div className="flex overflow-x-auto space-x-4 h-full">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="min-w-56 flex justify-between bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900 border border-gray-600 rounded-xl p-3 animate-pulse">
        <div className="flex flex-col justify-between h-full space-y-2">
          <div className="h-4 bg-gray-700 rounded w-20"></div>
          <div className="h-5 bg-gray-700 rounded w-16"></div>
          <div className="h-5 bg-gray-700 rounded w-14"></div>
        </div>
        <div className="flex flex-col justify-between items-center space-y-2">
          <div className="w-7 h-7 bg-gray-700 rounded-xl"></div>
          <div className="h-6 bg-gray-700 rounded w-14"></div>
        </div>
      </div>
    ))}
  </div>
)

const ChartSkeleton = () => (
  <div className="rounded-xl border-2 border-gray-600 p-3 w-full bg-black animate-pulse">
    <div className="h-4 bg-gray-700 rounded w-32 mb-4"></div>
    <div className="h-64 bg-gray-700 rounded"></div>
  </div>
)

const Dashboard = () => {
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState({
    balance: true,
    portfolio: true,
    stocks: true,
    summary: true
  })

  // Your existing states
  const [balance, setBalance] = useState(0)
  const [portfolioInfo, setportfolioInfo] = useState({ assets: [], totalProfitLossPercentage: 0, performanceHistory: [] })
  const [stocks, setStocks] = useState([])
  const [inrPrice, setinrPrice] = useState(0)
  const [summary, setSummary] = useState({})

  const dispatch = useDispatch()
  const trendingSearch = useSelector(store => store.search)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const currencyType = Cookies.get('currency') || 'INR'
  const theme = useSelector(store => store.selectedTheme)

  const currentValue = summary?.currentValue || 0
  const actualBalance = currencyType === 'INR' ? (balance + currentValue) * inrPrice : balance + currentValue

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [])

  useEffect(() => {
    if (token) {
      const fetchUserSummary = async () => {
        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/me/summary`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setSummary(response.data)
        } catch (error) {
          console.error(error)
          handleSessionError(error, navigate)
        } finally {
          setLoadingStates(prev => ({ ...prev, summary: false }))
        }
      }

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
          handleSessionError(error, navigate)
        } finally {
          setLoadingStates(prev => ({ ...prev, balance: false }))
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
          handleSessionError(error, navigate)
        } finally {
          setLoadingStates(prev => ({ ...prev, portfolio: false }))
        }
      }

      const fetchStocks = async () => {
        if (trendingSearch.length === 0) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/dashboard-stocks`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
            setStocks(response.data)
            dispatch(SearchAction.addTrendingCoins(response.data))
          } catch (error) {
            console.error(error)
            handleSessionError(error, navigate)
          } finally {
            setLoadingStates(prev => ({ ...prev, stocks: false }))
          }
        } else {
          setLoadingStates(prev => ({ ...prev, stocks: false }))
        }
      }

      const getCurrencyRates = async (name) => {
        if (name !== 'INR') return

        try {
          const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/get-currency/${name}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setinrPrice(response.data.price)
        } catch (error) {
          console.error(error)
          handleSessionError(error, navigate)
        }
      }

      // Start all API calls
      fetchUserSummary()
      fetchUserBalance()
      fetchUserProtfolio()
      fetchStocks()
      getCurrencyRates(currencyType)

      // Set initial loading to false after minimum time
      const timer = setTimeout(() => {
        setIsInitialLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [navigate, token, currencyType, trendingSearch.length, dispatch])

  const filteredPerformance = (portfolioInfo?.performanceHistory || [])
    .filter((_, index) => index % 2 === 0)
  const recentHistory = filteredPerformance?.slice(-10) || []
  const uniqueChartData = [
    ...new Map(
      recentHistory.map(entry => [
        new Date(entry.date).getTime(),
        Number(entry.value.toFixed(2))
      ])
    ).entries()
  ].map(([time, value]) => [time, value])

  const chartSeries = [
    {
      name: "Portfolio Value",
      data: uniqueChartData
    }
  ]

  const findToken = (token, info) => {
    localStorage.setItem("trade", token)
    dispatch(selectedTokenAction.addToken(info?.item))
    navigate(`/trade/${token}`)
  }

  const displayList = stocks?.length === 0 ? trendingSearch : stocks

  const handleNoAsset = () => {
    navigate('/search')
  }

  // Show main loading screen initially
  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Loading Dashboard</h2>
            <p className="text-gray-400">Fetching your portfolio data...</p>
          </div>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='flex items-center justify-between p-2 w-full'>
        <img className='w-12 border border-[#21b121] rounded-xl' src="/logo.png" alt="logo" />
        <h2 className={`font-bold text-xl ${theme === 'light' ? 'text-black' : 'text-white'}`}>Dashboard</h2>
      </div>

      {/* Balance Section */}
      {loadingStates.balance ? (
        <BalanceSkeleton />
      ) : (
        <div className={`flex items-center mt-3 p-2 ${theme === 'light' ? 'border-white' : 'border-green-300'} bg-black/20 backdrop-blur-xs border-1 rounded-lg`}>
          <div>
            <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Total Balance</h3>
            <h1 className='font-bold text-xl text-white'>
              {Number(actualBalance)?.toFixed(2) || '----'}
              <span className='font-bolder text-xs p-2 rounded bg-black text-white'>{currencyType}</span>
            </h1>
            <p className='bg-[#21b121] text-center w-1/2 rounded font-bold text-sm text-white'>
              {parseFloat(portfolioInfo?.totalProfitLossPercentage?.toFixed(2)) || 0} %
            </p>
          </div>
        </div>
      )}

      {/* Crypto List */}
      {loadingStates.stocks ? (
        <CryptoListSkeleton />
      ) : (
        <div className={`w-full px-2 mt-3 ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900'} rounded overflow-x-auto space-x-4 flex items-start`}>
          {displayList?.map((crypto) => (
            <div
              onClick={() => findToken(crypto?.item?.symbol, crypto)}
              key={crypto?.item?.symbol}
              className={`flex flex-col px-3  items-center min-w-[200px] ${theme === 'light' ? 'bg-black/20 border-white' : 'bg-black/30 border-green-300'} rounded-xl border backdrop-blur-xs`}
            >
              <div className='flex items-center gap-5 w-full m-1'>
              <img
                  className='w-7 h-7  rounded-2xl'
                  src={crypto?.item?.thumb}
                  alt={crypto?.item?.symbol}
                />
              <p className={`font-bold text-sm ${theme === 'light' ? 'text-black' : 'text-white'} text-center`}>
                  {crypto?.item?.symbol}
                </p>
                <h1 className='font-bold text-sm text-gray-200'>
                  {crypto?.item?.data?.price.toString().startsWith('0.0')
                    ? `${crypto.item.data.price.toFixed(5)}$`
                    : `${crypto.item.data.price.toFixed(2)}$`}
                </h1>
                
               

              </div>

              <img className='w-40  mb-2' src={crypto.item.data.sparkline} alt="" />

            </div>
          ))}
        </div>
      )}

      <div className='flex justify-between p-1'>
        <h1 className='font-bold text-white text-sm text-center'>My Portfolio</h1>
        <Link to='/portfolio' className='font-bold text-white text-center'>View All</Link>
      </div>

      {/* Portfolio Section */}
      <div className='w-full h-33 p-2'>
        {loadingStates.portfolio ? (
          <PortfolioSkeleton />
        ) : (
          <div className='flex overflow-x-auto space-x-4 h-full'>
            {portfolioInfo?.assets.length === 0 && (
              <div className='flex justify-center h-full items-center'>
                <h2 onClick={handleNoAsset} className="p-3 bg-[#21b121] text-white font-bold rounded-md hover:bg-green-700 transition text-center cursor-pointer">
                  No assets Lets Buy some
                </h2>
              </div>
            )}
            {portfolioInfo?.assets.length !== 0 && portfolioInfo?.assets?.map(data => (
              <div key={data._id} className={`min-w-56 flex justify-between ${theme === 'light' ? 'bg-gradient-to-r from-green-800 via-green-400 to-green-500 border-white' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900 border-green-500'} border-1 rounded-xl p-3`}>
                <div className='flex flex-col justify-between h-full'>
                  <div>
                    <p className='text-white font-bold text-sm'>{data?.name}</p>
                    <h2 className={`${theme === 'light' ? 'text-black' : 'text-white'} font-bold`}>{data?.symbol}</h2>
                  </div>
                  <h2 className='text-white font-bold'>{data?.quantity.toFixed(3)}</h2>
                </div>
                <div className='flex flex-col justify-between items-center'>
                  <img className='w-7 h-7 rounded-xl border-1 border-black' src={data?.imageURL?.small} alt="token_logo" />
                  <p className='bg-[#21b121] text-center w-14 h-6 rounded font-bold text-sm text-white'>
                    {data?.profitLossPercentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='flex justify-between p-1'>
        <h1 className='font-bold text-white text-sm text-center'>Weekly Stats</h1>
        <Link to='/portfolio' className='font-bold text-white text-sm text-center'>View All</Link>
      </div>

      {/* Chart Section */}
      <div className="w-full px-4 py-3">
        {loadingStates.summary ? (
          <ChartSkeleton />
        ) : (
          <div className={`rounded-xl border-2 ${theme === 'light' ? 'border-white' : 'border-green-300'} p-3 w-full bg-black`}>
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
                    show: false,
                  },
                  dataLabels: {
                    enabled: false
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
                height={220}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard