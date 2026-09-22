import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/show.route.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.route.js";
import userRouter from "./routes/user.route.js";
import { stripeWebhooks } from "./controllers/StripeWebhooks.js";
import { syncAuthenticatedUser } from "./services/userSync.js";

const app = express();
const port = 3000;

await connectDB();

app.use("/api/stripe", express.raw({ type: "application/json" }), stripeWebhooks);
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());
app.use(syncAuthenticatedUser);

//API Routes
app.get("/", (req, res) => res.send("Server is Live!"));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter); // Import and use the user route

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`),
);
