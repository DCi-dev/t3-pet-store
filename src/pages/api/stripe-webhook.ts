import type { NextApiRequest, NextApiResponse } from "next";
import {
  createStripeCheckoutSession,
  getProductMetadata,
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
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      await createStripeCheckoutSession(req.body);
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${(err as any).message}`);
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
      res.json({ received: true });
    } catch (err) {
      res.status(400).send(`Webhook Error: ${(err as any).message}`);
      return;
    }
  }
}
