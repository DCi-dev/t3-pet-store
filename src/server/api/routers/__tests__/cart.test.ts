import type { CartItem, PrismaClient, SizeOption } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { type RouterInputs } from "@utils/api";
import { mockDeep } from "jest-mock-extended";

// Mocking Prisma client
const prisma = mockDeep<PrismaClient>();

// Creating session for the user
const userSession = {
  user: {
    id: "test-user-id",
    name: "test-user-name",
    email: "test-user-email",
    image: "test-user-image",
  },
  expires: new Date().toISOString(),
};

// Creating context with the session and prisma
const ctx = createInnerTRPCContext({
  session: userSession,
  prisma: prisma,
});

// Create a context without a session for the guest user
const guestCtx = createInnerTRPCContext({
  session: null,
  prisma: prisma,
});

// create a caller for the router with the session context
const caller = appRouter.createCaller(ctx);

// create a caller for the router with the guest context
const guestCaller = appRouter.createCaller(guestCtx);

/**
 * Tests for addItem
 */

describe("Cart Router - Add items", () => {
  // create the input for the addItem mutation
  const addItemInput: RouterInputs["cart"]["addItem"] = {
    _id: "test-product-id",
    name: "test-product-name",
    image: "test-product-image",
    quantity: 1,
    slug: "test-product-slug",
    sizeOption: {
      size: "test-size",
      price: 1,
      _key: "test-key",
    },
    flavor: "test-flavor",
  };
  test("addItem should throw error for guests", async () => {
    // expect the caller to throw an error
    await expect(guestCaller.cart.addItem(addItemInput)).rejects.toThrowError();
  });

  test("addItem should add item to cart for users", async () => {
    // mock output of prisma.cartItem.create
    const mockOutput = {
      id: "test-cart-item-id",
      userId: "test-user-id",
      productId: "test-product-id",
      productName: "test-product-name",
      image: "test-product-image",
      quantity: 1,
      flavor: "test-flavor",
      slug: "test-product-slug",
      size: {
        create: {
          size: "test-size",
          price: 1,
          key: "test-key",
        },
      },
    };

    // make prisma.cartItem.create return mockOutput
    prisma.cartItem.create.mockResolvedValue(mockOutput);

    // Call the addItem procedure.
    const cartItem = await caller.cart.addItem(addItemInput);

    // Expect it to return the mockOutput.
    expect(cartItem).toEqual(mockOutput);
  });
});

/**
 * Tests for updateQuantity
 */

describe("Cart Router - Update quantity", () => {
  // create the input for the updateQuantity mutation
  const updateQuantityInput: RouterInputs["cart"]["updateQuantity"] = {
    productId: "test-product-id",
    quantity: 2,
  };

  test("updateQuantity should throw error for guests", async () => {
    // expect the guest caller to throw an error
    await expect(
      guestCaller.cart.updateQuantity(updateQuantityInput)
    ).rejects.toThrowError();
  });

  test("updateQuantity should update item quantity for users", async () => {
    // mock output of prisma.cartItem.updateMany
    const mockOutput = {
      count: 1,
    };

    // make prisma.cartItem.updateMany return mockOutput
    prisma.cartItem.updateMany.mockResolvedValue(mockOutput);

    // Call the updateQuantity procedure.
    const cart = await caller.cart.updateQuantity(updateQuantityInput);

    // Expect it to return the mockOutput.
    expect(cart).toEqual(mockOutput);
  });

  test("updateQuantity should increment quantity for existing cart items", async () => {
    // Mock prisma.cartItem.updateMany to return a successful update count
    prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

    // Call the updateQuantity procedure.
    const result = await caller.cart.updateQuantity(updateQuantityInput);

    // Expect it to return the mocked result.
    expect(result).toEqual({ count: 1 });

    // Check that updateMany was called with the correct parameters
    expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
      where: {
        productId: "test-product-id",
        userId: userSession.user.id,
      },
      data: {
        quantity: 2,
      },
    });
  });

  test("updateQuantity should set quantity for existing cart items based on user input from 1 to 9", async () => {
    for (let i = 1; i <= 9; i++) {
      // Mock prisma.cartItem.updateMany to return a successful update count
      prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

      // Call the updateQuantity procedure.
      const result = await caller.cart.updateQuantity({
        productId: "test-product-id",
        quantity: i,
      });

      // Expect it to return the mocked result.
      expect(result).toEqual({ count: 1 });

      // Check that updateMany was called with the correct parameters
      expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
        where: {
          productId: "test-product-id",
          userId: userSession.user.id,
        },
        data: {
          quantity: i,
        },
      });
    }
  });
});

