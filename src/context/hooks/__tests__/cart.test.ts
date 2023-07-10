import { act, renderHook } from "@testing-library/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "../cart";
import {
  localStorageMock,
  mockProduct,
  mockProductTwo,
  mockSelectedFlavor,
  mockSelectedSize,
  mockSession,
} from "../helpers/cart-test";

// Mock the next-auth react hooks
jest.mock("next-auth/react");

const mockUseSession = useSession as jest.Mock;
(signIn as jest.Mock).mockImplementation(() => jest.fn());
(signOut as jest.Mock).mockImplementation(() => jest.fn());

// Mock the useSession hook to return a data: sessionData object
mockUseSession.mockReturnValue({
  status: "authenticated",
  data: {
    sessionData: mockSession,
  },
});

// Mock the trpc api calls
jest.mock("@utils/api", () => ({
  api: {
    cart: {
      getItems: {
        useQuery: jest.fn(),
      },
      addItem: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      updateSize: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      updateFlavor: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      updateQuantity: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      removeItem: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      synchronizeCart: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
    },
  },
}));

// Mock useState hook
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

// Mock the useState hook to return a cartIds state
(useState as jest.Mock).mockReturnValueOnce(["test-cart-id", jest.fn()]);
// Mock the useState hook to return a totalPrice state
(useState as jest.Mock).mockReturnValueOnce([0, jest.fn()]);
// Mock the useState hook to return a totalShipping state
(useState as jest.Mock).mockReturnValueOnce([0, jest.fn()]);
// Mock the useState hook to return a totalTaxes state
(useState as jest.Mock).mockReturnValueOnce([0, jest.fn()]);
// Mock the useState hook to return a orderTotal state
(useState as jest.Mock).mockReturnValueOnce([0, jest.fn()]);
// Mock the useState hook to return a totalQuantity state
(useState as jest.Mock).mockReturnValueOnce([1, jest.fn()]);

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
  },
}));

// Mock the localStorage
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Cart Context Hooks", () => {
  const { result } = renderHook(() => useCart());

  it("Adds to Cart - in Local Storage", async () => {
    // Render the hook

    // Call the addToLocalStorageCart function with test data
    await act(async () => {
      await result.current.handleAddToCart(
        mockProduct,
        mockSelectedFlavor,
        mockSelectedSize
      );
    });

    // Assert the expected changes in the local storage cart
    expect(localStorageMock.getItem("cart")).toEqual(
      JSON.stringify([
        {
          productId: "test-product-id",
          productName: "test-product-name",
          image: "test-image-ref",
          sizeOption: {
            size: "test-size-name",
            price: 10,
            _key: "test-size-key",
          },
          flavor: "test-product-flavor",
          slug: "test-product-slug",
          quantity: 1,
        },
      ])
    );
  });

  it("Adds two different products to Cart - in Local Storage", async () => {
    // Call the addToLocalStorageCart function with first test product
    await act(async () => {
      await result.current.handleAddToCart(
        mockProduct,
        mockSelectedFlavor,
        mockSelectedSize
      );
    });

    // Call the addToLocalStorageCart function with second test product
    await act(async () => {
      await result.current.handleAddToCart(
        mockProductTwo,
        "test-product-flavor-2",
        {
          size: "test-size-name-2",
          price: 20,
          _key: "test-size-key-2",
        }
      );
    });

    // Assert the expected changes in the local storage cart
    // Two products should be present now
    expect(localStorageMock.getItem("cart")).toEqual(
      JSON.stringify([
        {
          productId: "test-product-id",
          productName: "test-product-name",
          image: "test-image-ref",
          sizeOption: {
            size: "test-size-name",
            price: 10,
            _key: "test-size-key",
          },
          flavor: "test-product-flavor",
          slug: "test-product-slug",
          quantity: 1,
        },
        {
          productId: "test-product-id-2",
          productName: "test-product-name-2",
          image: "test-image-ref-2",
          sizeOption: {
            size: "test-size-name-2",
            price: 20,
            _key: "test-size-key-2",
          },
          flavor: "test-product-flavor-2",
          slug: "test-product-slug-2",
          quantity: 1,
        },
      ])
    );
  });

  it("Updates quantity of a product in the Cart - in Local Storage", async () => {
    // Setup: Add a product to the cart
    await act(async () => {
      await result.current.handleAddToCart(
        mockProduct,
        mockSelectedFlavor,
        mockSelectedSize
      );
    });

    // Call the handleUpdateQuantity function
    await act(async () => {
      result.current.handleQuantityChange("test-product-id", 2);
    });

    // Test that it updated the quantity in the local storage cart
    const storedCart = JSON.parse(localStorageMock.getItem("cart") as string);
    expect(storedCart[0].quantity).toEqual(2);
  });
});
