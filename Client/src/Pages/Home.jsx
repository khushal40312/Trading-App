import React from 'react'
import Navbar from '../Components/Navbar'
import Dashboard from '../Components/Dashboard'

import { useSelector } from 'react-redux'
const Home = () => {
    const theme = useSelector(store=>store.selectedTheme)

    
    return (
        <div className={`h-[120vh] w-full ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900'} `}>
            <Dashboard />
            <Navbar />

        </div>
    )
}

export default Home
