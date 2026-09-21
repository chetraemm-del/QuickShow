import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.model.js";
import Show from "../models/Show.model.js";

export const isAdmin = async (req, res) =>{
    res.status(200).json({success : true, isAdmin : true})
}

export const getDashboardData = async (req, res) =>{
    try {
        const bookings = await Booking.find({isPaid : true})
        const activeShows = await Show.find({showDateTime : {$gte : new Date()}}).populate("movie")
        const { totalCount: totalUsers } = await clerkClient.users.getUserList({
            limit: 1,
        })
        const dashboardData = {
            totalBookings : bookings.length,
            totalRevenue : bookings.reduce((acc, booking) => acc + booking.amount, 0),
            activeShows,
            totalUsers
        }
         res.status(200).json({success : true, dashboardData})

    } catch (error) {
        return res.status(500).json({success:false, message: "Error occurred while fetching dashboard data"});
    }
}

export const getAllShows = async (req, res) =>{
    try {
        const shows = await Show.find({showDateTime : {$gte : new Date()}}).populate("movie").sort({showDateTime : 1})  
         res.status(200).json({success : true, shows})
    } catch (error) {
        return res.status(500).json({success:false, message: "Error occurred while fetching all shows"});
    }
}

export const getAllBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find().populate("user").populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({createdAt : -1})
         res.status(200).json({success : true,  bookings})
    } catch (error) {
        return res.status(500).json({success:false, message: "Error occurred while fetching all bookings"});
    }
}
