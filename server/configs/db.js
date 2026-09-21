import dns from "dns";
import mongoose from "mongoose";
dns.setServers(["8.8.8.8"]);
const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB');
        });
        await mongoose.connect(`${process.env.MONGODB_URI}/quickshow`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
export default connectDB;