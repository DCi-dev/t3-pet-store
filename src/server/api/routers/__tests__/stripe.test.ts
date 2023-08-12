/**
 * @jest-environment node
 */
import type { PrismaClient } from "@prisma/client";
import { appRouter } from "@server/api/root";
import { createInnerTRPCContext } from "@server/api/trpc";
import { getOrCreateStripeCustomerIdForUser } from "@server/stripe/stripe-webhook-handlers";
import { type RouterInputs } from "@utils/api";
import { mockDeep } from "jest-mock-extended";
import type { Stripe } from "stripe";

// Mock Stripe and Prisma clients
const prisma = mockDeep<PrismaClient>();
const stripe = mockDeep<Stripe>();

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
  stripe: stripe,
});

// Create a context without a session for the guest user
const guestCtx = createInnerTRPCContext({
  session: null,
  prisma: prisma,
  stripe: stripe,
});

// create a caller for the router with the session context
const caller = appRouter.createCaller(ctx);

// create a caller for the router with the guest context
const guestCaller = appRouter.createCaller(guestCtx);

jest.mock("@server/stripe/stripe-webhook-handlers");

// Mock the Stripe checkout session object
const checkoutSessionObj: Stripe.Response<Stripe.Checkout.Session> = {
  lastResponse: {
    statusCode: 200,
    headers: {},
    requestId: "req_test",
    apiVersion: "2020-08-27",
    idempotencyKey: "idempotency-key",
    stripeAccount: "acct_test",
  },
  id: "cs_test",
  object: "checkout.session",
  after_expiration: null,
  allow_promotion_codes: null,
  amount_subtotal: null,
  amount_total: null,
  automatic_tax: {
    enabled: false,
    status: null,
  },
  billing_address_collection: null,
  cancel_url: `${process.env.BASE_URL}/cancel`,
  client_reference_id: null,
  consent: null,
  consent_collection: null,
  created: new Date().getDate(),
  currency: null,
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    shipping_address: null,
    submit: null,
  },
  customer: null,
  customer_creation: null,
  customer_details: {
    address: null,
    email: "example@example.com",
    name: null,
    phone: null,
    tax_exempt: "none",
    tax_ids: null,
  },
  customer_email: null,
  expires_at: 1688844674,
  invoice: null,
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: {},
  mode: "payment",
  payment_intent: "pi_1GszkR2eZvKYlo2CPUKedP5p",
  payment_link: null,
  payment_method_collection: null,
  payment_method_options: {},
  payment_method_types: ["card"],
  payment_status: "unpaid" || "paid",
  phone_number_collection: {
    enabled: false,
  },
  recovered_from: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: "open",
  submit_type: null,
  subscription: null,
  success_url: `${process.env.BASE_URL}/success`,
  total_details: null,
  url: null,
};

beforeEach(() => {
  // Clear mocks before each test
  jest.clearAllMocks();
  stripe.checkout.sessions.retrieve.mockResolvedValue(checkoutSessionObj);
});

/**
 * Tests for createCheckoutSession
 */

