/**
 * @jest-environment node
 */
import type { Address, Order, PrismaClient, User } from "@prisma/client";
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

// create a caller for the router with the context
const caller = appRouter.createCaller(ctx);

describe("userRouter", () => {
  // Test for getById
  test("getById should return user data", async () => {
    // mock output of prisma.user.findFirst
    const mockOutput: User = {
      id: "test-user-id",
      name: "test-user-name",
      email: "test-user-email",
      image: "test-user-image",
      emailVerified: new Date(),
      role: "USER",
      stripeCustomerId: "test-stripe-customer-id",
    };

    // make prisma.user.findFirst return mockOutput
    prisma.user.findFirst.mockResolvedValue(mockOutput);

    // Call the getById procedure.
    const result = await caller.user.getById("test-user-id");

    // Expect it to return the mockOutput.
    expect(result).toEqual(mockOutput);
  });

  // Test for addAddress
  test("addAddress should add an address and return it", async () => {
    // Create address input
    const addressInput: RouterInputs["user"]["addAdress"] = {
      address: "test-address",
      phone: "test-phone",
      city: "test-city",
      country: "test-country",
      postalCode: "test-postal-code",
    };

    // mock output of prisma.address.create
    const mockOutput: Address = {
      id: "test-address-id",
      ...addressInput,
      userId: "test-user-id",
    };

    // make prisma.address.create return mockOutput
    prisma.address.create.mockResolvedValue(mockOutput);

    // Call the addAddress procedure.
    const result = await caller.user.addAdress(addressInput);

    // Expect it to return the mockOutput.
    expect(result).toEqual(mockOutput);
  });

  // Test for getAddresses
  test("getAddresses should return user addresses", async () => {
    // mock output of prisma.address.findMany
    const mockOutput: Address[] = [
      {
        id: "test-address-id",
        address: "test-address",
        city: "test-city",
        country: "test-country",
        postalCode: "test-postal-code",
        userId: "test-user-id",
      },
    ];

    // make prisma.address.findMany return mockOutput
    prisma.address.findMany.mockResolvedValue(mockOutput);

    // Call the getAddresses procedure.
    const result = await caller.user.getAddresses();

    // Expect it to return the mockOutput.
    expect(result).toEqual(mockOutput);
  });

  // Test for getOrders
  test("getOrders should return user orders", async () => {
    // mock output of prisma.order.findMany
    const mockOutput: Order[] = [
      {
        id: "test-order-id",
        userId: "test-user-id",
        createdAt: new Date(),
        stripeSessionId: "test-stripe-session-id",
        updatedAt: new Date(),
      },
    ];

    // make prisma.order.findMany return mockOutput
    prisma.order.findMany.mockResolvedValue(mockOutput);

    // Call the getOrders procedure.
    const result = await caller.user.getOrders();

    // Expect it to return the mockOutput.
    expect(result).toEqual(mockOutput);
  });
});