/**
 * Tests for updateFlavor
 */

describe("Cart Router - Update flavor", () => {
  // The input for the updateFlavor procedure
  const updateFlavorInput = {
    productId: "test-product-id",
    flavor: "test-flavor",
  };

  test("updateFlavor should throw error for guests", async () => {
    // expect the guest caller to throw an error
    await expect(
      guestCaller.cart.updateFlavor(updateFlavorInput)
    ).rejects.toThrowError();
  });

  test("updateFlavor should update flavor for users", async () => {
    // mock output of prisma.cartItem.updateMany
    const mockOutput = {
      count: 1,
    };

    // make prisma.cartItem.updateMany return mockOutput
    prisma.cartItem.updateMany.mockResolvedValue(mockOutput);

    // Call the updateFlavor procedure.
    const cart = await caller.cart.updateFlavor(updateFlavorInput);

    // Expect it to return the mockOutput.
    expect(cart).toEqual(mockOutput);
  });

  test("updateFlavor should update flavor for existing cart items", async () => {
    // Mock prisma.cartItem.updateMany to return a successful update count
    prisma.cartItem.updateMany.mockResolvedValue({ count: 1 });

    // Call the updateFlavor procedure.
    const result = await caller.cart.updateFlavor(updateFlavorInput);

    // Expect it to return the mocked result.
    expect(result).toEqual({ count: 1 });

    // Check that updateMany was called with the correct parameters
    expect(prisma.cartItem.updateMany).toHaveBeenCalledWith({
      where: {
        productId: "test-product-id",
        userId: userSession.user.id,
      },
      data: {
        flavor: "test-flavor",
      },
    });
  });

  test("updateFlavor should update flavor for existing cart items correctly", async () => {
    // Start with a mock cart item
    const mockCartItem = {
      id: "test-cart-item-id",
      userId: "test-user-id",
      productId: "test-product-id",
      productName: "test-product-name",
      image: "test-product-image",
      quantity: 2,
      flavor: "test-initial-flavor",
      slug: "test-product-slug",
      size: {
        create: {
          size: "test-size",
          price: 1,
          key: "test-key",
        },
      },
    };

    // make prisma.cartItem.findFirst return the mockCartItem
    prisma.cartItem.findFirst.mockResolvedValue(mockCartItem);

    // Then update the flavor
    const updatedFlavorInput = {
      productId: "test-product-id",
      flavor: "test-updated-flavor",
    };
    await caller.cart.updateFlavor(updatedFlavorInput);

    // Then, when we find the cart item again, it should have the updated flavor
    mockCartItem.flavor = "test-updated-flavor";
    prisma.cartItem.findFirst.mockResolvedValue(mockCartItem);

    const updatedCartItem = await prisma.cartItem.findFirst({
      where: {
        productId: "test-product-id",
        userId: userSession.user.id,
      },
    });

    expect(updatedCartItem?.flavor).toEqual("test-updated-flavor");
  });
});

/**
 * Tests for updateSize
 */

describe("Cart Router - Update size", () => {
  // Mock Data for tests
  const updateSizeInput = {
    productId: "test-product-id",
    cartItemId: "test-cart-item-id",
    size: {
      size: "test-size-updated",
      price: 2,
      _key: "test-key-updated",
    },
  };

  test("updateSize should throw error for guests", async () => {
    // expect the guest caller to throw an error
    await expect(
      guestCaller.cart.updateSize(updateSizeInput)
    ).rejects.toThrowError();
  });

  test("updateSize should update item size for users", async () => {
    // mock output of prisma.sizeOption.updateMany
    const mockOutput = {
      count: 1,
    };

    // make prisma.sizeOption.updateMany return mockOutput
    prisma.sizeOption.updateMany.mockResolvedValue(mockOutput);

    // Call the updateSize procedure.
    const sizeOptions = await caller.cart.updateSize(updateSizeInput);

    // Expect it to return the mockOutput.
    expect(sizeOptions).toEqual(mockOutput);
  });

  test("updateSize should update size for existing cart items correctly", async () => {
    // Start with a mock size option
    const mockSizeOption = {
      id: "test-size-option-id",
      cartItemId: "test-cart-item-id",
      size: "test-initial-size",
      price: 1,
      key: "test-initial-key",
    };

    // make prisma.sizeOption.findFirst return the mockSizeOption
    prisma.sizeOption.findFirst.mockResolvedValue(mockSizeOption);

    // Then update the size
    await caller.cart.updateSize(updateSizeInput);

    // Then, when we find the sizeOption again, it should have the updated size, price and key
    mockSizeOption.size = "test-size-updated";
    mockSizeOption.price = 2;
    mockSizeOption.key = "test-key-updated";
    prisma.sizeOption.findFirst.mockResolvedValue(mockSizeOption);

    const updatedSizeOption = await prisma.sizeOption.findFirst({
      where: {
        cartItemId: "test-cart-item-id",
      },
    });

    expect(updatedSizeOption).toEqual(mockSizeOption);
  });
});

