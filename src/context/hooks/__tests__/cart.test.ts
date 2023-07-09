import { act, renderHook } from "@testing-library/react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useCart } from "../cart";
import {
  localStorageMock,
  mockProduct,
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
        useMutation: jest.fn(),
      },
      updateSize: {
        useMutation: jest.fn(),
      },
      updateFlavor: {
        useMutation: jest.fn(),
      },
      updateQuantity: {
        useMutation: jest.fn(),
      },
      removeItem: {
        useMutation: jest.fn(),
      },
      synchronizeCart: {
        useMutation: jest.fn(),
      },
    },
  },
}));

// Mock useState hook
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
}));

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
// Mock the useState hook to return a cartIds state
(useState as jest.Mock).mockReturnValueOnce(["test-cart-id", jest.fn()]);

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
  },
}));

beforeAll(() => {
  // reset mocks
  jest.clearAllMocks();
});

// Mock the localStorage
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Cart Context Hooks", () => {
  it("Add to Cart - in Local Storage", async () => {
    // Render the hook
    const { result } = renderHook(() => useCart());

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

  it("Remove from Cart - in Local Storage", async () => {});
});
