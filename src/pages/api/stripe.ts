import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../env/server.mjs";

import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SK, {
  apiVersion: "2022-11-15",
}) as Stripe;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Allow", "POST");
  if (req.method === "POST") {
    try {
      const params = {
        submit_type: "pay",
        mode: "payment",
        payment_method_types: ["card"],
        billing_address_collection: "auto",
        shipping_address_collection: {
          allowed_countries: [
            "US",
            "CA",
            "GB",
            "AU",
            "NZ",
            "IE",
            "FR",
            "DE",
            "RO",
            "IT",
            "ES",
            "NL",
            "BE",
            "AT",
            "DK",
          ],
        },
        shipping_options: [
          { shipping_rate: "shr_1MT9wBKCrXdpqyy8aZlwsD0y" },
          { shipping_rate: "shr_1MTPdHKCrXdpqyy8qsNcTqIM" },
        ],
        line_items: req.body.map(
          (item: {
            image: string;
            productName: string;
            sizeOption: { price: number };
            quantity: number;
          }) => {
            const img = item.image;
            const newImage = img
              .replace(
                "image-",
                `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/`
              )
              .replace("-jpg", ".jpg");
            return {
              price_data: {
                currency: "usd",
                product_data: {
                  name: item.productName,
                  images: [newImage],
                },
                unit_amount: item.sizeOption.price * 100,
              },
              adjustable_quantity: {
                enabled: true,
                minimum: 1,
                maximum: 8,
              },
              quantity: item.quantity,
            };
          }
        ),
        success_url: `${req.headers.origin}/user/checkout/success`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      };
      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create(params);
      res.status(200).json(session);
    } catch (err) {
      res.status((err as any).statusCode || 500).json((err as any).message);
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
