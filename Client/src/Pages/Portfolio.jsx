import React from 'react'
import AnalysisSection from '../Components/AnalysisSection'
import Navbar from '../Components/Navbar'
import AssetSection from '../Components/AssetSection'

const Portfolio = () => {
    
    return (
        <>
        <div className='h-[108vh] overflow-y-auto w-full bg-[#151515] '>

            <AnalysisSection />
            <AssetSection/>
         </div>
         <Navbar/>
         </>
    )
}

export default Portfolio
