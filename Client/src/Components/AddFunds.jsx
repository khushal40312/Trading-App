import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'


const AddFunds = ({ onClose,onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const promise = axios.put(
      `${import.meta.env.VITE_BASE_URL}/users/balance`,
      {
        email,
        password,
        balance: parseInt(amount),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.promise(promise, {
      loading: 'Adding funds...',
      success: 'Funds added successfully!',
      error: (err) =>
        err?.response?.data?.message || 'Failed to add funds. Please try again.',
    });
 try {
      await promise;
      onSuccess?.(); // trigger parent action
      onClose();     // close modal
    } catch (err) {
      // error is handled in toast
    }
  
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
      <div className="bg-black p-6 rounded-xl shadow-lg w-full max-w-md text-white">
        <h2 className="text-xl font-bold text-[#21b121] mb-4">Add Funds</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-[#21b121] mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-[#111] border border-green-600 focus:outline-none focus:ring-2 focus:ring-[#21b121]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[#21b121] mb-1">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-[#111] border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm text-[#21b121] mb-1">Amount</label>
            <input
              type="number"
              className="w-full px-3 py-2 rounded bg-[#111] border border-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount to add"
              required
              min={1}
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-black font-bold"
            >
              Add Funds
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFunds;
