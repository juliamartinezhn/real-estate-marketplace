// import React from 'react'

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice.js";
import OAuth from "../components/OAuth.jsx";


export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector( (state) => state.user);
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const handleChange = (e) => {
    setFormData(
      {
        ...formData,
        [e.target.id]: e.target.value
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // setLoading(true);
      dispatch( signInStart() );
      const res = await fetch('/api/auth/sign-in',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
      const data = await res.json();
      
      if (data.success === false) {
        // setLoading(false);
        // setError(data.message);
        dispatch(signInFailure(data.message));
        return;
      }

      // setLoading(false);
      // setError(null);
      dispatch(signInSuccess(data));
      navigate('/');
      
    } catch (error) {
      // setLoading(false);
      // setError(error.message);
      dispatch(signInFailure(error.message));
    }
    

  } 
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-center my-3 font-semibold text-3xl 3xl:text-4xl">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
        <input type="email" id="email" className=" p-3 rounded-lg border" placeholder="Email" onChange={handleChange} />
        <input type="password" id="password" className=" p-3 rounded-lg border" placeholder="Password" onChange={handleChange} />
        { error && <p className="text-red-600 ">{ error }</p> }
        
        <button disabled={loading || !formData.email || !formData.password} className=" bg-slate-700 text-white uppercase p-3 rounded-lg hover:opacity-95 disabled:opacity-80">
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth /> 
        <div className="flex gap-2 mt-5">
          <p>Don´t have an account?</p>
          <Link to={"/sign-up"} >
            <span className="text-blue-700">Sign up</span>
          </Link>
        </div>
        
      </form>
    </div>
  )
}