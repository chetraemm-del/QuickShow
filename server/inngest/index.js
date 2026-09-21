import { Inngest } from "inngest";
import User from "../models/User.model.js";

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
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreated, syncUserDeleted, syncUserUpdated];