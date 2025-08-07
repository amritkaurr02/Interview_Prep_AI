import React, {createContext,useState,useEffect} from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({children})=>{//share user info with components inside it
    const[user, setUser]=useState(null);//store login user
    const[loading, setLoading]=useState(true);//show loading state

    useEffect(()=>{
        if(user) return;//if we already have user no need to chk again
        const accessToken = localStorage.getItem("token");
        if(!accessToken){//if there is no token user has not logged in
            setLoading(false);
            return;
        }
        const fetchUser=async()=>{//if token exist it tries to fetch info from the backend
            try{
                const response=await axiosInstance.get(API_PATHS.AUTH.PROFILE);
                setUser(response.data);
            }catch(error){
                console.error("User not authenticated",error);
                clearUser();//if token is invalid
            }finally{
                setLoading(false);
            }
        };
        fetchUser();

    },[]);
    // when user login and signup there info and token stores their info in backend
    const updateUser = (userData)=>{
        setUser(userData);
        localStorage.setItem("token",userData.token);
        setLoading(false);
    };
    //clear everything when logged out
    const clearUser=()=>{
        setUser(null);
        localStorage.removeItem("token");
    };
    return(
        <UserContext.Provider value = {{ user, loading, updateUser, clearUser}}>
        {children}
        </UserContext.Provider>
    );
};
export default UserProvider;

//when login->updateuser call,token store in localstorage, user info shared with whole app
//when page relod or refresh-> useEffect call ,check token and find user profile  
//logout-> use clear is called, user and token info removed 
