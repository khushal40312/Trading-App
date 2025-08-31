import axios from 'axios'
import React, { useEffect, useState } from 'react'

import { useNavigate } from 'react-router-dom';
import { handleSessionError } from '../Functions/HandleSessionError'
import { formatPrice } from '../Functions/FormatPrice';
const AssetListSkeleton = () => (
    <div className="flex items-center mt-3 p-4 border border-gray-600 bg-black/20 backdrop-blur-xs rounded-lg animate-pulse overflow-y-auto ">
      <div className="space-y-3 w-full  ">
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>
        <div className="h-8 bg-gray-700 rounded w-full"></div>

      </div>
    </div>
  )
const AssetSection = ({ inrPrice, currency, balance,setLoadingStates,loadingStates }) => {
    const [Assets, setAssets] = useState([]);
    const navigate = useNavigate()
    const token = localStorage.getItem('token')

  
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
            }finally {
                setLoadingStates(prev => ({ ...prev, assets: false }))
              }
          


        }
        fetchUserAssets()
    }, [token, navigate])

    useEffect(() => {
        if (balance && inrPrice && !Assets.find(a => a.symbol === 'USDT')) {
          setAssets(prev => [
            ...prev,
            {
              symbol: "USDT",
              imageURL: {
                small: "/USDT.png"
              },
              _id: "2832rytrghr8h39",
              name: "Tether",
              quantity: balance,
              currentValue: balance,
              profitLossPercentage: 0
            }
          ]);
        }
      }, [balance, inrPrice, Assets]);
      


    return (
        <>


            <h2 className='text-white font-bold text-sm px-2'>Assets</h2>
            {loadingStates.assets ? (
        <AssetListSkeleton />
      ) : (  <div className="  w-full h-[40vh]  overflow-y-auto space-y-4  bg-black/40 px-1 rounded ">


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

                            <p className='text-gray-400 text-xs'>{currency === "USDT" ? formatPrice(item?.currentValue) || '----' : formatPrice(item?.currentValue * inrPrice) || '----'} <span>{currency}</span></p>
                        </h1>
                       {item.symbol!=="USDT"?<p className={` text-left  rounded  text-sm ${item?.profitLossPercentage?.toString().startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                            {item?.profitLossPercentage?.toString().startsWith('-') ? item?.profitLossPercentage.toFixed(2)||'--' : `+${item?.profitLossPercentage.toFixed(2)||'--'}`}
                        </p>:
                        <p className={` text-left  rounded text-white  text-sm`}>
                        ---
                    </p>}
                        
                    </div>
                </div>))}


            </div>)}





        </>
    )
}

export default AssetSection
