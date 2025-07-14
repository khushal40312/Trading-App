import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Start from './Pages/Start'
import Loading from './Components/Loading'
import Login from './Pages/Login'
import Register from './Pages/Register'
import { ToastContainer } from 'react-toastify';
import { useSelector } from 'react-redux'
import Home from './Pages/Home'
import NotFound from './Pages/NotFound'
import NotFoundAuth from './Pages/NotFoundAuth'

function App() {
  const token = localStorage.getItem("token");
  const user = useSelector(store => store.user)

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center"><Loading /></div>}>
        <Routes>
          {token || user.length !== 0 ? (
            <>
              <Route path="/home" element={<Home />} />
              {/* Authenticated fallback */}
              <Route path="*" element={<NotFound />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Start />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Unauthenticated fallback */}
              <Route path="*" element={<NotFoundAuth />} />
            </>
          )}
        </Routes>
      </Suspense>
    </>
  );
}

export default App
