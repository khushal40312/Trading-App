import React, { useEffect, useRef, useState } from 'react';
import ApexChart from 'react-apexcharts';

function LivePriceChart({ symbol = 'BTCUSDT' }) {
  const [series, setSeries] = useState([{ data: [] }]);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('wss://ws.bitget.com/v2/ws/public');
    wsRef.current = ws;

    const subscribeMsg = {
      op: 'subscribe',
      args: [{
        instType: 'SPOT',
        channel: 'ticker',
        instId: "BTCUSDT",
      }],
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.action === 'snapshot' || msg.action === 'update') {
        const price = parseFloat(msg.data[0].lastPr);
        const timestamp = new Date().getTime();

        setSeries(prev => {
          const newData = [...prev[0].data, { x: timestamp, y: price }];
          const trimmed = newData.slice(-100);
          return [{ data: trimmed }];
        });
      }
    };

    return () => ws.close();
  }, [symbol]);

  const options = {
    chart: {
      type: 'line',
      height: 350,
      animations: {
        enabled: true,
        easing: 'linear',
        dynamicAnimation: { speed: 1000 },
      },
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: '#aaa' } },
    },
    yaxis: {
      labels: { style: { colors: '#aaa' } },
    },
    stroke: {
      curve: 'smooth',
    },
    tooltip: {
      theme: 'dark',
    },
    theme: {
      mode: 'dark',
    },
  };

  return (
    <div className="bg-black p-4 rounded-xl">
      {/* <ApexChart options={options} series={series} type="line" height={350} /> */}
    </div>
  );
}

export default LivePriceChart;
