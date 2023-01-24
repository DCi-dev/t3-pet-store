import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getById: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.user.findFirst({
      where: {
        id: input,
      },
    });
  }),

  addAdress: protectedProcedure
    .input(
      z.object({
        address: z.string(),
        phone: z.string(),
        city: z.string(),
        country: z.string(),
        postalCode: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
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
  getAddresses: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const addresses = await ctx.prisma.address.findMany({
      where: {
        userId: userId,
      },
    });
    return addresses;
  }),
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const orders = await ctx.prisma.order.findMany({
      where: {
        userId: userId,
      },
    });
    return orders;
  }),
});
