import { cartRouter } from "./routers/cart";
import { stripeRouter } from "./routers/stripe";
import { userRouter } from "./routers/user";
import { wishlistRouter } from "./routers/wishlist";
import { createTRPCRouter } from "./trpc";

/**
 * This is the primary router for the server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  cart: cartRouter,
  wishlist: wishlistRouter,
  user: userRouter,
  stripe: stripeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
