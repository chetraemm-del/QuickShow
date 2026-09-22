import { clerkClient } from "@clerk/express";
import { getAuth } from "@clerk/express";
import User from "../models/User.model.js";

export const ensureUser = async (userId) => {
  if (!userId) {
    throw new Error("Cannot synchronize a user without a Clerk user ID");
  }

  const clerkUser = await clerkClient.users.getUser(userId);
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error(`Clerk user ${userId} has no email address`);
  }

  return User.findOneAndUpdate(
    { _id: userId },
    {
      _id: userId,
      name:
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        email,
      email,
      image: clerkUser.imageUrl ?? "",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const syncAuthenticatedUser = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (userId) {
      await ensureUser(userId);
    }

    next();
  } catch (error) {
    console.error("Unable to synchronize Clerk user:", error);
    res.status(503).json({
      success: false,
      message: "Unable to synchronize user data",
    });
  }
};
