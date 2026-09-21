import { Inngest } from "inngest";
import User from "../models/User.model.js";
import Booking from "../models/Booking.model.js";
import Show from "../models/Show.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "my-ticket-booking" });

// Inngest function to save user data to MongoDB
const syncUserCreated = inngest.createFunction(
    { id: "sync-user-from-clerk", triggers: { event: "clerk/user.created" } },
    async({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            _id: id,
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image_url: image_url
        }
        await User.create(userData);
    }
);

//Inngest function to delete user data from MongoDB 
const syncUserDeleted = inngest.createFunction(
    { id: "delete-user-with-clerk", triggers: { event: "clerk/user.deleted" } },
    async({event}) => {
        const {id} = event.data;
        await User.findByIdAndDelete(id);
    }
);
// Inngest function to update user data in MongoDB
const syncUserUpdated = inngest.createFunction(
    { id: "update-user-from-clerk", triggers: { event: "clerk/user.updated" } },
    async({event}) => {
        const {id, first_name, last_name, email_addresses, image_url} = event.data;
        const userData = {
            name: `${first_name} ${last_name}`,
            email: email_addresses[0].email_address,
            image_url: image_url
        };
        await User.findByIdAndUpdate(id, userData);
    }
);

const releaseSeatsAndDeleteBooking = inngest.createFunction(
    { id: "release-seats-delete-booking", triggers: { event: "app/checkpayment" } },
    async ({event, step}) =>{
        const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000)
         await step.sleepUntil('wait-for-10-minutes', tenMinutesLater)
         await step.run('check-payment-status', async () => {
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            if(!booking.isPaid){
                const show = await Show.findById(booking.show)
                booking.bookedSeats.forEach((seat) => {
                    delete show.occupiedSeats[seat]
                })
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
         })
        }
       
 )
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreated, syncUserDeleted, syncUserUpdated,releaseSeatsAndDeleteBooking];