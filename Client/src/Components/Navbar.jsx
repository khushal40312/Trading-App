import React from 'react'
import {Link, Links} from 'react-router-dom'
import { GoHome } from "react-icons/go";
import { TbMobiledata } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoPersonOutline } from "react-icons/io5";

const Navbar = () => {
  return (
<div className="w-screen fixed bottom-0  border-black/20 backdrop-blur-md bg-black/40 rounded-t-lg flex justify-center items-center">
  <div className="flex justify-between items-center  py-2 w-80">
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <GoHome size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/trade"
    >
     <TbMobiledata size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/search"
    >
      <CiSearch size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/profile"
    >
      <IoPersonOutline size={20} />
    </Link>
  </div>
</div>

  )
}

export default Navbar
