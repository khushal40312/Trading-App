import React from 'react'
import Navbar from '../Components/Navbar'
import Dashboard from '../Components/Dashboard'
import Cookies from 'js-cookie'
const Home = () => {
      const theme = Cookies.get('theme') || 'light'
    
    return (
        <div className={`h-[115vh] w-full ${theme === 'light' ? 'bg-linear-to-r/srgb from-indigo-500 to-teal-400' : 'bg-black'} `}>
            <Dashboard />
            <Navbar />

        </div>
    )
}

export default Home
