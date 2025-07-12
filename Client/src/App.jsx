import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Start from './Pages/Start'
import Loading from './Components/Loading'
import Login from './Pages/Login'

function App() {
  return (
    <>
      <Suspense fallback={<div className='w-full h-screen flex items-center justify-center '><Loading /></div>}></Suspense>
      <div >
        <Routes>


          <Route path='/' element={<Start />} />
          <Route path='/login' element={<Login />} />

        </Routes>


      </div>
    </>
  )
}

export default App
