import z from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const cartRouter = createTRPCRouter({
  addItem: publicProcedure
    .input(
      z.object({
        _id: z.string(),
        quantity: z.number(),
        sizeOption: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
        flavor: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, return empty array
        return [];
      }
      const cart = await ctx.prisma.cartItem.create({
        data: {
          productId: input._id,
          quantity: input.quantity,
          flavor: input.flavor,
          size: {
            create: {
              size: input.sizeOption.size,
              price: input.sizeOption.price,
              key: input.sizeOption._key,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });

      return cart;
    }),

  updateQuantity: publicProcedure
    .input(
      z.object({
        _id: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, return empty array
        return [];
      }
      // If user is authenticated, return items from the server
      const cart = await ctx.prisma.cartItem.updateMany({
        where: {
          productId: input._id,
          userId: userId,
        },
        data: {
          quantity: input.quantity,
        },
      });
      return cart;
    }),

  updateFlavor: publicProcedure
    .input(
      z.object({
        _id: z.string(),
        flavor: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, return empty array
        return [];
      }
      // If user is authenticated, return items from the server
      const cart = await ctx.prisma.cartItem.updateMany({
        where: {
          productId: input._id,
          userId: userId,
        },
        data: {
          flavor: input.flavor,
        },
      });
      return cart;
    }),

  updateSize: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        cartItemId: z.string(),
        size: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, return empty array
        return [];
      }
      const sizeOptions = await ctx.prisma.sizeOption.updateMany({
        where: {
          cartItemId: input.cartItemId,
        },
        data: {
          size: input.size.size,
          price: input.size.price,
          key: input.size._key,
        },
      });
      return sizeOptions;
    }),

  removeItem: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;

      if (!userId) {
        // If user is not authenticated, return empty array
        return 0;
      }

      const cart = await ctx.prisma.cartItem.deleteMany({
        where: {
          productId: input._id,
          userId: userId,
        },
      });
      return cart;
    }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      // If user is not authenticated, return empty array
      return [];
    }
    // If user is authenticated, return items from the server
    const items = await ctx.prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
    });
    return items;
  }),

  synchronizeCart: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
        quantity: z.number(),
        sizeOption: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
        flavor: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, return empty array
        return;
      } else {
        const existingItem = await ctx.prisma.cartItem.findMany({
          where: {
            productId: input._id,
            userId: userId,
          },
        });
        const itemsIds = existingItem.map((item) => item.productId);
        if (itemsIds.includes(input._id)) {
          const sizeOptions = await ctx.prisma.sizeOption.updateMany({
            where: {
              id: existingItem[0]?.sizeOptionId,
            },
            data: {
              size: input.sizeOption.size,
              price: input.sizeOption.price,
              key: input.sizeOption._key,
            },
          });
          const cart = await ctx.prisma.cartItem.updateMany({
            where: {
              productId: input._id,
              userId: userId,
            },
            data: {
              quantity: input.quantity,
              flavor: input.flavor,
            },
          });
          return [cart, sizeOptions];
        } else {
          const sizeOptions = await ctx.prisma.sizeOption.create({
            data: {
              size: input.sizeOption.size,
              price: input.sizeOption.price,
              key: input.sizeOption._key,
            },
          });
          const cart = await ctx.prisma.cartItem.create({
            data: {
              productId: input._id,
              quantity: input.quantity,
              flavor: input.flavor,
              size: {
                connect: {
                  id: sizeOptions.id,
                },
              },
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          });
          return [cart, sizeOptions];
        }
      }
    }),
});
