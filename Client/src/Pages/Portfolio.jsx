import React, { useEffect, useState } from 'react'
import AnalysisSection from '../Components/AnalysisSection'
import Navbar from '../Components/Navbar'
import AssetSection from '../Components/AssetSection'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import Cookies from 'js-cookie';
import { handleSessionError } from '../Functions/HandleSessionError'
const Portfolio = () => {

  const token = localStorage.getItem('token')
  const [inrPrice, setinrPrice] = useState(0);
  const [currency, setCurrency] = useState(Cookies.get('currency'));
  const [balance, setBalance] = useState(0);
  const theme = useSelector(store=>store.selectedTheme)


  const navigate = useNavigate()



  useEffect(() => {


    if (!token) return;

    const fetchUserBalance = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/balance`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setBalance(response.data.balance)
      } catch (error) {


        console.error(error)
                       handleSessionError(error, navigate);
       
      }
    }

    fetchUserBalance()


    const getCurrencyRates = async (name) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/portfolios/get-currency/${name}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setinrPrice(response.data.price)
      } catch (error) {
        console.error(error)
                        handleSessionError(error, navigate);
        
      }
    }
    

    getCurrencyRates('INR')

  

   

}, [navigate, token])


return (
  <>
    <div className={`h-[108vh] overflow-y-auto w-full  ${theme === 'light' ? 'bg-gradient-to-r from-green-400 via-green-400 to-green-800 ' : 'bg-gradient-to-r from-zinc-900 via-gray-800 to-stone-900'} `}>

      <AnalysisSection setBalance={setBalance} balance={balance} inrPrice={inrPrice} currency={currency} setCurrency={setCurrency} />
      <AssetSection inrPrice={inrPrice} currency={currency} balance={balance} />
    </div>
    <Navbar />
  </>
)
}

export default Portfolio