describe("Stripe Route - createCheckoutSession", () => {
  // Mock the items for the checkout session
  const input: RouterInputs["stripe"]["createCheckoutSession"] = [
    {
      flavor: "test-flavor",
      quantity: 1,
      image: "test-image",
      productId: "test-product-id",
      productName: "test-product-name",
      sizeOption: {
        _key: "test-size-option-key",
        price: 1,
        size: "test-size",
      },
      slug: "test-slug",
    },
    {
      flavor: "test-flavor-2",
      quantity: 2,
      image: "test-image-2",
      productId: "test-product-id-2",
      productName: "test-product-name-2",
      sizeOption: {
        _key: "test-size-option-key-2",
        price: 2,
        size: "test-size-2",
      },
      slug: "test-slug-2",
    },
  ];

  test("successfuly creates a checkout session", async () => {
    // Mock the getOrCreateStripeCustomerIdForUser function to return a customer id
    (getOrCreateStripeCustomerIdForUser as jest.Mock).mockResolvedValue(
      "customer-id",
    );

    // Mock the Stripe checkout.sessions.create function to return the mock checkout session
    stripe.checkout.sessions.create.mockResolvedValue(checkoutSessionObj);

    // Call the createCheckoutSession procedure
    const result = await caller.stripe.createCheckoutSession(input);

    // Assert that the getOrCreateStripeCustomerIdForUser function was called with the correct arguments
    expect(getOrCreateStripeCustomerIdForUser).toHaveBeenCalledWith({
      prisma: prisma,
      stripe: stripe,
      userId: userSession.user.id,
    });

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
      billing_address_collection: "auto",
      cancel_url: "http://localhost:3000/user/cart",
      customer: "customer-id",
      line_items: [
        {
          adjustable_quantity: {
            enabled: true,
            maximum: 8,
            minimum: 1,
          },
          price_data: {
            currency: "usd",
            product_data: {
              images: ["test-image"],
              metadata: {
                flavor: "test-flavor",
                size: "test-size",
                slug: "test-slug",
              },
              name: "test-product-name",
            },
            unit_amount: 100,
          },
          quantity: 1,
        },
        {
          adjustable_quantity: {
            enabled: true,
            maximum: 8,
            minimum: 1,
          },
          price_data: {
            currency: "usd",
            product_data: {
              images: [
                "test-https://cdn.sanity.io/images/ynkjutes/production/2",
              ],
              metadata: {
                flavor: "test-flavor-2",
                size: "test-size-2",
                slug: "test-slug-2",
              },
              name: "test-product-name-2",
            },
            unit_amount: 200,
          },
          quantity: 2,
        },
      ],
      mode: "payment",
      payment_method_types: ["card"],
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "CA",
          "GB",
          "AU",
          "NZ",
          "IE",
          "FR",
          "DE",
          "RO",
          "IT",
          "ES",
          "NL",
          "BE",
          "AT",
          "DK",
        ],
      },
      shipping_options: [
        {
          shipping_rate: "shr_1MT9wBKCrXdpqyy8aZlwsD0y",
        },
        {
          shipping_rate: "shr_1MTPdHKCrXdpqyy8qsNcTqIM",
        },
      ],
      submit_type: "pay",
      success_url:
        "http://localhost:3000/user/checkout/success?session_id={CHECKOUT_SESSION_ID}",
    });

    // Assert that the procedure returned the correct checkout session
    expect(result).toEqual({ checkoutUrl: checkoutSessionObj.url });
  });

  test("should throw an error for a guest user", async () => {
    // Call the createCheckoutSession procedure
    const result = guestCaller.stripe.createCheckoutSession(input);

    // Assert that the procedure threw an error
    await expect(result).rejects.toThrowError("UNAUTHORIZED");
  });
});

/**
 * Tests for createGuestCheckoutSession
 */

describe("Stripe Route - createGuestCheckoutSession", () => {
  // Mock the items for the checkout session
  const input: RouterInputs["stripe"]["createGuestCheckoutSession"] = [
    {
      flavor: "test-flavor",
      quantity: 1,
      image: "test-image",
      productId: "test-product-id",
      productName: "test-product-name",
      sizeOption: {
        _key: "test-size-option-key",
        price: 1,
        size: "test-size",
      },
      slug: "test-slug",
    },
    {
      flavor: "test-flavor-2",
      quantity: 2,
      image: "test-image-2",
      productId: "test-product-id-2",
      productName: "test-product-name-2",
      sizeOption: {
        _key: "test-size-option-key-2",
        price: 2,
        size: "test-size-2",
      },
      slug: "test-slug-2",
    },
  ];

  test("successfuly creates a checkout session for a guest", async () => {
    // Mock the Stripe checkout.sessions.create function to return the mock checkout session
    stripe.checkout.sessions.create.mockResolvedValue(checkoutSessionObj);

    // Call the createGuestCheckoutSession procedure
    const result = await guestCaller.stripe.createGuestCheckoutSession(input);

    // Check the parameters sent to the stripe checkout sessions create method
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      shipping_address_collection: {
        allowed_countries: [
          "US",
          "CA",
          "GB",
          "AU",
          "NZ",
          "IE",
          "FR",
          "DE",
          "RO",
          "IT",
          "ES",
          "NL",
          "BE",
          "AT",
          "DK",
        ],
      },
      shipping_options: [
        { shipping_rate: "shr_1MT9wBKCrXdpqyy8aZlwsD0y" },
        { shipping_rate: "shr_1MTPdHKCrXdpqyy8qsNcTqIM" },
      ],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "test-product-name",
              images: ["test-image"],
              metadata: {
                flavor: "test-flavor",
                size: "test-size",
                slug: "test-slug",
              },
            },
            unit_amount: 100,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 8,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "test-product-name-2",
              images: [
                "test-https://cdn.sanity.io/images/ynkjutes/production/2",
              ],
              metadata: {
                flavor: "test-flavor-2",
                size: "test-size-2",
                slug: "test-slug-2",
              },
            },
            unit_amount: 200,
          },
          adjustable_quantity: {
            enabled: true,
            minimum: 1,
            maximum: 8,
          },
          quantity: 2,
        },
      ],
      success_url:
        "http://localhost:3000/user/checkout/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/user/cart",
    });

    // Assert that the procedure returned the correct checkout session
    expect(result).toEqual({ checkoutUrl: checkoutSessionObj.url });
  });
});

