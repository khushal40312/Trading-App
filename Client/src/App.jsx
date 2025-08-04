import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Start from './Pages/Start'
import Loading from './Components/Loading'
import Login from './Pages/Login'
import Register from './Pages/Register'
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux'
import Home from './Pages/Home'
import NotFound from './Pages/NotFound'
import NotFoundAuth from './Pages/NotFoundAuth'
import Search from './Pages/Search'
import Trade from './Pages/Trade'
import CandleChart from './Pages/CandleChart'
import SessionExpired from './Pages/SessionExpired'
import Portfolio from './Pages/Portfolio'
import Profile from './Pages/Profile'
import axios from 'axios'
import Cookies from 'js-cookie';
import { selectedThemeAction } from './store/themeSlice'
import useNetworkStatus from './Hooks/useNetworkStatus'
import { RiSignalWifiOffLine } from "react-icons/ri";
import PrivateRoute from './Components/PrivateRoute';
import PublicRoute from './Components/PublicRoute';
function App() {
  const [isOnline, setIsOnline] = useState(true);
  const token = localStorage.getItem("token");

 
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const isOnlineHook = useNetworkStatus();
  async function checkApiStatus() {
    try {
      const response = await fetch(import.meta.env.VITE_BASE_URL, { method: 'GET', cache: 'no-cache' });
      setIsOnline(response.ok);

    } catch (error) {
      setIsOnline(false);
    }
  }
  useEffect(() => {
    // Ping API once on mount and then every 15 seconds
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {


    if (!token) return;
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        dispatch(selectedThemeAction.changeTheme(response?.data?.user.settings.theme))
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
  }, [token])
  if (!isOnlineHook) {
    // user is offline (local network issue)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans px-4">
        <div className="bg-gray-900 p-8 rounded-xl shadow-xl text-center max-w-sm w-full border border-gray-700 flex flex-col justify-center items-center">
          <h1 className='text-center text-2xl' ><RiSignalWifiOffLine size={40} /></h1>
          <h1 className="text-2xl font-semibold mb-2">No Internet Connection</h1>
          <p className="text-gray-400 mb-6">You're currently offline. Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {!isOnline ? (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-sans px-4">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center max-w-sm w-full border border-gray-700">
            <img
              src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
              alt="Server Error Icon"
              className="w-20 mx-auto mb-6 opacity-80"
            />
            <h1 className="text-2xl font-semibold text-white mb-2">Server Issue Detected</h1>
            <p className="text-gray-400 mb-6">
              We're currently facing server issues. Please try again later or refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md transition"
            >
              Retry
            </button>
          </div>
        </div>

      ) : (
        <Suspense fallback={<div className="w-full h-screen flex items-center justify-center"><Loading /></div>}>

          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<Start />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<PrivateRoute />}>
              <Route path="/home" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/trade/:token/candles" element={<CandleChart />} />
              <Route path="/trade/:token" element={<Trade />} />
              <Route path="/trade" element={<Trade />} />
              <Route path="/session-expired" element={<SessionExpired />} />
            </Route>
            <Route path="*" element={token ? <NotFound /> : <NotFoundAuth />} />
          </Routes>
        </Suspense>
      )}
    </>
  );

}

export default App
