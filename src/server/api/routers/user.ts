// Use zod to validate input types
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";
/**
 * If the procedure should be accessible to logged in users only, use
 * `protectedProcedure` instead of `publicProcedure`
 */

export const userRouter = createTRPCRouter({
  // Get user by id query
  getById: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: input,
      },
    });
  }),

  // Add address mutation
  addAdress: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        phone: z.string(),
        city: z.string(),
        country: z.string(),
        postalCode: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the user id from the session
      const userId = ctx.session.user.id;

      // Add address to the user's database based on the input and user id
      const address = await ctx.prisma.address.create({
        data: {
          address: input.address,
          city: input.city,
          country: input.country,
          postalCode: input.postalCode,
          user: { connect: { id: userId } },
        },
      });
      return address;
    }),

  // Get addresses query
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    // Get the user id from the session
    const userId = ctx.session.user.id;

    // Get addresses based on the user id
    const addresses = await ctx.prisma.address.findMany({
      where: {
        userId: userId,
      },
    });
    return addresses;
  }),

  // Get orders query based on user id
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    // Get the user id from the session
    const userId = ctx.session.user.id;

    // Get orders based on the user id
    const orders = await ctx.prisma.order.findMany({
      where: {
        userId: userId,
      },
    });
    return orders;
  }),
});
