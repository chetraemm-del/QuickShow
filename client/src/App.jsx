import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import MovieDetail from "./pages/MovieDetail";
import Seatlayout from "./pages/Seatlayout";
import MyBooking from "./pages/MyBooking";
import Favorite from "./pages/Favorite";
import { Toaster} from 'react-hot-toast'
import Footer from "./components/Footer";
import Layout from "./pages/Admin/Layout";
import Dashboard from "./pages/Admin/Dashboard";
import AddShow from "./pages/Admin/AddShow";
import ListShow from "./pages/Admin/ListShow";
import ListBooking from "./pages/Admin/ListBooking";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/react";
import Loading from "./components/Loading";


function App() {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const {authLoaded, isSignedIn} = useAppContext()
  return (
    <>
    <Toaster/>
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element = {<Home/>}></Route>
        <Route path="/movies" element = {<Movie/>}></Route>
        <Route path="/movies/:id" element = {<MovieDetail/>}></Route>
        <Route path="/movies/:id/:date" element = {<Seatlayout/>}></Route>
        <Route path="/my-bookings" element = {<MyBooking/>}></Route>
        <Route path="/loading/:nextUrl" element = {<Loading/>}></Route>
        <Route path="/favorite" element = {<Favorite/>}></Route>
        <Route path="/admin/*" element = {!authLoaded ? <Loading/> : isSignedIn ? <Layout/> : (
          <div className="min-h-screen flex justify-center items-center">
            <SignIn fallbackRedirectUrl={'/admin'}/>
          </div>
        )}>
        <Route index element = {<Dashboard/>}/>
        <Route path = "add-shows" element = {<AddShow/>}/>
        <Route path = "list-shows" element = {<ListShow/>}/>
        <Route path = "list-bookings" element = {<ListBooking/>}/>
        </Route>
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
