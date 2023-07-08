import type { Prisma, PrismaClient, WishlistItem } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { type RouterInputs } from "@utils/api";
import { mockDeep } from "jest-mock-extended";

describe("wishlistRouter", () => {
  test("addItem should throw error for guests", async () => {
    // create the inner context for the router when there is no session
    const ctx = createInnerTRPCContext({
      session: null,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the addItem mutation
    const input: RouterInputs["wishlist"]["addItem"] = "1";

    // expect the caller to throw an error
    await expect(caller.wishlist.addItem(input)).rejects.toThrowError();
  });

  test("addItem should add item to wishlist for users", async () => {
    // mock prisma client
    const prisma = mockDeep<PrismaClient>();

    // mock output of prisma.wishlistItem.create
    const mockOutput: WishlistItem = {
      id: "test-wishlist-item-id",
      productId: "test-product-id",
      userId: "test-user-id",
    };

    // make prisma.wishlistItem.create return mockOutput
    prisma.wishlistItem.create.mockResolvedValue(mockOutput);

    // create the inner context for the router when there is a session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
          name: "test-user-name",
          email: "test-user-email",
          image: "test-user-image",
        },
        expires: new Date().toISOString(),
      },
      prisma: prisma,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the addItem mutation
    const input: RouterInputs["wishlist"]["addItem"] = "test-wishlist-item-id";

    // Call the addItem procedure.
    const wishlistItem = await caller.wishlist.addItem(input);

    // Expect it to return the mockOutput.
    expect(wishlistItem).toEqual(mockOutput);

    // Check that prisma.wishlistItem.create was called with correct arguments
    expect(prisma.wishlistItem.create).toHaveBeenCalledWith({
      data: {
        productId: input,
        user: {
          connect: {
            id: "test-user-id",
          },
        },
      },
    });
  });

  test("removeItem should throw error for guests", async () => {
    // create the inner context for the router when there is no session
    const ctx = createInnerTRPCContext({
      session: null,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the removeItem mutation
    const input: RouterInputs["wishlist"]["removeItem"] = "1";

    // expect the caller to throw an error
    await expect(caller.wishlist.removeItem(input)).rejects.toThrowError();
  });

  test("removeItem should remove item from wishlist for users", async () => {
    // mock prisma client
    const prisma = mockDeep<PrismaClient>();

    // mock output of prisma.wishlistItem.deleteMany
    const mockOutput: Prisma.BatchPayload = {
      count: 1,
    };

    // make prisma.wishlistItem.deleteMany return mockOutput
    prisma.wishlistItem.deleteMany.mockResolvedValue(mockOutput);

    // create the inner context for the router when there is a session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
          name: "test-user-name",
          email: "test-user-email",
          image: "test-user-image",
        },
        expires: new Date().toISOString(),
      },
      prisma: prisma,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the removeItem mutation
    const input: RouterInputs["wishlist"]["removeItem"] =
      "test-wishlist-item-id";

    // Call the removeItem procedure.
    const result = await caller.wishlist.removeItem(input);

    // Expect it to return the mockOutput.
    expect(result).toEqual(mockOutput);

    // Check that prisma.wishlistItem.deleteMany was called with correct arguments
    expect(prisma.wishlistItem.deleteMany).toHaveBeenCalledWith({
      where: {
        productId: input,
        userId: "test-user-id",
      },
    });
  });

  test("getItems should return empty array for guests", async () => {
    // create the inner context for the router when there is no session
    const ctx = createInnerTRPCContext({
      session: null,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // Call the getItems procedure.
    const items = await caller.wishlist.getItems();

    // Expect it to return an empty array.
    expect(items).toEqual([]);
  });

  test("getItems should return items from wishlist for users", async () => {
    // mock prisma client
    const prisma = mockDeep<PrismaClient>();

    // mock output of prisma.wishlistItem.findMany
    const mockOutput: WishlistItem[] = [
      {
        id: "test-wishlist-item-id",
        productId: "test-product-id",
        userId: "test-user-id",
      },
    ];

    // make prisma.wishlistItem.findMany return mockOutput
    prisma.wishlistItem.findMany.mockResolvedValue(mockOutput);

    // create the inner context for the router when there is a session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
          name: "test-user-name",
          email: "test-user-email",
          image: "test-user-image",
        },
        expires: new Date().toISOString(),
      },
      prisma: prisma,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // Call the getItems procedure.
    const items = await caller.wishlist.getItems();

    // Expect it to return the mockOutput.
    expect(items).toEqual(mockOutput);

    // Check that prisma.wishlistItem.findMany was called with correct arguments
    expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith({
      where: {
        userId: "test-user-id",
      },
    });
  });

  test("synchronizeWishlist should throw error for guests", async () => {
    // create the inner context for the router when there is no session
    const ctx = createInnerTRPCContext({
      session: null,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the synchronizeWishlist mutation
    const input: RouterInputs["wishlist"]["synchronizeWishlist"] = "1";

    // expect the caller to throw an error
    await expect(
      caller.wishlist.synchronizeWishlist(input)
    ).rejects.toThrowError();
  });

  test("synchronizeWishlist should return undefined when item already exists", async () => {
    // mock prisma client
    const prisma = mockDeep<PrismaClient>();

    // mock output of prisma.wishlistItem.findMany
    const mockFindManyOutput: WishlistItem[] = [
      {
        id: "test-wishlist-item-id",
        productId: "test-product-id",
        userId: "test-user-id",
      },
    ];

    // make prisma.wishlistItem.findMany return mockFindManyOutput
    prisma.wishlistItem.findMany.mockResolvedValue(mockFindManyOutput);

    // create the inner context for the router when there is a session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
          name: "test-user-name",
          email: "test-user-email",
          image: "test-user-image",
        },
        expires: new Date().toISOString(),
      },
      prisma: prisma,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the synchronizeWishlist mutation
    const input: RouterInputs["wishlist"]["synchronizeWishlist"] =
      "test-product-id";

    // Call the synchronizeWishlist procedure.
    const result = await caller.wishlist.synchronizeWishlist(input);

    // Expect it to return undefined.
    expect(result).toBeUndefined();
  });

  test("synchronizeWishlist should add item to wishlist when it doesn't exist", async () => {
    // mock prisma client
    const prisma = mockDeep<PrismaClient>();

    // mock output of prisma.wishlistItem.findMany
    const mockFindManyOutput: WishlistItem[] = [
      {
        id: "test-wishlist-item-id",
        productId: "test-product-id",
        userId: "test-user-id",
      },
    ];

    // make prisma.wishlistItem.findMany return mockFindManyOutput
    prisma.wishlistItem.findMany.mockResolvedValue(mockFindManyOutput);

    // mock output of prisma.wishlistItem.create
    const mockCreateOutput: WishlistItem = {
      id: "new-wishlist-item-id",
      productId: "new-product-id",
      userId: "test-user-id",
    };

    // make prisma.wishlistItem.create return mockCreateOutput
    prisma.wishlistItem.create.mockResolvedValue(mockCreateOutput);

    // create the inner context for the router when there is a session
    const ctx = createInnerTRPCContext({
      session: {
        user: {
          id: "test-user-id",
          name: "test-user-name",
          email: "test-user-email",
          image: "test-user-image",
        },
        expires: new Date().toISOString(),
      },
      prisma: prisma,
    });

    // create a caller for the router with the context
    const caller = appRouter.createCaller(ctx);

    // create the input for the synchronizeWishlist mutation
    const input: RouterInputs["wishlist"]["synchronizeWishlist"] =
      "new-product-id";

    // Call the synchronizeWishlist procedure.
    const result = await caller.wishlist.synchronizeWishlist(input);

    // Expect it to return the mockCreateOutput.
    expect(result).toEqual(mockCreateOutput);
  });
});
