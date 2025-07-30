import React from 'react'
import Navbar from '../Components/Navbar'
import Dashboard from '../Components/Dashboard'
const Home = () => {
    return (
        <div className='h-[115vh] w-full bg-linear-to-r/srgb from-indigo-500 to-teal-400 overflow-y-auto '>
            <Dashboard />
            <Navbar />

        </div>
    )
}

export default Home
