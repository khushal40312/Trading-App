import React, { useEffect, useState } from 'react'
import {Link, useLocation} from 'react-router-dom'
import { GoHome } from "react-icons/go";
import { TbMobiledata } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
import { GoHomeFill } from "react-icons/go";
import { RiSearchFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import { IoPerson } from "react-icons/io5";
const Navbar = () => {
   // To track the active route

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();

    if (path.includes('/home')) {
      document.title = 'Tradex - Home';
    } else if (path.includes('/search')) {
      document.title = 'Tradex - Search';
    } else if (path.includes('/trade')) {
      document.title = 'Tradex - Trade';
    } else if (path.includes('/profile')) {
      document.title = 'Tradex - Profile';
    } else if(path.includes('/portfolio')) {
      document.title = 'Tradex - Portfolio';
    }else{
      document.title = 'Tradex'; 
    }
  }, [location.pathname]);

  return (
<div className="w-full fixed bottom-0  border-black/20 backdrop-blur-xs bg-black/40 rounded-t-lg flex justify-center items-center">
  <div className="flex justify-between items-center  py-2 w-80  ">
  <div className="flex justify-between items-center  w-31 ">

    <Link
      className={` ${location.pathname.includes('home')?"border border-1 border-green-300":''} w-13 h-13 justify-center items-center  flex flex-col  text-white font-medium rounded-md hover:bg-green-700 transition`}
      to="/home"
    >
      <span className='text-center'>{location.pathname.includes('home')?<GoHomeFill size={27} />: <GoHome size={27} />}</span>
      <span className='text-[10px] text-gray-300'>Home</span>
    </Link>
    <Link
      className={` ${location.pathname.includes('search')?"border border-1 border-green-300":''} w-13 h-13 justify-center items-center  flex flex-col  text-white font-medium rounded-md hover:bg-green-700 transition`}
      to="/search"
    >
   {location.pathname.includes('search')? <RiSearchFill size={27 } /> : <CiSearch size={27} />}
      <span className='text-[10px] text-gray-300'>Search</span>
    </Link>
    </div>
    <Link
      className={` w-13 h-13 justify-center items-center ${location.pathname.includes('trade')?"border border-1 border-green-300":''}   flex flex-col   text-white  rounded-[45%] hover:bg-green-700 transition`}
      to="/trade"
    >
     <TbMobiledata size={24} />
     <span className='text-[10px] text-gray-300 '>Trade</span>
     
    </Link>
  <div className="flex justify-between items-center  w-31  ">

    <Link
      className={` ${location.pathname.includes('portfolio')?"border border-1 border-green-300":''}  w-13 h-13 justify-center items-center  flex flex-col  text-white font-medium rounded-md hover:bg-green-700 transition`}
      to="/portfolio"
    >
    {location.pathname.includes('portfolio')? <FaWallet size={27} />: <IoWalletOutline size={27} />}
     <span className='text-[10px] text-gray-300'>Assets</span> 
    </Link>
    <Link
      className={`w-13 h-13 justify-center items-center ${location.pathname.includes('profile')?"border border-1 border-green-300":''}  flex flex-col  text-white font-medium rounded-md hover:bg-green-700 transition`}
      to="/profile"
    >
  {location.pathname.includes('profile')? <IoPerson size={27} /> : <IoPersonOutline size={27} />}
     <span className='text-[10px] text-gray-300'>Profile</span> 

    </Link>
  </div>
  </div>

</div>

  )
}

export default Navbar
