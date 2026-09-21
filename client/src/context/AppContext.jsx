import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL =
  import.meta.env.VITE_BASE_URL || "http://localhost:3000";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL
  const {user} = useUser()
  const {getToken, isLoaded, isSignedIn} = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const fetchAdmin = useCallback(async ()=>{
    if (!isLoaded) {
        return
    }

    if (!isSignedIn || !user) {
        setIsAdmin(false)
        setAdminLoading(false)
        return
    }

    setAdminLoading(true)
    try {
        const token = await getToken()
        if (!token) {
            throw new Error('No active Clerk session found')
        }

        const {data} = await axios.get('/api/admin/is-admin', {headers : {Authorization : `Bearer ${token}`}})
        setIsAdmin(data.isAdmin)
        if(!data.isAdmin && location.pathname.startsWith('/admin')){
            navigate('/')
            toast.error('You are not authorized to access admin dashboard')
        }
    } catch (error) {
        setIsAdmin(false)
        toast.error(error.response?.data?.error || error.response?.data?.message || error.message || 'Unable to verify admin access')
    } finally {
        setAdminLoading(false)
    }
  }, [getToken, isLoaded, isSignedIn, location.pathname, navigate, user])
  const fetchShows = useCallback(async () => {
      try {
          const {data} = await axios.get('/api/show/all')
          if(data.success){
              setShows(data.shows)
          }else{
              toast.error(data.message)
          }
      } catch (error) {
          console.error(error)
      }
  }, [])

  const fetchFavoriteMovies = useCallback(async () =>{
      if (!isLoaded || !isSignedIn) {
          setFavoriteMovies([])
          return
      }

      try {
          const token = await getToken()
          if (!token) return

          const {data} = await axios.get('/api/user/favorites',{headers:{Authorization : `Bearer ${token}` }})
          if(data.success){
              setFavoriteMovies(data.movies ?? data.data ?? [])
          }else{
              toast.error(data.message)
          }
      } catch (error) {
          
      }
  }, [getToken, isLoaded, isSignedIn])
  useEffect(()=>{
      fetchShows()
  }, [fetchShows])
  useEffect(()=>{
      if(isLoaded){
          fetchAdmin()
          if(isSignedIn){
              fetchFavoriteMovies()
          }
      }
  },[fetchAdmin, fetchFavoriteMovies, isLoaded, isSignedIn])
  const value = { axios, fetchAdmin,user, getToken, isAdmin, adminLoading, authLoaded: isLoaded, isSignedIn, shows, favoriteMovies, fetchFavoriteMovies, image_base_url };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
export const useAppContext = () => useContext(AppContext);