/**
 * Tests for getCheckoutSession
 */

describe("Stripe Route - getCheckoutSession", () => {
  // Mock the input for the checkout session
  const input: RouterInputs["stripe"]["getCheckoutSession"] = "test-session-id";

  test("successfully retrieves a checkout session", async () => {
    // Mock the Stripe checkout.sessions.retrieve function to return the mock checkout session
    stripe.checkout.sessions.retrieve.mockResolvedValue(checkoutSessionObj);

    // Call the getCheckoutSession procedure
    const result = await guestCaller.stripe.getCheckoutSession(input);

    // Check the parameters sent to the stripe checkout sessions retrieve method
    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(input);

    // Assert that the procedure returned the correct checkout session
    expect(result).toEqual(checkoutSessionObj);
  });

  test("throws an error when the checkout session cannot be retrieved", async () => {
    // Mock the Stripe checkout.sessions.retrieve function to return null
    stripe.checkout.sessions.retrieve.mockResolvedValue(null as any);

    // Expect the getCheckoutSession procedure to throw an error
    await expect(guestCaller.stripe.getCheckoutSession(input)).rejects.toThrow(
      "Could not retrieve checkout session",
    );

    // Check the parameters sent to the stripe checkout sessions retrieve method
    expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(input);
  });
});

/**
 * Tests for getCheckoutSessionItems
 */

describe("Stripe Route - getCheckoutSessionItems", () => {
  // Mock the input for the checkout session
  const input: RouterInputs["stripe"]["getCheckoutSessionItems"] =
    "test-session-id";

  // Mock the Stripe checkout session line items
  const lineItems: Stripe.Response<Stripe.ApiList<Stripe.LineItem>> = {
    lastResponse: {
      statusCode: 200,
      headers: {},
      requestId: "req_test",
      apiVersion: "2020-08-27",
      idempotencyKey: "idempotency-key",
      stripeAccount: "acct_test",
    },
    object: "list",
    url: "/v1/checkout/sessions/cs_test_a19e5RczDMy3i1z0NpoBgCKxqwelfqI92CUJ09BZf7LlORnvTj2fgvRg11/line_items",
    has_more: false,
    data: [
      {
        id: "li_1NRwG82eZvKYlo2C8tI83nWY",
        object: "item",
        amount_discount: 0,
        amount_subtotal: 0,
        amount_tax: 0,
        amount_total: 0,
        currency: "usd",
        description: "Dining Room Table",
        price: {
          id: "price_1NRkTS2eZvKYlo2C3xD43n0k",
          object: "price",
          active: true,
          billing_scheme: "per_unit",
          created: 1688858614,
          currency: "usd",
          custom_unit_amount: null,
          livemode: false,
          lookup_key: null,
          metadata: {},
          nickname: null,
          product: "prod_OECtIzS0erFE1P",
          recurring: null,
          tax_behavior: "unspecified",
          tiers_mode: null,
          transform_quantity: null,
          type: "one_time",
          unit_amount: 7500,
          unit_amount_decimal: "7500",
        },
        quantity: 1,
      },
      // Include more items if necessary
    ],
  };

  test("successfully retrieves checkout session items", async () => {
    // Mock the Stripe checkout.sessions.listLineItems function to return the mock line items
    stripe.checkout.sessions.listLineItems.mockResolvedValue(lineItems);

    // Call the getCheckoutSessionItems procedure
    const result = await guestCaller.stripe.getCheckoutSessionItems(input);

    // Check the parameters sent to the stripe checkout sessions listLineItems method
    expect(stripe.checkout.sessions.listLineItems).toHaveBeenCalledWith(input);

    // Assert that the procedure returned the correct line items
    expect(result).toEqual(lineItems);
  });

  test("throws an error when the checkout session items cannot be retrieved", async () => {
    // Before throwing the error for listLineItems, you need to ensure retrieve returns a session
    stripe.checkout.sessions.retrieve.mockResolvedValue(checkoutSessionObj);

    // Mock the Stripe checkout.sessions.listLineItems function to return null
    stripe.checkout.sessions.listLineItems.mockResolvedValue(null as any);

    // Expect the getCheckoutSessionItems procedure to throw an error
    await expect(
      guestCaller.stripe.getCheckoutSessionItems(input),
    ).rejects.toThrow("Could not retrieve line items");

    // Check the parameters sent to the stripe checkout sessions listLineItems method
    expect(stripe.checkout.sessions.listLineItems).toHaveBeenCalledWith(input);
  });
});

