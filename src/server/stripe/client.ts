import Stripe from "stripe";
import { env } from "../../env/server.mjs";

// Create a Stripe client
export const stripe = new Stripe(env.STRIPE_SK, {
  apiVersion: "2022-11-15",
});
