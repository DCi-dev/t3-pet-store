import { env } from "@/env/client.mjs";
import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";

// retrieves a Stripe customer id for a given user if it exists or creates a new one
export const getOrCreateStripeCustomerIdForUser = async ({
  stripe,
  prisma,
  userId,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new Error("User not found");

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // create a new customer
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    // use metadata to link this Stripe customer to internal user id
    metadata: {
      userId,
    },
  });

  // update with new customer id
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      stripeCustomerId: customer.id,
    },
  });

  if (updatedUser.stripeCustomerId) {
    return updatedUser.stripeCustomerId;
  }
};

// creates a Stripe checkout session
export const createStripeCheckoutSession = async ({
  stripe,
  prisma,
  userId,
  items,
}: {
  stripe: Stripe;
  prisma: PrismaClient;
  userId: string;
  items: {
    productId: string;
    productName: string;
    image: string;
    sizeOption: {
      _key: string;
      price: number;
      size: string;
    };
    slug: string;
    flavor: string;
    quantity: number;
  }[];
}) => {
  // create a Stripe customer if one doesn't exist
  const customerId = await getOrCreateStripeCustomerIdForUser({
    stripe,
    prisma,
    userId,
  });

  // create a Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
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
    line_items: items.map(
      (item: {
        image: string;
        productName: string;
        sizeOption: { price: number; size: string };
        flavor: string;
        slug: string;
        quantity: number;
      }) => {
        const img = item.image;
        const newImage = img
          .replace(
            "image-",
            `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/`,
          )
          .replace("-jpg", ".jpg");
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.productName,
              images: [newImage],
              metadata: {
                size: item.sizeOption.size,
                flavor: item.flavor,
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
      },
    ),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
  });

  return stripeSession;
};

// creates a Stripe checkout session for a guest
export const createGuestCheckoutSession = async ({
  stripe,
  items,
}: {
  stripe: Stripe;
  items: {
    productId: string;
    productName: string;
    image: string;
    sizeOption: {
      _key: string;
      price: number;
      size: string;
    };
    slug: string;
    flavor: string;
    quantity: number;
  }[];
}) => {
  const stripeSession = await stripe.checkout.sessions.create({
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
    line_items: items.map(
      (item: {
        image: string;
        productName: string;
        sizeOption: { price: number; size: string };
        flavor: string;
        slug: string;
        quantity: number;
      }) => {
        const img = item.image;
        const newImage = img
          .replace(
            "image-",
            `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/`,
          )
          .replace("-jpg", ".jpg");
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.productName,
              images: [newImage],
              metadata: {
                size: item.sizeOption.size,
                flavor: item.flavor,
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
      },
    ),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/user/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
  });

  return stripeSession;
};

// Retrieves a Stripe session using the session id
export const getStripeSession = async ({
  stripe,
  sessionId,
}: {
  stripe: Stripe;
  sessionId: string;
}) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return session;
};

// Retrieves a Stripe session items using the session id
export const getStripeSessionItems = async ({
  stripe,
  sessionId,
}: {
  stripe: Stripe;
  sessionId: string;
}) => {
  const sessionItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 8,
  });
  return sessionItems;
};

// Retrieves a Stripe session product metadata using the product id
export const getProductMetadata = async ({
  stripe,
  productId,
}: {
  stripe: Stripe;
  productId: string;
}) => {
  const product = await stripe.products.retrieve(productId);
  return product.metadata;
};

// Retrieves a Stripe session payment method using the payment intent id
export const getStripePaymentMethod = async ({
  stripe,
  paymentIntentId,
}: {
  stripe: Stripe;
  paymentIntentId: string;
}) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentIntent.payment_method as string,
  );
  return paymentMethod;
};
