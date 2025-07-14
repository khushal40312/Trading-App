import React from 'react'
import {Link, Links} from 'react-router-dom'
import { GoHome } from "react-icons/go";
const Navbar = () => {
  return (
<div className="w-full fixed bottom-0 py-2 border-t-2 border-l-2 border-r-2 border-b-2 border-black/90 backdrop-blur-md bg-black/60 rounded-t-lg ">
  <div className="flex justify-between items-center px-5">
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <GoHome size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <GoHome size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <GoHome size={20} />
    </Link>
    <Link
      className="px-4 py-3 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
      to="/home"
    >
      <GoHome size={20} />
    </Link>
  </div>
</div>

  )
}

export default Navbar
