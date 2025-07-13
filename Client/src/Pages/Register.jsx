import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CgMail } from "react-icons/cg";
import { FaLock } from "react-icons/fa";
const register = () => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')





  return (
    <div className='p-7 h-screen flex flex-col justify-between '>
      <div>
        <img className='w-10 mb-5 rounded-xl  ' src="/logo.png" alt="" />
        <form >
          <div className='flex items-center gap-2 mb-4'>  <h1 className='text-2xl text-black font-bold'> Let's Make Your</h1>  <h1 className='text-2xl text-[#21b121] font-bold  '> account!</h1></div>

          <h3 className='text-lg font-medium mb-2 text-[#21b121]'>What's your name?</h3>
          <div className='flex justify-between w-full items-center gap-3 mb-5'>
            <input
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className='bg-[#eeeeee] rounded px-4 py-2  w-1/2 text-lg placeholder:text-base '
              placeholder='First name'
              type="text"
              required />
            <input
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className='bg-[#eeeeee] rounded px-4 py-2  w-1/2 text-lg placeholder:text-base '
              placeholder='Last name'
              type="text"
              required />
          </div>
          <div className='relative'> <h3 className='absolute left-1 top-2 '><CgMail size={27} /></h3>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='bg-[#eeeeee] rounded pl-9 py-2  w-full text-lg placeholder:text-base mb-5'
              placeholder='email@example.com'
              type="email"
              required /></div>
          {/* <h3 className='text-base font-medium mb-2 text-[#21b121]'>Enter Password</h3> */}
          <div className='relative'> <h3 className='absolute left-1 top-2 '><FaLock size={22} /></h3>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              className='bg-[#eeeeee] rounded pl-9 py-2  w-full text-lg placeholder:text-base mb-5 ' type="password" placeholder='password' />
          </div>
          <button className='font-semibold w-full bg-[#21b121] text-white py-3 rounded '>Create Account</button>
          <p className='my-2 text-center'>Already have an account? <Link to='/login' className='text-blue-600'>Login in here</Link></p>
        </form></div>
    </div>

  )
}

export default register
