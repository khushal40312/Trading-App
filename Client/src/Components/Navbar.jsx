import React from 'react'
import {Link, Links} from 'react-router-dom'
import { GoHome } from "react-icons/go";
import { TbMobiledata } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
const Navbar = () => {
  return (
<div className="w-full fixed bottom-0  border-black/20 backdrop-blur-xs bg-black/40 rounded-t-lg flex justify-center items-center">
  <div className="flex justify-between items-center  py-2 w-80  ">
  <div className="flex justify-between items-center  w-31 ">

    <Link
      className=" w-13 h-13 justify-center items-center  flex flex-col bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <span className='text-center'><GoHome size={27} /></span>
      <span className='text-[10px] text-gray-300'>Home</span>
    </Link>
    <Link
      className="w-13 h-13 justify-center items-center  flex flex-col bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/search"
    >
      <CiSearch size={27} />
      <span className='text-[10px] text-gray-300'>Search</span>
    </Link>
    </div>
    <Link
      className=" w-13 h-13 justify-center items-center   flex flex-col bg-[#21b121] text-white  rounded-[50%] hover:bg-green-700 transition mb-3"
      to="/trade"
    >
     <TbMobiledata size={24} />
     <span className='text-[10px] text-gray-300 '>Trade</span>
     
    </Link>
  <div className="flex justify-between items-center  w-31  ">

    <Link
      className=" w-13 h-13 justify-center items-center  flex flex-col bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/portfolio"
    >
      <IoWalletOutline size={27} />
     <span className='text-[10px] text-gray-300'>Assets</span> 
    </Link>
    <Link
      className="w-13 h-13 justify-center items-center  flex flex-col bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/profile"
    >
      <IoPersonOutline size={27} />
     <span className='text-[10px] text-gray-300'>Profile</span> 

    </Link>
  </div>
  </div>

</div>

  )
}

export default Navbar
