import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import { FaEdit } from "react-icons/fa";
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import { selectedThemeAction } from '../store/themeSlice';
const ProfileImageSkeleton = () => (
    <div className="rounded-[50%] border-2 border-green-600  p-2  w-14 bg-black h-12 animate-pulse">
        <div className="h-7 rounded-[30%] bg-gray-700 rounded w-9 h-4 "></div>
    </div>
)
const ProfileSkeleton = () => (
    <div className="flex items-center mt-3 p-4 border border-gray-600 bg-black/20 backdrop-blur-xs rounded-lg animate-pulse overflow-y-auto ">
        <div className="space-y-3 w-full  ">
            <div className='flex items-center gap-15'>
                <div className="h-8 bg-gray-700 rounded w-4/5"></div>
                <div className="rounded-[50%] border-2 border-green-600  p-2  w-14 bg-black h-12 animate-pulse">
                    <div className="h-7 rounded-[30%] bg-gray-700 rounded w-9 h-4 "></div>
                </div>
            </div>
            <div className="h-8 bg-gray-700 rounded w-full"></div>
        </div>
    </div>)

const StatsSkeleton = () => (
    <div className="flex items-center mt-3 p-4 border border-gray-600 bg-black/20 backdrop-blur-xs rounded-lg animate-pulse overflow-y-auto ">
        <div className="space-y-3 w-full  ">
                <div className="h-5 bg-gray-700 rounded w-full"></div>
                <div className="h-5 bg-gray-700 rounded w-full"></div>
                <div className="h-5 bg-gray-700 rounded w-full"></div>
            <div className="h-5 bg-gray-700 rounded w-full"></div>
            <div className="h-5 bg-gray-700 rounded w-full"></div>
            <div className="h-5 bg-gray-700 rounded w-full"></div>
        
        </div>
    </div>)