/**
 * Tests for getProductMetadata
 */

describe("Stripe Route - getProductMetadata", () => {
  // Mock the input for the product
  const input: RouterInputs["stripe"]["getProductMetadata"] = "test-product-id";

  // Mock the Stripe product object
  const productObj: Stripe.Response<Stripe.Product> = {
    lastResponse: {
      statusCode: 200,
      headers: {},
      requestId: "req_test",
      apiVersion: "2020-08-27",
      idempotencyKey: "idempotency-key",
      stripeAccount: "acct_test",
    },
    id: "test-product-id",
    object: "product",
    type: "good",
    attributes: [],
    active: true,
    created: 1688858614,
    default_price: null,
    description: "test-description",
    images: ["test-image"],
    livemode: false,
    metadata: {},
    name: "test-name",
    package_dimensions: null,
    shippable: null,
    statement_descriptor: null,
    tax_code: null,
    unit_label: null,
    updated: 1688858614,
    url: null,
  };

  test("successfully retrieves a product", async () => {
    // Mock the Stripe products.retrieve function to return the mock product
    stripe.products.retrieve.mockResolvedValue(productObj);

    // Call the getProductMetadata procedure
    const result = await guestCaller.stripe.getProductMetadata(input);

    // Check the parameters sent to the stripe products retrieve method
    expect(stripe.products.retrieve).toHaveBeenCalledWith(input);

    // Assert that the procedure returned the correct product
    expect(result).toEqual(productObj);
  });

  test("throws an error when the product cannot be retrieved", async () => {
    // Mock the Stripe products.retrieve function to return null
    stripe.products.retrieve.mockResolvedValue(null as any);

    // Expect the getProductMetadata procedure to throw an error
    await expect(guestCaller.stripe.getProductMetadata(input)).rejects.toThrow(
      "Could not retrieve product",
    );

    // Check the parameters sent to the stripe products retrieve method
    expect(stripe.products.retrieve).toHaveBeenCalledWith(input);
  });
});

/**
 * Tests for getProductMetadata
 */

