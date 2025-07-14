import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const NotFound = () => {


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#21b121] text-white px-4">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold tracking-widest">404</h1>
        <p className="text-2xl md:text-3xl font-light mt-4">Page Not Found</p>
        <p className="mt-2 text-lg">Sorry, the page you are looking for doesn’t exist.</p>
        <Link
          to="/home"
          className="inline-block mt-6 px-6 py-3 bg-white text-[#21b121] font-semibold rounded-md shadow-md hover:bg-gray-100 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;