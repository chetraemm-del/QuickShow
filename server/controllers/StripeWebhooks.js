import Stripe from "stripe";
import Booking from "../models/Booking.model.js";
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (req, res) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;

        if (session.payment_status !== "paid" || !session.metadata?.bookingId) {
          break;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
          session.metadata.bookingId,
          { isPaid: true, paymentLink: "" },
          { new: true }
        );

        if (!updatedBooking) {
          console.error("Booking not found for Stripe session:", session.id);
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        let bookingId = paymentIntent.metadata?.bookingId;

        if (!bookingId) {
          const sessionList = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            limit: 1,
          });
          bookingId = sessionList.data[0]?.metadata?.bookingId;
        }

        if (!bookingId) {
          console.error("Missing booking ID for Stripe payment intent:", paymentIntent.id);
          break;
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { isPaid: true, paymentLink: "" },
          { new: true }
        );

        if (!updatedBooking) {
          console.error("Booking not found for Stripe payment intent:", paymentIntent.id);
        }

        await inngest.send({
          name : "app/show.booked",
          data: {bookingId}
        })
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhooks processing error:", error);
    return res.status(500).send("Internal Server Error!");
  }
};