import React, { useEffect, useMemo, useState } from 'react';
import ApexCharts from 'react-apexcharts';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../Components/Navbar';
import Loading from '../Components/Loading';
import { handleSessionError } from '../Functions/HandleSessionError';

const CandleChart = () => {
  const [tempTokenInfo, setTempTokenInfo] = useState({});


  const [selected, setSelected] = useState('1');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const token_auth = localStorage.getItem('token');
  const recentToken = localStorage.getItem('trade')
  const selectedToken = useSelector((store) => store.selectedToken);
  const token_ID = token ? token : recentToken;
  const navigate = useNavigate();
  // const symbol = token.
  const tokenInfo = useMemo(() => {
    return Object.keys(selectedToken).length ? selectedToken : tempTokenInfo;
  }, [selectedToken, tempTokenInfo]);
  
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!token_auth || Object.keys(selectedToken || {}).length === 0 || !token_ID) return;



      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/trades/get-suggestions?q=${token_ID.toString().toUpperCase()}`, {
          headers: {
            Authorization: `Bearer ${token_auth}`
          }
        });

        setTempTokenInfo(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        if (

          err.response?.data?.message?.toLowerCase().includes('session expired')
        ) {
          localStorage.removeItem('token');
          navigate('/session-expired');
        }
      }
    };

    fetchSuggestions();
  }, [selectedToken, token_ID, token_auth]);






  const fetchFromBitget = async (interval) => {

    if (tempTokenInfo?.symbol || selectedToken?.symbol) {

      try {
        setLoading(true);
        const endTime = Date.now();
        const startTime = endTime - 60 * 60 * 1000; // last hour (can be modified based on interval)
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/trades/bitget/candles/${tempTokenInfo?.symbol || selectedToken?.symbol}?interval=${interval}&startTime=${startTime}&endTime=${endTime}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${token_auth}`
            },
          }
        );

        const candles = response.data.data.map(candle => ({
          x: new Date(Number(candle[0])),
          y: [
            parseFloat(candle[1]), // open
            parseFloat(candle[2]), // high
            parseFloat(candle[3]), // low
            parseFloat(candle[4])  // close
          ]
        })).reverse();

        setSeries([{ data: candles }]);
      } catch (err) {
        console.error('Bitget fetch error:', err);
        handleSessionError(err, navigate);

      } finally {
        setLoading(false);
      }
    }
  };

  const fetchFromCoinGecko = async (days) => {
    if (tempTokenInfo?.coingeckoId || selectedToken?.coingeckoId) {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/trades/geko/candles/${tempTokenInfo?.coingeckoId || selectedToken.coingeckoId}?days=${days}`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${token_auth}`
            }
          }
        );
        
        const candles = response.data.map(candle => ({
          x: new Date(candle[0]),
          y: [candle[1], candle[2], candle[3], candle[4]]
        }));

        setSeries([{ data: candles }]);
      } catch (err) {
        console.error('CoinGecko fetch error:', err);
        handleSessionError(err, navigate);


      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!tokenInfo?.symbol && !tokenInfo?.coingeckoId) return;
  
    if (['1min', '3min', '5min', '15min', '30min', '1h'].includes(selected)) {
      fetchFromBitget(selected);
    } else {
      fetchFromCoinGecko(selected);
    }
  }, [selected, tokenInfo?.symbol, tokenInfo?.coingeckoId]);
  


  const options = {
    chart: {
      type: 'candlestick',
      height: '100%',
      toolbar: { show: true },
      animations: { enabled: false },
    },
    grid: { borderColor: '#444' },
    tooltip: {
      theme: 'dark',
      x: { format: 'dd MMM HH:mm' },
    }, title: {
      text: `${tempTokenInfo?.symbol || selectedToken?.symbol}/USDT – ${["1", "7", "30"].includes(selected) ? `${selected} day` : selected
        }`,
      align: 'left',
      style: { fontSize: '16px', color: '#fff' },
    },
    xaxis: { type: 'datetime' },
    yaxis: { tooltip: { enabled: true } },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: { height: 300 }
        }
      },
      {
        breakpoint: 480,
        options: {
          chart: { height: 250 }
        }
      }
    ]
  };
  const imageSrc = selectedToken?.image || tempTokenInfo?.thumb || tempTokenInfo?.image;

  return (
    <>
    
      {(loading || !tempTokenInfo?.symbol && !selectedToken?.symbol) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
          <Loading />
        </div>
      )}

      {tempTokenInfo?.symbol || selectedToken?.symbol ? (
        <div className='flex w-full h-screen bg-black justify-center items-center'>
          <div className="p-4 text-white bg-gray-900 w-full h-screen rounded">
            <div className="max-w-4xl mx-auto border border-green-600  rounded border-4 p-3 h-[90vh]">
            <div className='flex items-center justify-between'>

            <img
                className="w-12 rounded-2xl"
                src={imageSrc}
                alt="logo"
              />
            <span className='text-xs'>Data provided by <a className='text-sm font-bold text-green-500' href="https://www.coingecko.com">CoinGecko</a>  </span>
            </div>
              

              <h2 className="text-xl font-bold mb-2">
                {tempTokenInfo?.symbol || selectedToken?.symbol}/USDT
              </h2>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="mb-4 p-1 rounded border bg-gray-800 text-white border-yellow-400"
              >
                <option value="1min">1 Minute</option>
                <option value="3min">3 Minute</option>
                <option value="5min">5 Minute</option>
                <option value="15min">15 Minutes</option>
                <option value="30min">30 Minute</option>
                <option value="1h">1 Hour</option>
                <option value="1">1 Day</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
              </select>

              <ApexCharts
                options={options}
                series={series}
                type="candlestick"
                height={500}
              />
            </div>
          </div>

          <Navbar />
        </div>
      ) : null}
    </>
  );
}

export default CandleChart;
