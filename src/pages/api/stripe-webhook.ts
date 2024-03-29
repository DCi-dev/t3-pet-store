// Stripe API Endpoint

import type { NextApiRequest, NextApiResponse } from "next";

// Stripe functions that the server can call
import {
  createGuestCheckoutSession,
  createStripeCheckoutSession,
  getProductMetadata,
  getStripePaymentMethod,
  getStripeSession,
  getStripeSessionItems,
} from "../../server/stripe/stripe-webhook-handlers";

// Stripe requires the raw body to construct the event.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      await createStripeCheckoutSession(req.body);
      await createGuestCheckoutSession(req.body);
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(err);
      return;
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  if (req.method === "GET") {
    try {
      await getStripeSession(req.body);
      await getStripeSessionItems(req.body);
      await getProductMetadata(req.body);
      await getStripePaymentMethod(req.body);
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(err);
      return;
    }
  }
}
