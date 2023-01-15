import z from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const wishlistRouter = createTRPCRouter({
  addItem: publicProcedure
    .input(
      z.object({
        _id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const wishlist = await ctx.prisma.wishlistItem.create({
        data: {
          productId: input._id,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return wishlist;
    }),

  removeItem: publicProcedure
    .input(
      z.object({
        _id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      // If user is authenticated, remove item from the server
      const wishlist = await ctx.prisma.wishlistItem.deleteMany({
        where: {
          productId: input._id,
          userId: userId,
        },
      });
      return wishlist;
    }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
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

  synchronizeWishlist: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
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
});
