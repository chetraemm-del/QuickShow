import Stripe from "stripe";
import Booking from "../models/Booking.model.js";

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
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];

        if (!session?.metadata?.bookingId) {
          return res.status(400).json({ received: true, message: "Missing bookingId in Stripe session metadata" });
        }

        await Booking.findByIdAndUpdate(
          session.metadata.bookingId,
          {
            isPaid: true,
            paymentLink: "",
          }
        );
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