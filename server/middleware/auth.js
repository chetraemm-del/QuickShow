import {clerkClient, getAuth} from "@clerk/express";

export const protectAdmin = async (req , res, next) =>{
    try {
        const {userId} = getAuth(req);
        if(!userId){
            return res.status(401).json({error: "Not authenticated"});
        }

        const user = await clerkClient.users.getUser(userId);
        const role = user.publicMetadata.role || user.privateMetadata.role;
        if(role !== "admin"){
            return res.status(403).json({error: "Access denied. Admins only."});
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
