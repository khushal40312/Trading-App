import React from 'react'
import { IoArrowForward } from "react-icons/io5";
import { Link } from 'react-router-dom';
const Start = () => {
    return (
        <div className=''>
            <div className='bg-[url(/background.avif)] bg-cover bg-no-repeat bg-top  h-screen pt-8  w-full  flex justify-between flex-col'>
                <img className='w-12 ml-8 rounded-xl 
-0 ' src="/logo.png" alt="" />
                <div className='bg-white py-3 px-3 pb-3 rounded ' >
                <div className='flex items-center gap-2'>  <h1 className='text-2xl text-black font-bold'> Let's get you</h1>  <h1 className='text-2xl text-[#21b121] font-bold  '> onboard</h1></div>
                    <Link to='/register' className='flex items-center justify-center w-full bg-[#21b121] text-white py-3 rounded-lg mt-5 '>Continue <IoArrowForward size={30} /></Link>
                </div>
            </div>
        </div>

    )
}

export default Start
