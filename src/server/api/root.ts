import { createTRPCRouter } from "./trpc";
import { exampleRouter } from "./routers/example";
import { wishlistRouter } from "./routers/wishlist";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  wishlist: wishlistRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
