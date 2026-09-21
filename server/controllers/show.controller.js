import axios from "axios";
import Show from "../models/Show.model.js";
import Movie from "../models/Movie.model.js";
export const getNowPlayingMovies = async (req, res) => {
    try {
        const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing',{
            headers : {Authorization : `Bearer ${process.env.TMDB_API_KEY}`}
        })
        const movies = data.results;
        res.status(200).json ({
            success: true,
            movies
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error: 'Failed to fetch now playing movies' });
    }
}

export const addShow = async (req, res) => {
    try {
        const  {movieId, showInput, showPrice} = req.body;
        if(!movieId || !Array.isArray(showInput) || !showPrice){
            return res.status(400).json({success: false, error: 'movieId, showInput, and showPrice are required' });
        }

        let movie = await Movie.findById(movieId);
        if(!movie){
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }    
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            const movieDetails = {
                _id : movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres : movieApiData.genres,
                casts : movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime
            }
            movie = await Movie.create(movieDetails);

        }
        const showsToCreate = []
        showInput.forEach(show =>{
            const showDate = show.date;
            const showTimes = show.time || show.times || [];
            showTimes.forEach(time => {
                const dateTimeString = time.includes("T") ? time : `${showDate}T${time}`;
                const showDateTime = new Date(dateTimeString);
                if(Number.isNaN(showDateTime.getTime())){
                    throw new Error(`Invalid show date/time: ${dateTimeString}`);
                }
                showsToCreate.push({
                    movie: movieId,
                    showDateTime,
                    showPrice: Number(showPrice),
                    occupiedSeats: {}
                })
            })   
        });
        if(showsToCreate.length === 0){
            return res.status(400).json({success: false, error: 'Please add at least one show time' });
        }

        if(showsToCreate.length > 0){
            await Show.insertMany(showsToCreate);
        }
        res.status(201).json({success: true, message: 'Shows added successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error: error.message || 'Failed to add show' });
    }
}

export const getShows = async (req, res)=>{
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate('movie').sort({showDateTime: 1});
        const uniqueShows = new Set(shows.map(show => show.movie))
        res.status(200).json({success: true, shows: Array.from(uniqueShows)});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, error: error.message || 'Failed to fetch shows' });
    }
}

export const getShow = async (req, res)=>{
    try {
        const {movieId} = req.params;

        let movie = await Movie.findById(movieId);
        if (!movie) {
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                }),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ]);

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsData = movieCreditsResponse.data;

            movie = await Movie.create({
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsData.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime
            });
        }

        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } }).sort({ showDateTime: 1 });
        const dateTime = {};

        shows.forEach(show => {
            const date = show.showDateTime.toISOString().split('T')[0];
            if (!dateTime[date]) {
                dateTime[date] = [];
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id });
        });

        res.status(200).json({ success: true, movie, dateTime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.message || 'Failed to fetch show' });
    }
}
