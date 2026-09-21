import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.model.js";
import Movie from "../models/Movie.model.js";

export const getUserBookings = async (req, res) => {
    try {
        const user= req.auth().userId;
        const bookings = await Booking.find({user})
            .populate({ path: "show", populate: { path: "movie" } })
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: bookings });
    } catch (error) {
       return res.status(500).json({ success: false, message: "Error fetching user bookings" });
    }
}

export const updateFavorite = async (req, res) => {
    try {
        const {movieId} = req.body;
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        if (!user.privateMetadata.favorites) {
            user.privateMetadata.favorites = [];
        }
        if (!user.privateMetadata.favorites.includes(movieId)) {
            user.privateMetadata.favorites.push(movieId);
        }else{
            user.privateMetadata.favorites = user.privateMetadata.favorites.filter(id => id !== movieId);
        }
        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: { favorites: user.privateMetadata.favorites },
        });
        res.status(200).json({ success: true, message: "Favorite updated successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating favorite" });
    }
}
export const getFavorites = async (req, res) => {
    try {
        const userId = req.auth().userId;
        const user = await clerkClient.users.getUser(userId);
        const favorites = user.privateMetadata.favorites || [];
        const movies = await Movie.find({ _id: { $in: favorites } });
        res.status(200).json({ success: true, movies });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error fetching favorites" });
    }
}
