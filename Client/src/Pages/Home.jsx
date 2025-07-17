import React from 'react'
import Navbar from '../Components/Navbar'
import Dashboard from '../Components/Dashboard'
const Home = () => {
    return (
        <div className='h-screen w-full bg-[#151515] overflow-hidden '>
            <Dashboard />
            <Navbar />

        </div>
    )
}

export default Home
