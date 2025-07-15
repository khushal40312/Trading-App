import React from 'react'
import Navbar from '../Components/Navbar'
import { RiBtcFill } from "react-icons/ri";
import {
    LineChart, Line, Tooltip, ResponsiveContainer
  } from "recharts";
  
  const data = [
    { name: "Jan 10", value: 1000 },
    { name: "Jan 11", value: 1800 },
    { name: "Jan 12", value: 2526 },
    { name: "Jan 13", value: 2100 },
    { name: "Jan 14", value: 2900 },
  ];
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
const Home = () => {
    return (
        <div className='h-screen w-full bg-black  '>
            <div className='flex items-center justify-between  p-3 w-full   '> <img className='w-15  border border-[#21b121] rounded-xl' src="/logo.png" alt="logo" />
                <h2 className=' font-bold  text-xl text-[#21b121] '>Dashboard</h2></div>
            <div className='flex items-center mt-3  p-2 border-[#21b121] border-3 border-r-0  rounded-l-lg '>
                <div>
                    <h3 className='text-sm font-bold text-[#808080]'>Total Balance</h3>
                    <h1 className='font-bold text-xl text-[#21b121]  '>9482.23  <span className='font-bolder text-sm rounded bg-black text-white'>USD</span></h1>
                    <p className='bg-[#21b121] text-center w-1/2 rounded font-bold text-sm text-white'>+10%</p>

                </div>

            </div>
            <div className='w-full px-7 mt-3 bg-[#000000] rounded border-2 border-[#21b121]  '>
                <div className='flex justify-between items-center bg-[#000000]  rounded'>
                    <h1 className='font-bold text-sm text-[#808080] '>15% <p className='font-bold text-xl text-[#21b121]  text-center  '>
                        <span>
                            <RiBtcFill /> </span>BTC</p></h1>
                    <h1 className='font-bold text-sm text-[#808080] '>15% <p className='font-bold text-xl text-[#21b121]  text-center  '><span>
                        <RiBtcFill /> </span>BTC</p></h1>
                    <h1 className='font-bold text-sm text-[#808080] '>15% <p className='font-bold text-xl text-[#21b121]  text-center  '><span>
                        <RiBtcFill /> </span>BTC</p></h1>

                </div>


            </div>
            <div className='flex justify-between p-1'>
                <h1 className=' font-bold text-[#808080]  text-center '>My Portfolio</h1>
                <p className=' font-bold text-[#21b121]   text-center   '>View All</p>

            </div>
            <div className='w-full h-33 p-2'>
                <div className='flex overflow-x-auto space-x-4 h-full'>
                    {/* Card 1 */}
                    <div className='min-w-56 flex justify-between bg-[#0e0e0e] rounded p-3'>
                        <div className='flex flex-col justify-between h-full'>
                            <div>
                                <p className='text-[#808080] font-bold text-sm'>Ethereum</p>
                                <h2 className='text-white font-bold'>ETH</h2>
                            </div>
                            <h2 className='text-white font-bold'>$58753.2</h2>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <span className='invert'>
                                <RiBtcFill size={20} />
                            </span>
                            <p className='bg-[#21b121] text-center w-14 h-6 rounded font-bold text-sm text-white'>+10%</p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className='min-w-56 flex justify-between bg-[#0e0e0e] rounded p-3'>
                        <div className='flex flex-col justify-between h-full'>
                            <div>
                                <p className='text-[#808080] font-bold text-sm'>Ethereum</p>
                                <h2 className='text-white font-bold'>ETH</h2>
                            </div>
                            <h2 className='text-white font-bold'>$58753.2</h2>
                        </div>
                        <div className='flex flex-col justify-between items-center'>
                            <span className='invert'>
                                <RiBtcFill size={20} />
                            </span>
                            <p className='bg-[#21b121] text-center w-14 h-6 rounded font-bold text-sm text-white'>+10%</p>
                        </div>
                    </div>

                    {/* Add more cards as needed */}
                </div>
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
          <LineChart data={data}>
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
            <Navbar />

        </div>
    )
}

export default Home
