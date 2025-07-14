import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundAuth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#21b121] px-4">
      <div className="bg-white text-center rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-[#21b121]">404</h1>
        <p className="mt-4 text-xl font-semibold text-gray-800">Page Not Found</p>
        <p className="mt-2 text-gray-600">You must log in or register first to continue.</p>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-[#21b121] text-white font-medium rounded-md hover:bg-green-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 border-2 border-[#21b121] text-[#21b121] font-medium rounded-md hover:bg-[#21b121] hover:text-white transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundAuth;