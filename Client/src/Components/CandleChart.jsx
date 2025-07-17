import React, { useEffect, useState } from 'react';
import ApexChart from 'react-apexcharts';

function CandleChart() {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/pi-network/ohlc?vs_currency=usd&days=1')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(([timestamp, open, high, low, close]) => ({
          x: new Date(timestamp),
          y: [open, high, low, close],
        }));
        setSeries([{ data: formatted }]);
      })
      .catch(console.error);
  }, []);

  const options = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: '#0d0d0d',
      toolbar: {
        show: true,
        tools: {
          zoom: true,
          pan: true,
          download: true,
        },
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: '#ccc' },
      },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: { colors: '#ccc' },
      },
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM HH:mm',
      },
    },
    grid: {
      borderColor: '#333',
    },
    title: {
      text: 'BTC/USDT – 1 Day Candlesticks',
      align: 'left',
      style: {
        color: '#fff',
        fontSize: '18px',
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mt-10 p-4 bg-black rounded-xl shadow-xl text-white">
      <ApexChart options={options} series={series} type="candlestick" height={350} />
    </div>
  );
}

export default CandleChart;
