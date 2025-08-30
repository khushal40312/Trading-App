import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux'

import { useNavigate } from 'react-router-dom';
import { pendingAction } from '../store/pendingTrade';

const PendingTradeHistory = ({ setshowTradeHistory }) => {
    const dispatch = useDispatch()
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const trades= useSelector(store=>store.pendingTrades)

    const handleCancel = async (id) => {
        try {
          const response = await axios.delete(
            `${import.meta.env.VITE_BASE_URL}/trades/me/cancelPendingTrade/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
      
          // ✅ remove cancelled trade from Redux store
          dispatch(pendingAction.removePendingTrade(id));
      
          console.log("Cancelled trade:", response.data);
        } catch (error) {
          console.error("Error cancelling trade:", error);
      
          if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
            localStorage.removeItem('token');
            navigate('/session-expired');
          }
        }
      };
      

    useEffect(() => {
        const getTrades = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/trades/me/pendingtrades`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            dispatch(pendingAction.addPendingTrades(response.data))



            } catch (error) {
                console.error(error);
                if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                    localStorage.removeItem('token');
                    navigate('/session-expired');
                }
            }
        };
        getTrades();
    }, []);

    const formatPrice = (price) => {
        let num = Number(price);
        if (num?.toString().startsWith('0.0')) {
            return num?.toFixed(6);
        } else if (num >= 0.1) {
            return num?.toFixed(4);
        } else {
            return num?.toFixed(3);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50  ">
            <div className="bg-black p-6 rounded-xl shadow-lg w-full max-w-md text-white h-[70vh] relative ">
                <h2 className="text-xl font-bold text-[#21b121] mb-4">Orders</h2>
                <button
                    onClick={() => setshowTradeHistory(false)}
                    className="text-white p-1 font-bold absolute right-4 top-4 bg-green-500 rounded"
                >
                    Close
                </button>

                <div
                    id="scrollable-content"
                    style={{ height: "60vh", overflow: "auto" }}
                    className="w-full space-y-3"
                >
                    {trades?.map((item) => (
                        <div
                            key={item._id}
                            className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-black border border-2 border-dotted border-white/30 rounded-xl cursor-pointer active:border-green-500 transition"
                        >
                            {/* Row 1 */}
                            <div>
                                <h1 className="text-white text-sm">
                                    <span className="text-xs text-gray-400 block">Coin</span>
                                    {item?.symbol} ( {item.assetName} )
                                </h1>
                            </div>

                            <div className="text-right">
                                <h1 className="text-white text-sm">
                                    <span className="text-xs text-gray-400 block">Quantity</span>
                                    {formatPrice(item?.amount)}
                                </h1>
                            </div>

                            {/* Row 2 */}
                            <div>
                                <h1 className="text-white text-sm">
                                    <span className="text-xs text-gray-400 block">Status</span>
                                    {item?.status}
                                </h1>
                            </div>
                            <div className="text-right ">
                                <h1 className="text-xs">
                                    <span className="text-gray-400 block ">Order Type</span>{" "}
                                    <span
                                        className={`${item?.action === "buy" ? "text-green-400" : "text-red-500"
                                            } font-semibold`}
                                    >
                                        {item?.orderType.toUpperCase()}
                                    </span>
                                </h1>
                            </div>

                            {/* Row 3 */}
                            <div>
                                <h1 className="text-white text-sm">
                                    <span className="text-xs text-gray-400 block">
                                        {item.condition === "context.currentPrice"
                                            ? "Price"
                                            : "Condition"}
                                    </span>
                                    {item.condition === "context.currentPrice"
                                        ? item.price
                                        : item.condition}{" "}
                                    <span className="text-xs text-gray-500">USDT</span>
                                </h1>
                            </div>
                            <div className="text-right">
                                <h1 className="text-white text-xs">
                                    <span className="text-xs text-gray-400 block">DATE & TIME</span>
                                    {new Date(item?.createdAt).toLocaleString()}
                                </h1>
                            </div>

                            {/* Row 4 → Cancel Button */}
                            <div className="col-span-2 flex justify-end">
                                <button title='Cancel This Order'
                                    onClick={() => handleCancel(item._id)}
                                    className="mt-2 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded text-white font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PendingTradeHistory;
