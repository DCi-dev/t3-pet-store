import { string, z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const wishlistRouter = createTRPCRouter({
  addItem: publicProcedure
    .input(
      z.object({
        _id: string(),
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
        _id: string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) {
        // If user is not authenticated, remove item from local storage
        removeItemFromSessionStorage(input._id);
        return;
      }
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
    .input(
      z.object({
        _id: string(),
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
});

//  Add function

// function addItemToSessionStorage(productId: string) {
//   const productListStorage = sessionStorage.getItem("productList");
//   if (productListStorage === null) {
//     const productList = [];
//     productList.push({ _id: productId });
//     sessionStorage.setItem("productList", JSON.stringify(productList));
//   } else {
//     const storageArray = JSON.parse(productListStorage);
//     if (
//       !storageArray.find((productStorage: { _id: string }) => {
//         return productStorage._id === productId;
//       })
//     ) {
//       storageArray.push({ _id: productId });
//       sessionStorage.setItem("productList", JSON.stringify(storageArray));
//     }
//   }
// }

//  Remove function

// function removeItemFromSessionStorage(productId: string) {
//   const productListStorage = sessionStorage.getItem("productList");
//   if (productListStorage === null) {
//     return;
//   } else {
//     const storageArray = JSON.parse(productListStorage);
//     const filteredArray = storageArray.filter(
//       (product: { _id: string }) => product._id !== productId
//     );
//     sessionStorage.setItem("productList", JSON.stringify(filteredArray));
//   }
// }

// Get items from the wishlist

// function getItemsFromSessionStorage() {
//   const productListStorage = sessionStorage.getItem("productList");
//   if (productListStorage === null) {
//     return [];
//   } else {
//     return JSON.parse(productListStorage);
//   }
// }