const Profile = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const [user, setuser] = useState({});

    const [loadingStates, setLoadingStates] = useState({


        profileImage: false,
        profile: true,
        stats: true,
        // summary: true
    })
    const [isZoomed, setIsZoomed] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(Cookies.get('currency'));
    const [stats, setStats] = useState({});
    const theme = useSelector(store => store.selectedTheme)
    const dispatch = useDispatch();


    const logoutUser = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout/${token}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            localStorage.removeItem('token')
            localStorage.removeItem('trade')
            Cookies.remove('theme');
            Cookies.remove('currency');
            navigate('/')

        } catch (error) {
            localStorage.removeItem('token')
            localStorage.removeItem('trade')
            Cookies.remove('theme');
            Cookies.remove('currency');
            navigate('/')

            console.error(error)
            if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                localStorage.removeItem('token');
                navigate('/session-expired');
            }
        }
    }


    useEffect(() => {
        if (token) {
            const fetchUserProfile = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    setuser(response.data.user)


                    Cookies.set('theme', response?.data?.user.settings.theme);
                    Cookies.set('currency', response?.data?.user.settings.currency);

                } catch (error) {
                    console.error(error)
                    if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                        localStorage.removeItem('token');
                        navigate('/session-expired');
                    }
                } finally {
                    setLoadingStates(prev => ({ ...prev, profile: false }));

                }
            }
            const fetchUserStats = async () => {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/trades/me/stats`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    setStats(response?.data?.data)

                } catch (error) {
                    console.error(error)
                    if (error.response?.data?.message?.toLowerCase().includes('session expired')) {
                        localStorage.removeItem('token');
                        navigate('/session-expired');
                    }
                }finally{

                    setLoadingStates(prev => ({ ...prev, stats: false }));

                }
            }
            fetchUserStats()
            fetchUserProfile()
        }
    }, [navigate, token])

    const handleImageClick = () => {
        setIsZoomed(true);
    }

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    }

    const handleImageUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('picture', selectedFile);
        setShowUploadModal(false);
        setLoadingStates(prev => ({ ...prev, profileImage: true }))
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/update-profileIMG`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setuser(prev => ({ ...prev, profilePicture: response.data.profilePicture }));

            setIsZoomed(false);
        } catch (error) {
            console.error("Upload error:", error);
        } finally {

            setLoadingStates(prev => ({ ...prev, profileImage: false }))

        }


    }
    const handleSettingChanges = (payload) => {
        const { value, type } = payload;

        if (type === 'theme') {
            const data = {
                fullname: {

                    firstname: user.fullname.firstname
                },
                settings: {
                    notifications: true,
                    theme: value,
                    currency: user.settings.currency
                }
            }
            handleProfileUpdate(data)


        } else {

            const data = {
                fullname: {

                    firstname: user.fullname.firstname
                },
                settings: {
                    notifications: true,
                    theme: user.settings.theme,
                    currency: value
                }
            }


            handleProfileUpdate(data)
        }

    }
    const handleProfileUpdate = async (data) => {
        if (!data) return;

        try {
            const response = await axios.put(`${import.meta.env.VITE_BASE_URL}/users/profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,

                }
            });
            dispatch(selectedThemeAction.changeTheme(response?.data?.updatedUser.settings.theme))
            Cookies.set('theme', response?.data?.updatedUser.settings.theme);
            Cookies.set('currency', response?.data?.updatedUser.settings.currency);

            setSelectedCurrency(response?.data?.updatedUser.settings.currency)

        } catch (error) {
            console.error("Upload error:", error);
        }
    }


    return (
        <>
            <div className={`h-screen overflow-y-auto w-full ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800 ' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900'}  p-5 `}>
                <h1 className='text-white font-bold text-xl m-2 '>Profile</h1>

                <div className='flex p-3 gap-5 rounded-xl flex-col w-full h-[80vh] bg-black/80'>

                    {loadingStates.profile ? (
                        <ProfileSkeleton />
                    ) : (
                        <>
                            <div className='w-full flex justify-between items-center px-2 mt-2'>
                                <h1 className='text-white text-2xl font-bold'>{user?.fullname?.firstname || '------'} {user?.fullname?.lastname || ''}</h1>
                                {loadingStates.profileImage ? (
                                    <ProfileImageSkeleton />
                                ) : (<img
                                    className='w-25 h-17 rounded-full border-3 border-green-400 cursor-pointer'
                                    src={user?.profilePicture || '/default.png'}
                                    alt="Profile"
                                    onClick={handleImageClick}
                                />)}
                            </div>

                            <h1 className='text-gray-200 text-md font-bold'>Settings </h1>
                            <div className='w-full flex justify-between items-center '>
                                <span className='font-bold text-white text-sm'>Theme</span>
                                <select value={theme} onChange={(e) => handleSettingChanges({ value: e.target.value, type: "theme" })} className=' text-white font-bold rounded-xl text-sm'>


                                    <option className='bg-black text-white rounded' value="dark">DARK</option>
                                    <option className='bg-black text-white rounded' value="light">LIGHT</option>
                                </select>
                            </div>
                            <div className='w-full flex justify-between items-center '>
                                <span className='font-bold text-white text-sm'>Currency</span>
                                <select value={selectedCurrency} onChange={(e) => handleSettingChanges({ value: e.target.value, type: "currency" })} className=' text-white font-bold rounded-xl text-sm'>
                                    <option className='bg-black text-white rounded' value="USDT">USDT</option>
                                    <option className='bg-black text-white rounded' value="INR">INR</option>
                                </select>
                            </div>
                        </>)}
                    <div className='flex flex-col gap-3'>
                        <h1 className='text-gray-200 text-md font-bold mb-2'>Stats </h1>

                        {loadingStates.stats ? (
                            <StatsSkeleton />
                        ) : (

                            <>
                             <div className='w-full flex justify-between items-center '>
                                <span className='font-bold text-white text-sm'>Total Trades</span>

                                <span
                                    className=" text-center w-19 rounded text-white bg-[#413f3f] m-1 px-2"
                                // type="text"


                                // readOnly
                                >{stats?.totalTrades || 0} </span>
                            </div>
                                <div className='w-full flex justify-between items-center '>
                                    <span className='font-bold text-white text-sm'>Total Buy</span>
                                    <span
                                        className=" text-center w-19 rounded text-white bg-[#413f3f] m-1 px-2"
                                    // type="text"


                                    // readOnly
                                    >{stats?.totalBuyTrades || 0} </span>

                                </div>
                                <div className='w-full flex justify-between items-center '>
                                    <span className='font-bold text-white text-sm'>Total Sell</span>
                                    <span
                                        className=" text-center w-19 rounded text-white bg-[#413f3f] m-1 px-2"
                                    // type="text"


                                    // readOnly
                                    >{stats?.totalSellTrades || 0} </span>

                                </div>
                                <div className='w-full flex justify-between items-center '>
                                    <span className='font-bold text-white text-sm'>Total Investment</span>
                                    <span
                                        className=" text-center w-19 rounded text-xs  text-white bg-[#413f3f] m-1 py-1"
                                    >{stats?.totalInvested || 0} USDT </span>

                                </div></>)}

                            </div>
                    <div className='w-full flex justify-center items-center '>
                        <button onClick={() => logoutUser()} type="button" className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Logout</button>
                    </div>
                </div>

            </div>



            {/* Zoomed Image Modal */}
            {isZoomed && (
                <div
                    className='fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50'
                    onClick={() => {
                        setIsZoomed(false);
                        setShowUploadModal(false);
                    }}
                >
                    <div
                        className='relative'
                        onClick={(e) => e.stopPropagation()} // Prevents modal close when clicking on the image or inner content
                    >
                        <div className='flex flex-col items-center justify-center relative'>
                            <img
                                className='w-50 rounded-xl border-4 border-green-500 shadow-lg'
                                src={user?.profilePicture}
                                alt="Zoomed"
                            />
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className='  left-0 absolute top-0  -translate-x-1/2 px-2 py-2 bg-green-600 text-white rounded-lg mt-4 hover:bg-green-700 transition-all'
                            >
                                <FaEdit />
                            </button>
                        </div>

                        {/* Upload Modal Inside Zoom */}
                        {showUploadModal && (
                            <div className='absolute bottom-20 bg-black/90 p-4 rounded-xl border border-gray-500 flex flex-col items-center justify-center gap-3 w-[65vw] max-w-[300px] mx-auto'>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className='text-white w-full max-w-[250px] file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700'
                                />
                                <button
                                    disabled={!selectedFile}
                                    onClick={handleImageUpload}
                                    className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full max-w-[250px] text-center'
                                >
                                    Upload
                                </button>
                            </div>

                        )}
                    </div>
                </div>
            )}

            <Navbar />
        </>
    )
}

export default Profile
