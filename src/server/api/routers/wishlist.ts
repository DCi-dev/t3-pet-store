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
      // If user is not authenticated, return items from local storage
      return getItemsFromSessionStorage();
    }
    // If user is authenticated, return items from the server
    const items = await ctx.prisma.wishlistItem.findMany({
      where: {
        userId: userId,
      },
    });
    return items;
  }),

  synchronizeWishlist: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    if (!userId) {
      throw new Error("User is not authenticated.");
    }
    // Fetch items from local storage
    const localItems = getItemsFromSessionStorage();
    // Add each item to the server
    for (const item of localItems) {
      await ctx.prisma.wishlistItem.create({
        data: {
          productId: item._id,
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
    }
    // Clear local storage
    sessionStorage.removeItem("productList");
    return;
  }),
});

function addItemToSessionStorage(productId: string) {
  const productListStorage = sessionStorage.getItem("productList");
  if (productListStorage === null) {
    const productList = [];
    productList.push({ _id: productId });
    sessionStorage.setItem("productList", JSON.stringify(productList));
  } else {
    const storageArray = JSON.parse(productListStorage);
    if (
      !storageArray.find((productStorage: { _id: string }) => {
        return productStorage._id === productId;
      })
    ) {
      storageArray.push({ _id: productId });
      sessionStorage.setItem("productList", JSON.stringify(storageArray));
    }
  }
}

function removeItemFromSessionStorage(productId: string) {
  const productListStorage = sessionStorage.getItem("productList");
  if (productListStorage === null) {
    return;
  } else {
    const storageArray = JSON.parse(productListStorage);
    const filteredArray = storageArray.filter(
      (product: { _id: string }) => product._id !== productId
    );
    sessionStorage.setItem("productList", JSON.stringify(filteredArray));
  }
}

function getItemsFromSessionStorage() {
  const productListStorage = sessionStorage.getItem("productList");
  if (productListStorage === null) {
    return [];
  } else {
    return JSON.parse(productListStorage);
  }
}
