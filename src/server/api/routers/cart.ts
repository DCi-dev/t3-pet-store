// Use zod to validate input types
import z from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
/**
 * If the procedure should be accessible to logged in users only, use
 * `protectedProcedure` instead of `publicProcedure`
 */

export const cartRouter = createTRPCRouter({
  // Add item to cart mutation
  addItem: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
        name: z.string(),
        image: z.string().or(z.undefined()),
        quantity: z.number(),
        slug: z.string(),
        sizeOption: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
        flavor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Add item to the user's cart based on the input and user id
      const cart = await ctx.prisma.cartItem.create({
        data: {
          productId: input._id,
          productName: input.name,
          image: input.image,
          quantity: input.quantity,
          flavor: input.flavor,
          slug: input.slug,
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

  // Update quantity mutation
  updateQuantity: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Update quantity for the selected product based on the input and user id
      const cart = await ctx.prisma.cartItem.updateMany({
        where: {
          productId: input.productId,
          userId: userId,
        },
        data: {
          quantity: input.quantity,
        },
      });
      return cart;
    }),

  // Update flavor mutation
  updateFlavor: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        flavor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Update flavor for the selected product based on the input and user id
      const cart = await ctx.prisma.cartItem.updateMany({
        where: {
          productId: input.productId,
          userId: userId,
        },
        data: {
          flavor: input.flavor,
        },
      });
      return cart;
    }),

  // Update size mutation
  updateSize: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        cartItemId: z.string(),
        size: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      /**
       * Update size for the selected product based on the input
       *
       * cartItemId is used to find the sizeOption that needs to be updated
       *
       * Size has multiple fields, such as size, price, key,
       * and it has a relation to the cartItem, which has a relation to the user
       * that's why we are using cartItemId to find the sizeOption
       * and not product and user Ids
       */
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

  // Remove item from cart mutation
  removeItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Remove item from the user's cart based on the input and user id
      const cart = await ctx.prisma.cartItem.deleteMany({
        where: {
          productId: input.productId,
          userId: userId,
        },
      });
      return cart;
    }),

  // Get items from cart query
  getItems: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;

    // For guests, return empty array
    if (!userId) {
      return [];
    }

    // If user is authenticated, return items from the server
    const items = await ctx.prisma.cartItem.findMany({
      where: {
        userId: userId,
      },
    });
    // Check if items list is not empty
    if (items.length > 0) {
      // If not empty, get sizes for each item
      const sizes = await ctx.prisma.sizeOption.findMany({
        where: {
          CartItem: {
            is: {
              userId: userId,
            },
          },
        },
      });

      // Combine items and sizes into one array
      const itemsWithSizes = items.map((item) => {
        const sizeOption = sizes.find((size) => size.cartItemId === item.id);
        return {
          ...item,
          sizeOption,
        };
      });

      return itemsWithSizes;
    } else {
      // If items list is empty, return empty array
      return [];
    }
  }),

  // Synchronize cart mutation
  synchronizeCart: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
        name: z.string(),
        image: z.string(),
        quantity: z.number(),
        slug: z.string(),
        sizeOption: z.object({
          size: z.string(),
          price: z.number(),
          _key: z.string(),
        }),
        flavor: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session?.user?.id;

      // Check what items are already in the cart
      const existingItem = await ctx.prisma.cartItem.findMany({
        where: {
          productId: input._id,
          userId: userId,
        },
      });
      // Get the ids of the existing items
      const itemsIds = existingItem.map((item) => item.productId);

      // Check if the local cart item is already in the database cart
      if (itemsIds.includes(input._id)) {
        // If it is, update the quantity
        const sizeOptions = await ctx.prisma.sizeOption.updateMany({
          where: {
            id: existingItem[0]?.id,
          },
          data: {
            size: input.sizeOption.size,
            price: input.sizeOption.price,
            key: input.sizeOption._key,
          },
        });

        // Update the cart
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
        // If the local cart item is not in the database cart, add it
        const cart = await ctx.prisma.cartItem.create({
          data: {
            productId: input._id,
            productName: input.name,
            image: input.image,
            quantity: input.quantity,
            flavor: input.flavor,
            slug: input.slug,
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
      }
    }),
});
