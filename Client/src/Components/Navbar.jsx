import React, { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GoHome, GoHomeFill } from "react-icons/go";
import { TbMobiledata } from "react-icons/tb";
import { CiSearch } from "react-icons/ci";
import { IoPersonOutline, IoPerson } from "react-icons/io5";
import { IoWalletOutline } from "react-icons/io5";
import { RiSearchFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    } else if (path.includes('/portfolio')) {
      document.title = 'Tradex - Portfolio';
    } else if (path.includes('/tradexavier')) {
      document.title = 'Tradex - Tradexavier (AI Assistant)';
    } else {
      document.title = 'Tradex';
    }
  }, [location.pathname]);

  return (
    <>
      {/* Floating AI Assistant Button */}
      <div 
        onClick={() => navigate('/tradexavier')}
        className="fixed bottom-20 right-4 z-50 cursor-pointer flex flex-col items-center"
      >
        <img 
        title='Your Personal AI Assistant'
          src="/logo.png" 
          alt="Tradexavier AI" 
          className="w-10 h-10 rounded-full shadow-lg border-2 border-green-400 hover:scale-110 transition-transform"
        />
        <span className="text-[10px] text-green-300 mt-1 font-semibold bg-black/60 px-2 py-0.5 rounded">
          TradeXavier Ai
        </span>
      </div>

      {/* Navbar */}
      <div className="w-full fixed bottom-0 border-black/20 backdrop-blur-xs bg-black/40 rounded-t-lg flex justify-center items-center z-40">
        <div className="flex justify-between items-center py-2 w-80">
          <div className="flex justify-between items-center w-31">
            <Link
              className={` ${location.pathname.includes('home') ? "border border-1 border-green-300" : ''} w-13 h-13 justify-center items-center flex flex-col text-white font-medium rounded-md hover:bg-green-700 transition`}
              to="/home"
            >
              <span className='text-center'>{location.pathname.includes('home') ? <GoHomeFill size={27} /> : <GoHome size={27} />}</span>
              <span className='text-[10px] text-gray-300'>Home</span>
            </Link>
            <Link
              className={` ${location.pathname.includes('search') ? "border border-1 border-green-300" : ''} w-13 h-13 justify-center items-center flex flex-col text-white font-medium rounded-md hover:bg-green-700 transition`}
              to="/search"
            >
              {location.pathname.includes('search') ? <RiSearchFill size={27} /> : <CiSearch size={27} />}
              <span className='text-[10px] text-gray-300'>Search</span>
            </Link>
          </div>
          <Link
            className={` w-13 h-13 justify-center items-center ${location.pathname.includes('trade') ? "border border-1 border-green-300" : ''} flex flex-col text-white rounded-[45%] hover:bg-green-700 transition`}
            to="/trade"
          >
            <TbMobiledata size={24} />
            <span className='text-[10px] text-gray-300 '>Trade</span>
          </Link>
          <div className="flex justify-between items-center w-31">
            <Link
              className={` ${location.pathname.includes('portfolio') ? "border border-1 border-green-300" : ''} w-13 h-13 justify-center items-center flex flex-col text-white font-medium rounded-md hover:bg-green-700 transition`}
              to="/portfolio"
            >
              {location.pathname.includes('portfolio') ? <FaWallet size={27} /> : <IoWalletOutline size={27} />}
              <span className='text-[10px] text-gray-300'>Assets</span>
            </Link>
            <Link
              className={`w-13 h-13 justify-center items-center ${location.pathname.includes('profile') ? "border border-1 border-green-300" : ''} flex flex-col text-white font-medium rounded-md hover:bg-green-700 transition`}
              to="/profile"
            >
              {location.pathname.includes('profile') ? <IoPerson size={27} /> : <IoPersonOutline size={27} />}
              <span className='text-[10px] text-gray-300'>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar;
