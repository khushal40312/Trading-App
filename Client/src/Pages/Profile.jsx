import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Components/Navbar'
import { FaEdit } from "react-icons/fa";
import Cookies from 'js-cookie';
const Profile = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const [user, setuser] = useState({});
    const [isZoomed, setIsZoomed] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
                    
    const [selectedTheme, setSelectedTheme] = useState(Cookies.get('theme'));
    const [selectedCurrency, setSelectedCurrency] = useState(Cookies.get('currency'));

    
    // Cookies.set('username', 'JohnDoe', { expires: 7 });


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
                }
            }
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
            Cookies.set('theme', response?.data?.updatedUser.settings.theme);
            Cookies.set('currency', response?.data?.updatedUser.settings.currency);
            setSelectedTheme(response?.data?.updatedUser.settings.theme)
            setSelectedCurrency(response?.data?.updatedUser.settings.currency)

        } catch (error) {
            console.error("Upload error:", error);
        }
    }
    return (
        <>
            <div className='h-screen overflow-y-auto w-full bg-[#151515] p-5 '>
                <h1 className='text-white font-bold text-xl m-2 '>Profile</h1>
                <div className='flex p-3 gap-5 rounded-xl flex-col w-full h-[80vh] bg-black/80'>
                    <div className='w-full flex justify-between items-center px-2 mt-2'>
                        <h1 className='text-white text-2xl font-bold'>{user?.fullname?.firstname} {user?.fullname?.lastname}</h1>
                        <img
                            className='w-25 h-17 rounded-full border-3 border-green-400 cursor-pointer'
                            src={user?.profilePicture}
                            alt="Profile"
                            onClick={handleImageClick}
                        />
                    </div>

                    <h1 className='text-gray-200 text-md font-bold'>Settings </h1>
                    <div className='w-full flex justify-between items-center '>
                        <span className='font-bold text-white text-sm'>Theme</span>
                        <select value={selectedTheme} onChange={(e) => handleSettingChanges({ value: e.target.value, type: "theme" })} className='bg-black text-white font-bold rounded-xl text-sm'>
                       

                            <option value="dark">DARK</option>
                            <option value="light">LIGHT</option>
                        </select>
                    </div>
                    <div className='w-full flex justify-between items-center '>
                        <span className='font-bold text-white text-sm'>Currency</span>
                        <select value={selectedCurrency} onChange={(e) => handleSettingChanges({ value: e.target.value, type: "currency" })} className='bg-black text-white font-bold rounded-xl text-sm'>
                            <option value="USDT">USDT</option>
                            <option value="INR">INR</option>
                        </select>
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
                                                                             