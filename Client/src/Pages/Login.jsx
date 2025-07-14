import React, { useState } from 'react'
import { CgMail } from 'react-icons/cg'
import { FaLock } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { UserAction } from '../store/userProfileSlice'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();
 
  const dispatch = useDispatch()
  const submitHandler = async (e) => {

    e.preventDefault();
    const newUser = ({

      email,
      password


    })
    toast.promise(
      axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, newUser),
      {
        pending: 'Logging in...',
        success: {
          render({ data }) {
            const res = data.data;
            localStorage.setItem('token', res.token)
            dispatch(UserAction.addUserInfo(res))
            
            navigate('/home');
            return 'Login successful!';
          },
        },
        error: {
          render({ data }) {
            return data?.response?.data?.message || 'Login failed';
          },
        },
      }
    );
    setEmail('')
    setPassword('')





  }
  return (
    <div className='p-7 h-screen flex flex-col justify-between '>
      <div>
        <img className='w-10 mb-5 rounded-xl  ' src="/logo.png" alt="" />
        <form onSubmit={submitHandler} >
          <div className='flex items-center gap-2 mb-4'>  <h1 className='text-2xl text-black font-bold'> Welcome</h1>  <h1 className='text-2xl text-[#21b121] font-bold  '> Back!</h1></div>
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
          <button className='font-semibold w-full bg-[#21b121] text-white py-3 rounded '>Let's Go</button>
          <p className='my-2 text-center'>New User? <Link to='/home' className='text-blue-600'>Sign up here</Link></p>
        </form>

      </div>
    </div>
  )
}

export default Login
