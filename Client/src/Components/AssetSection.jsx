import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom';

const AssetSection = () => {
    const [Assets, setAssets] = useState([]);
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
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
    useEffect(() => {



        const fetchUserAssets = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/assets`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setAssets(response.data.assets)
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
        fetchUserAssets()
    }, [token, navigate])




    return (
        <>


            <h2 className='text-white font-bold text-sm px-2'>Assets</h2>
            <div className="  w-full h-[40vh]  overflow-y-auto space-y-4  bg-black/40 px-1 rounded ">


                {Assets?.map((item) => (<div key={item._id} className="flex items-center my-3 py-2 bg-black  border border-black/30 rounded-xl cursor-pointer active:border-green-500 transition justify-between px-2">
                    <div className='flex items-center gap-2'>
                        <img src={item?.imageURL.small} alt={item?.symbol} className="w-10 h-10 rounded-full bg-[#eeeeee] mr-3 object-contain" />
                        <div className='flex items-center  flex-col justify-between'>
                            <h4 className="font-medium text-white ">{item?.symbol}</h4>
                            <h1 className='font-bold text-sm text-center text-[#808080]'>
                                {item?.name}
                            </h1>
                        </div>
                    </div>

                    <div className='flex items-center w-20  flex-col justify-between'>
                        <h1 className='font-bold text-white '>{formatPrice(item?.quantity)}</h1>
                        <h1 className='flex items-center w-25 justify-center'>
                        
                        <p className='text-gray-400 text-xs'>{formatPrice(item?.currentValue)} <span>USDT</span></p>
                        </h1>
                        <p className={` text-left  rounded  text-sm ${item?.profitLossPercentage?.toString().startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                            {item?.profitLossPercentage?.toString().startsWith('-') ? item?.profitLossPercentage.toFixed(2) : `+${item?.profitLossPercentage.toFixed(2)}`}
                        </p>
                    </div>
                </div>))}


            </div>





        </>
    )
}

export default AssetSection
