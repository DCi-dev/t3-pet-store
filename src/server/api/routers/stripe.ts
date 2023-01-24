import z from "zod";
import { env } from "../../../env/server.mjs";
import { getOrCreateStripeCustomerIdForUser } from "../../stripe/stripe-webhook-handlers";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const stripeRouter = createTRPCRouter({
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
      const { stripe, session, prisma } = ctx;

      const customerId = await getOrCreateStripeCustomerIdForUser({
        prisma,
        stripe,
        userId: session?.user?.id || "",
      });

      if (!customerId) {
        throw new Error("Could not create customer");
      }

      const baseUrl = "http://localhost:3000";

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

      const baseUrl = "http://localhost:3000";

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

  getCheckoutSession: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const session = await stripe.checkout.sessions.retrieve(input);

      if (!session) {
        throw new Error("Could not retrieve checkout session");
      }

      return session;
    }),

  getCheckoutSessionItems: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const session = await stripe.checkout.sessions.retrieve(input);

      if (!session) {
        throw new Error("Could not retrieve checkout session");
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(input);

      if (!lineItems) {
        throw new Error("Could not retrieve line items");
      }

      return lineItems;
    }),
  getProductMetadata: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const product = await stripe.products.retrieve(input);

      if (!product) {
        throw new Error("Could not retrieve product");
      }

      return product;
    }),
  getStripePaymentMethod: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { stripe } = ctx;

      const paymentIntent = await stripe.paymentIntents.retrieve(input);
      if (!paymentIntent) {
        throw new Error("Could not retrieve payment method");
      }
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );

      if (!paymentMethod) {
        throw new Error("Could not retrieve payment method");
      }

      return paymentMethod;
    }),
});
