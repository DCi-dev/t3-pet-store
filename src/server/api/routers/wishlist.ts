// Use zod to validate input types
import z from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
/**
 * If the procedure should be accessible to logged in users only, use
 * `protectedProcedure` instead of `publicProcedure`
 */

export const wishlistRouter = createTRPCRouter({
  // Add wishlist mutation
  addItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;
      // Get add to the user's wishlist based on the input
      const wishlist = await ctx.prisma.wishlistItem.create({
        data: {
          productId: input,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return wishlist;
    }),

  // Remove wishlist mutation
  removeItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // If user is authenticated, remove item from the server
      const wishlist = await ctx.prisma.wishlistItem.deleteMany({
        where: {
          productId: input,
          userId: userId,
        },
      });
      return wishlist;
    }),

  // Get wishlist query
  getItems: publicProcedure.query(async ({ ctx }) => {
    // Get the user id from the session
    const userId = ctx.session?.user?.id;

    /**
     * If the user is not authenticated, return an empty array
     * The logic for guest wishlist is handled in the client
     * using the localStorage
     */
    if (!userId) {
      // If user is not authenticated, return empty array
      return [];
    }

    // If user is authenticated, return items from the server
    const items = await ctx.prisma.wishlistItem.findMany({
      where: {
        userId: userId,
      },
    });
    return items;
  }),

  // Synchronize wishlist mutation
  synchronizeWishlist: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Get the user's wishlist from the server
      const items = await ctx.prisma.wishlistItem.findMany({
        where: {
          userId: userId,
        },
      });

      // Get the product ids from the user's wishlist
      const itemsIds = items.map((item) => item.productId);

      // If the product id is already in the user's wishlist, return
      if (itemsIds.includes(input)) {
        return;
      } else {
        // If the product id is not in the user's wishlist, add it
        const wishlist = await ctx.prisma.wishlistItem.create({
          data: {
            productId: input,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
        return wishlist;
      }
    }),
});
