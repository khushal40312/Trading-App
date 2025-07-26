import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../Components/Navbar'

const Profile = () => {
    const navigate = useNavigate()
    const token = localStorage.getItem('token')
    const [user, setuser] = useState({});

    console.log(user)
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

            fetchUserProfile()
        }

    }, [navigate, token])


    return (
        <>
            <div className='h-screen overflow-y-auto w-full bg-[#151515] p-5 '>

                <h1 className='text-white font-bold text-xl m-2 '>Profile</h1>
                <div className='flex p-3 gap-5 rounded-xl flex-col w-full h-[80vh] bg-black/80'>



                    <h1 className='text-white text-2xl font-bold border-b-3 '>{user?.fullname?.firstname} {user?.fullname?.lastname} </h1>

                    <h1 className='text-gray-200 text-md font-bold  '>Settings </h1>
                    <div className='w-full flex justify-between items-center '>
                        <span className='font-bold text-white text-sm'>Theme</span>
                        <select className='bg-black text-white font-bold  rounded-xl text-sm' >
                            <option value="DARK">DARK</option>
                            <option value="LIGHT">LIGHT</option>

                        </select>
                    </div>



                </div>
            </div>
            <Navbar />
        </>
    )
}

export default Profile
