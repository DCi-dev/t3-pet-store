import z from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const wishlistRouter = createTRPCRouter({
  addItem: protectedProcedure
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

  removeItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
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
      if (!userId) {
        return;
      }
      // If user is authenticated, return items from the server
      const items = await ctx.prisma.wishlistItem.findMany({
        where: {
          userId: userId,
        },
      });
      const itemsIds = items.map((item) => item.productId);
      if (itemsIds.includes(input)) {
        return;
      } else {
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

//  Add function

// function addItemTolocalStorage(productId: string) {
//   const productListStorage = localStorage.getItem("productList");
//   if (productListStorage === null) {
//     const productList = [];
//     productList.push({ _id: productId });
//     localStorage.setItem("productList", JSON.stringify(productList));
//   } else {
//     const storageArray = JSON.parse(productListStorage);
//     if (
//       !storageArray.find((productStorage: { _id: string }) => {
//         return productStorage._id === productId;
//       })
//     ) {
//       storageArray.push({ _id: productId });
//       localStorage.setItem("productList", JSON.stringify(storageArray));
//     }
//   }
// }

//  Remove function

// function removeItemFromLocalStorage(productId: string) {
//   const productListStorage = localStorage.getItem("productList");
//   if (productListStorage === null) {
//     return;
//   } else {
//     const storageArray = JSON.parse(productListStorage);
//     const filteredArray = storageArray.filter(
//       (product: { _id: string }) => product._id !== productId
//     );
//     localStorage.setItem("productList", JSON.stringify(filteredArray));
//   }
// }

// Get items from the wishlist

// function getItemsFromLocalStorage() {
//   const productListStorage = localStorage.getItem("productList");
//   if (productListStorage === null) {
//     return [];
//   } else {
//     return JSON.parse(productListStorage);
//   }
// }
