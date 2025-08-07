import axiosInstance from "../../utils/axiosInstance";//used to send data and recieve from the backend API
import { API_PATHS } from "../../utils/apiPaths";//keep API links here

import React, { useContext, useState } from "react";//useState:manage inputs in the form, useContext: to update login user info
import { useNavigate } from "react-router-dom";//redirect user to another page
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";//checks the input format which is stored

import {UserContext} from "../../context/userContext";//give acces to global user info

const Login = ({ setCurrentPage }) => {//switch b/w login and signup page
  const[email,setEmail]=useState("");//state variable use to store email
  const[password,setPassword]=useState("");
  const[error,setError]=useState(null);

  const{updateUser}=useContext(UserContext)//save user info globally after login

  const navigate=useNavigate();
  //handle login form submit
  const handleLogin=async(e)=>{
    e.preventDefault();//prevent page relod
    
    if(!validateEmail(email)){
      setError("Please enter a valid email address");
      return;
    }
    if(!password){
      setError("Please enter the password");
      return;
    }
    setError("");

      //Login API Call
      try{
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
          email,
          password,
        });
        console.log("Login successful", response.data);

        const{token}=response.data;
        if(token){
          localStorage.setItem("token", token);
          updateUser(response.data)
          navigate("/dashboard");
        }
      } catch(error){
        console.error("Login failed", error);
        if(error.response && error.response.data.message){
          setError(error.response.data.message);
        }else{
          setError("Something went wrong. Please Try Again.")
        }
      }
    
  };
  return <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
    <h3 className="text-lg font-semibold text-black">Welcome Back</h3>
    <p className="text-xs text-slate-700 mt-[5px] mb-6">
      Please enter your details to log in
    </p>
    <form onSubmit={handleLogin}>
    <Input
    value={email}
    onChange={({ target })=>setEmail(target.value)}
    label="Email Address"
    placeholder="john@example.com"
    type="text"/>
    <Input 
    value={password}
    onChange={({ target })=>setPassword(target.value)}
    label="Password"
    placeholder="Min 8 Characters"
    type="password"/>

    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
    <button type="submit" className="btn-primary">
      LOGIN
    </button>
    <p className="text-[13px] text-slate-800 mt-3">
      Don't have an account?{" "}
      <button
      className="font-medium text-primary underline cursor-pointer"
      onClick={()=>
        setCurrentPage("signup")
      }
      >
        SignUp
      </button>
    </p>
    </form>
  </div>
};

export default Login;