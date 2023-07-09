// Use zod to validate input types
import z from "zod";

// Load environment variables for server-side use
import { env } from "@env/server.mjs";

// Import stripe webhook handler
import { getOrCreateStripeCustomerIdForUser } from "@server/stripe/stripe-webhook-handlers";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
/**
 * If the procedure should be accessible to logged in users only, use
 * `protectedProcedure` instead of `publicProcedure`
 */

export const stripeRouter = createTRPCRouter({
  // Create checkout session
  createCheckoutSession: protectedProcedure
    .input(
      z.array(
        z.object({
          productId: z.string(),
          productName: z.string(),
          image: z.string(),
          sizeOption: z.object({
            _key: z.string(),
            price: z.number(),
            size: z.string(),
          }),
          flavor: z.string(),
          quantity: z.number(),
          slug: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      // Load stripe, session, and prisma from the context
      const { stripe, session, prisma } = ctx;

      // Get or create a stripe customer id for the user
      const customerId = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session?.user?.id || "",
      });

      // If the customer id is not found, throw an error
      if (!customerId) {
        throw new Error("Could not create customer");
      }

      // Get the base url from the environment variables
      const baseUrl = env.BASE_URL;

      // Create a checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
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
        /**
         * Add shipping options to the checkout session based on the shipping rates
         * created in the Stripe dashboard
         */
        shipping_options: [
          { shipping_rate: "shr_1MT9wBKCrXdpqyy8aZlwsD0y" },
          { shipping_rate: "shr_1MTPdHKCrXdpqyy8qsNcTqIM" },
        ],
        // Add line items to the checkout session based on the input
        line_items: input.map(
          (item: {
            image: string;
            productName: string;
            sizeOption: { price: number; size: string };
            flavor: string;
            quantity: number;
            slug: string;
          }) => {
            // Store the image url from Sanity CDN in a variable
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
                  metadata: {
                    flavor: item.flavor,
                    size: item.sizeOption.size,
                    slug: item.slug,
                  },
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
        // Add success and cancel urls to the checkout session
        success_url: `${baseUrl}/user/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/user/cart`,
      });

      // If the checkout session is not found, throw an error
      if (!checkoutSession) {
        throw new Error("Could not create checkout session");
      }

      // add session id to the order table in the database
      await prisma.order.create({
        data: {
          userId: session.user.id,
          stripeSessionId: checkoutSession.id,
        },
      });

      // clear cart
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return {
        checkoutUrl: checkoutSession.url,
      };
    }),

  // Create a guest checkout session - mostly the same as the user checkout session
  createGuestCheckoutSession: publicProcedure
    .input(
      z.array(
        z.object({
          productId: z.string(),
          productName: z.string(),
          image: z.string(),
          sizeOption: z.object({
            _key: z.string(),
            price: z.number(),
            size: z.string(),
          }),
          flavor: z.string(),
          quantity: z.number(),
          slug: z.string(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const baseUrl = env.BASE_URL;

      const checkoutSession = await stripe.checkout.sessions.create({
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
        line_items: input.map(
          (item: {
            image: string;
            productName: string;
            sizeOption: { price: number; size: string };
            flavor: string;
            quantity: number;
            slug: string;
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
                  metadata: {
                    flavor: item.flavor,
                    size: item.sizeOption.size,
                    slug: item.slug,
                  },
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
        success_url: `${baseUrl}/user/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/user/cart`,
      });

      if (!checkoutSession) {
        throw new Error("Could not create checkout session");
      }

      return {
        checkoutUrl: checkoutSession.url,
      };
    }),

  // Get checkout session
  getCheckoutSession: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Load stripe from the context
      const { stripe } = ctx;

      // Get the checkout session based on the input - the session id
      const session = await stripe.checkout.sessions.retrieve(input);

      // If the session is not found, throw an error
      if (!session) {
        throw new Error("Could not retrieve checkout session");
      }

      // Else return the session
      return session;
    }),

  // Get checkout session items
  getCheckoutSessionItems: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Load stripe from the context
      const { stripe } = ctx;

      // Get the checkout session based on the input - the session id
      const session = await stripe.checkout.sessions.retrieve(input);

      // If the session is not found, throw an error
      if (!session) {
        throw new Error("Could not retrieve checkout session");
      }

      // Else get the session items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(input);

      // If the session items are not found, throw an error
      if (!lineItems) {
        throw new Error("Could not retrieve line items");
      }

      // Else return the session items
      return lineItems;
    }),

  // Get the product metadata
  getProductMetadata: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Load stripe from the context
      const { stripe } = ctx;

      // Get the product based on the input - the product id
      const product = await stripe.products.retrieve(input);

      // If the product is not found, throw an error
      if (!product) {
        throw new Error("Could not retrieve product");
      }

      // Else return the product
      return product;
    }),

  // Get the prayment details
  getStripePaymentMethod: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // Load stripe from the context
      const { stripe } = ctx;

      // Get the payment intent based on the input - the payment intent id
      const paymentIntent = await stripe.paymentIntents.retrieve(input);

      // If the payment intent is not found, throw an error
      if (!paymentIntent) {
        throw new Error("Could not retrieve payment method");
      }
      // Else get the payment method from the payment intent
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );

      // If the payment method is not found, throw an error
      if (!paymentMethod) {
        throw new Error("Could not retrieve payment method");
      }

      // Else return the payment method details
      return paymentMethod;
    }),
});