/**
 * Tests for removeItem
 */

describe("Cart Router - Remove item", () => {
  const removeItemInput = {
    productId: "test-product-id",
  };

  test("removeItem should throw error for guests", async () => {
    // expect the guest caller to throw an error
    await expect(
      guestCaller.cart.removeItem(removeItemInput)
    ).rejects.toThrowError();
  });

  test("removeItem should remove item for users", async () => {
    // mock output of prisma.cartItem.deleteMany
    const mockOutput = {
      count: 1,
    };

    // make prisma.cartItem.deleteMany return mockOutput
    prisma.cartItem.deleteMany.mockResolvedValue(mockOutput);

    // Call the removeItem procedure.
    const cart = await caller.cart.removeItem(removeItemInput);

    // Expect it to return the mockOutput.
    expect(cart).toEqual(mockOutput);
  });

  test("removeItem should actually remove the cart item", async () => {
    // Mock a cart item to be returned by prisma.cartItem.findFirst
    const mockCartItem = {
      id: "test-cart-item-id",
      userId: "test-user-id",
      productId: "test-product-id",
      productName: "test-product-name",
      image: "test-product-image",
      quantity: 2,
      flavor: "test-flavor",
      slug: "test-product-slug",
      size: {
        create: {
          size: "test-size",
          price: 1,
          key: "test-key",
        },
      },
    };
    // Make prisma.cartItem.findFirst return mockCartItem
    prisma.cartItem.findFirst.mockResolvedValue(mockCartItem);

    // Call the removeItem procedure.
    await caller.cart.removeItem(removeItemInput);

    // After calling removeItem, the cart item should be gone
    prisma.cartItem.findFirst.mockResolvedValue(null);

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        productId: "test-product-id",
        userId: userSession.user.id,
      },
    });

    expect(cartItem).toBeNull();
  });
});

/**
 * Tests for getItems
 */

describe("Cart Router - Get Items", () => {
  // Mocked cart items and size options
  const mockCartItems: CartItem[] = [
    {
      id: "test-cart-item-id-1",
      flavor: "test-flavor-1",
      productId: "test-product-id-1",
      image: "test-image-1",
      productName: "test-product-name-1",
      quantity: 1,
      slug: "test-slug-1",
      userId: "test-user-id-1",
    },
    {
      id: "test-cart-item-id-2",
      flavor: "test-flavor-2",
      productId: "test-product-id-2",
      image: "test-image-2",
      productName: "test-product-name-2",
      quantity: 2,
      slug: "test-slug-2",
      userId: "test-user-id-2",
    },
  ];
  const mockSizeOptions: SizeOption[] = [
    {
      id: "test-size-option-id-1",
      cartItemId: "test-cart-item-id-1",
      size: "test-size-1",
      price: 1,
      key: "test-key-1",
    },
    {
      id: "test-size-option-id-2",
      cartItemId: "test-cart-item-id-2",
      size: "test-size-2",
      price: 2,
      key: "test-key-2",
    },
  ];

  // Construct expected result for authenticated user
  const expectedItemsForUser = mockCartItems.map((item) => ({
    ...item,
    sizeOption: mockSizeOptions.find(
      (sizeOption) => sizeOption.cartItemId === item.id
    ),
  }));

  test("getItems should return items with sizes for authenticated users", async () => {
    // Mock the Prisma client's methods
    prisma.cartItem.findMany.mockResolvedValue(mockCartItems);
    prisma.sizeOption.findMany.mockResolvedValue(mockSizeOptions);

    // Call the getItems procedure
    const items = await caller.cart.getItems();

    // Check that the returned items are as expected
    expect(items).toEqual(expectedItemsForUser);
  });

  test("getItems should return an empty array if no items found for authenticated users", async () => {
    // Mock the Prisma client's methods to return empty arrays
    prisma.cartItem.findMany.mockResolvedValue([]);
    prisma.sizeOption.findMany.mockResolvedValue([]);

    // Call the getItems procedure
    const items = await caller.cart.getItems();

    // Check that the returned items array is empty
    expect(items).toEqual([]);
  });

  test("getItems should return an empty array for guests", async () => {
    // Call the getItems procedure
    const items = await guestCaller.cart.getItems();

    // Check that the returned items array is empty
    expect(items).toEqual([]);
  });
});
