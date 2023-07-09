import type { PrismaClient, User } from "@prisma/client";
import { mockDeep } from "jest-mock-extended";
import type Stripe from "stripe";
import { getOrCreateStripeCustomerIdForUser } from "../stripe-webhook-handlers";

// Mock Stripe and Prisma clients
const prisma = mockDeep<PrismaClient>();
const stripe = mockDeep<Stripe>();

// Mock user and customer data
const mockUser: User = {
  id: "test-user-id",
  name: "test-user-name",
  email: "test-user-email",
  image: "test-user-image",
  emailVerified: new Date(),
  role: "USER",
  stripeCustomerId: "test-stripe-customer-id",
};

const mockCustomer: Stripe.Response<Stripe.Customer> = {
  id: "cus_test",
  object: "customer",
  address: null,
  balance: 0,
  created: 1483565364,
  currency: "usd",
  default_source: "card_1NPfgj2eZvKYlo2CyDrD1yJ4",
  delinquent: false,
  description: "test-description",
  discount: null,
  email: null,
  invoice_prefix: "28278FC",
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
    rendering_options: null,
  },
  livemode: false,
  metadata: {},
  name: null,
  next_invoice_sequence: 27,
  phone: null,
  preferred_locales: [],
  shipping: null,
  tax_exempt: "none",
  test_clock: null,
  lastResponse: {
    statusCode: 200,
    headers: {},
    requestId: "req_test",
    apiVersion: "2020-08-27",
    idempotencyKey: "idempotency-key",
    stripeAccount: "acct_test",
  },
};

/**
 * Tests for getOrCreateStripeCustomerIdForUser
 */

describe("Stripe Hooks - getOrCreateStripeCustomerIdForUser", () => {
  test("retrieves existing Stripe customer id for a user", async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await getOrCreateStripeCustomerIdForUser({
      stripe: stripe,
      prisma: prisma,
      userId: "test-user-id",
    });

    expect(result).toBe(mockUser.stripeCustomerId);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
    expect(stripe.customers.create).not.toHaveBeenCalled();
  });

  test("creates a new Stripe customer for a user and updates the user", async () => {
    mockUser.stripeCustomerId = null;
    prisma.user.findUnique.mockResolvedValue(mockUser);
    stripe.customers.create.mockResolvedValue(mockCustomer);
    prisma.user.update.mockResolvedValue({
      ...mockUser,
      stripeCustomerId: mockCustomer.id,
    });

    const result = await getOrCreateStripeCustomerIdForUser({
      stripe: stripe,
      prisma: prisma,
      userId: mockUser.id,
    });

    expect(result).toBe(mockCustomer.id);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: mockUser.email,
      name: mockUser.name,
      metadata: { userId: mockUser.id },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: mockUser.id },
      data: { stripeCustomerId: mockCustomer.id },
    });
  });

  test("throws an error when the user cannot be found", async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      getOrCreateStripeCustomerIdForUser({
        stripe: stripe,
        prisma: prisma,
        userId: "nonexistent",
      })
    ).rejects.toThrow("User not found");

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent" },
    });
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
