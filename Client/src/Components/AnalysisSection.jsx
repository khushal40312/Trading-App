import React, { useEffect, useState } from 'react'
import { IoMdEye } from "react-icons/io";
import { FaRegEyeSlash } from "react-icons/fa";
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import { useNavigate } from 'react-router-dom';
import { IoMdAddCircle } from "react-icons/io";
import AddFunds from './AddFunds';
const AnalysisSection = () => {
  const [showBalance, setshowBalance] = useState(true);
  const [inrPrice, setinrPrice] = useState(0);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const token = localStorage.getItem('token')
  const [portfolioInfo, setportfolioInfo] = useState();
  const [summary, setSummary] = useState({});
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('USDT');
  const [refreshBalance, setrefreshBalance] = useState(false);




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

      fetchUserBalance()

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
    fetchUserProtfolio()
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
        if (

          error.response?.data?.message?.toLowerCase().includes('session expired')
        ) {
          localStorage.removeItem('token');
          navigate('/session-expired');
        }
      }
    }
    fetchUserSummary()
  }, [navigate, token, refreshBalance])


  const getCurrencyRates = async (name) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/get-currency/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setinrPrice(response.data.price)
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

  const handleCurrencyChange = (name) => {
    setCurrency(name)
    if (!name || name === 'USDT' || inrPrice != 0) return
    getCurrencyRates(name)


  }



  const totalBalance = balance + summary?.currentValue;
  const INR = inrPrice * totalBalance;

  const filteredPerformance = (portfolioInfo?.performanceHistory || [])
    .filter((_, index) => index % 15 === 0); // ✅ pick every 3rd point
  const recentHistory = filteredPerformance?.slice(-10) || [];
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


    <div className='w-full p-2 rounded h-[58vh]'>
      <div className='flex px-2 gap-3 items-center my-1'>
        <h2 className='text-gray-400'>Total Balance</h2>
        <span onClick={() => setshowBalance(!showBalance)} className='invert'>
          {showBalance ? <IoMdEye /> : <FaRegEyeSlash />}
        </span>
      </div>

      <div className='flex px-2 gap-1 items-center my-1 '>
        {showBalance ? (
          <h1 className='font-bold text-2xl text-white'>
            {currency === 'USDT'
              ? formatPrice(totalBalance) || '-------'
              : formatPrice(INR) || '-------'}
          </h1>
        ) : (
          <h1 className='font-bold text-2xl text-white'>*****</h1>
        )}
        <select
          className='text-white font-bold rounded'
          onChange={(e) => handleCurrencyChange(e.target.value)}
        >
          <option className='bg-black text-white rounded' value='USDT'>
            USDT
          </option>
          <option className='bg-black text-white rounded' value='INR'>
            INR
          </option>
        </select>
      </div>

      <div className='flex items-center'>
        <p className='text-white px-2'>Total P&amp;L</p>
        <p
          className={`text-left rounded text-md px-2 ${summary?.totalProfitLossPercentage?.toString().startsWith('-')
              ? 'text-red-500'
              : 'text-green-500'
            }`}
        >
          {typeof summary?.totalProfitLossPercentage === 'number'
            ? summary.totalProfitLossPercentage.toString().startsWith('-')
              ? summary.totalProfitLossPercentage.toFixed(2)
              : `+${summary.totalProfitLossPercentage.toFixed(2)}`
            : '-------'}
        </p>
      </div>

      <div className='w-full py-3'>
        <div className='bg-[#0e0e0e] rounded-xl p-3 w-full'>
          <h2 className='text-sm text-white font-bold mb-2'>Portfolio Performance</h2>
          {chartSeries?.[0]?.data?.length === 0 ? (
            <p className='text-[#888] text-sm'>No performance data</p>
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
                  show: false
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
                    formatter: (val) =>
                      typeof val === 'number' ? `$${val.toFixed(2)}` : '-------'
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
              type='area'
              height={170}
            />
          )}
        </div>
      </div>

      <div className='flex px-3 gap-1 items-center my-1 w-full justify-center'>
        <div onClick={() => setShowAddFundsModal(true)} className='flex items-center gap-1'>
          <h1 className='invert'>
            <IoMdAddCircle size={30} />
          </h1>
          <h1 className='text-white font-bold'>Add Funds</h1>
        </div>
      </div>
      {showAddFundsModal && (
        <AddFunds
          onClose={() => setShowAddFundsModal(false)}
          onSuccess={() => {
            setrefreshBalance((prev) => !prev); 
            setShowAddFundsModal(false);

          }}
        />
      )}
    </div>


  )
}

export default AnalysisSection