describe("Stripe Route - getStripePaymentMethod", () => {
  test("successfully retrieves payment method", async () => {
    const paymentIntentObj: Stripe.Response<Stripe.PaymentIntent> = {
      id: "test-payment-intent-id",
      object: "payment_intent",
      amount: 1000,
      amount_capturable: 0,
      amount_details: {
        tip: {},
      },
      amount_received: 0,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: "automatic",
      client_secret: null,
      confirmation_method: "automatic",
      created: 1591917831,
      currency: "usd",
      customer: null,
      description: "Created by stripe.com/docs demo",
      invoice: null,
      last_payment_error: null,
      latest_charge: null,
      livemode: false,
      metadata: {},
      next_action: null,
      on_behalf_of: null,
      payment_method: null,
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: "automatic",
        },
      },
      payment_method_types: ["card"],
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: "requires_payment_method",
      transfer_data: null,
      transfer_group: null,
      lastResponse: {
        statusCode: 200,
        headers: {},
        requestId: "req_test",
        apiVersion: "2020-08-27",
        idempotencyKey: "idempotency-key",
        stripeAccount: "acct_test",
      },
      source: null,
    };

    const paymentMethodObj: Stripe.Response<Stripe.PaymentMethod> = {
      id: "test-payment-method-id",
      object: "payment_method",
      billing_details: {
        address: {
          city: null,
          country: null,
          line1: null,
          line2: null,
          postal_code: null,
          state: null,
        },
        email: null,
        name: null,
        phone: null,
      },
      card: {
        brand: "visa",
        checks: {
          address_line1_check: null,
          address_postal_code_check: null,
          cvc_check: null,
        },
        country: "US",
        exp_month: 7,
        exp_year: 2024,
        fingerprint: "Xt5EWLLDS7FJjR1c",
        funding: "credit",
        last4: "4242",
        networks: {
          available: ["visa"],
          preferred: null,
        },
        three_d_secure_usage: {
          supported: true,
        },
        wallet: null,
      },
      created: 1688719841,
      customer: null,
      livemode: false,
      metadata: {},
      type: "card",
      lastResponse: {
        statusCode: 200,
        headers: {},
        requestId: "req_test",
        apiVersion: "2020-08-27",
        idempotencyKey: "idempotency-key",
        stripeAccount: "acct_test",
      },
    };

    stripe.paymentIntents.retrieve.mockResolvedValueOnce(paymentIntentObj);
    stripe.paymentMethods.retrieve.mockResolvedValueOnce(paymentMethodObj);

    const result = await guestCaller.stripe.getStripePaymentMethod(
      "test-payment-intent-id",
    );

    expect(result).toEqual(paymentMethodObj);
    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
      "test-payment-intent-id",
    );
  });

  test("throws an error when the payment intent cannot be retrieved", async () => {
    stripe.paymentIntents.retrieve.mockRejectedValueOnce(new Error());

    await expect(
      guestCaller.stripe.getStripePaymentMethod("test-payment-intent-id"),
    ).rejects.toThrow();

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
      "test-payment-intent-id",
    );
  });

  test("throws an error when the payment method cannot be retrieved", async () => {
    const paymentIntentObj: Stripe.Response<Stripe.PaymentIntent> = {
      id: "test-payment-intent-id",
      object: "payment_intent",
      amount: 1000,
      amount_capturable: 0,
      amount_details: {
        tip: {},
      },
      amount_received: 0,
      application: null,
      application_fee_amount: null,
      automatic_payment_methods: null,
      canceled_at: null,
      cancellation_reason: null,
      capture_method: "automatic",
      client_secret: null,
      confirmation_method: "automatic",
      created: 1591917831,
      currency: "usd",
      customer: null,
      description: "Created by stripe.com/docs demo",
      invoice: null,
      last_payment_error: null,
      latest_charge: null,
      livemode: false,
      metadata: {},
      next_action: null,
      on_behalf_of: null,
      payment_method: null,
      payment_method_options: {
        card: {
          installments: null,
          mandate_options: null,
          network: null,
          request_three_d_secure: "automatic",
        },
      },
      payment_method_types: ["card"],
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: "requires_payment_method",
      transfer_data: null,
      transfer_group: null,
      lastResponse: {
        statusCode: 200,
        headers: {},
        requestId: "req_test",
        apiVersion: "2020-08-27",
        idempotencyKey: "idempotency-key",
        stripeAccount: "acct_test",
      },
      source: null,
    };

    stripe.paymentIntents.retrieve.mockResolvedValueOnce(paymentIntentObj);
    stripe.paymentMethods.retrieve.mockRejectedValueOnce(
      new Error("Could not retrieve payment method"),
    );

    await expect(
      guestCaller.stripe.getStripePaymentMethod("test-payment-intent-id"),
    ).rejects.toThrow("Could not retrieve payment method");

    expect(stripe.paymentIntents.retrieve).toHaveBeenCalledWith(
      "test-payment-intent-id",
    );
  });
});
