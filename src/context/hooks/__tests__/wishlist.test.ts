import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useWishlist } from "../wishlist";

import { localStorageMock, mockSession } from "../helpers/cart-test";

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

// Add these mutation mock functions at the top of your test file
const addWishlistProductMutateMock = jest.fn();
const removeWishlistProductMutateMock = jest.fn();
const syncWishlistProductsMutateMock = jest.fn();

// Add these mock return values

jest.mock("@utils/api", () => ({
  api: {
    wishlist: {
      getItems: {
        useQuery: jest.fn().mockReturnValue({ data: [] }),
      },
      addItem: {
        useMutation: jest.fn(() => ({
          mutate: addWishlistProductMutateMock,
          data: null,
          error: null,
          status: "idle",
          isSuccess: true,
          isError: false,
          isLoading: false,
        })),
      },
      removeItem: {
        useMutation: jest.fn(() => ({
          mutate: removeWishlistProductMutateMock,
          data: null,
          error: null,
          status: "idle",
          isSuccess: true,
          isError: false,
          isLoading: false,
        })),
      },
      synchronizeWishlist: {
        useMutation: jest.fn(() => ({
          mutate: syncWishlistProductsMutateMock,
          data: null,
          error: null,
          status: "idle",
          isSuccess: true,
          isError: false,
          isLoading: false,
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

// Mock const [localWishIds, setWishIds] = useState<string[]>([""]);
const mockSetWishIds = jest.fn();
(useState as jest.Mock).mockImplementation((initial) => [
  initial,
  mockSetWishIds,
]);

// Mock the localStorage
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Wishlist Context Hooks", () => {
  describe("Wishlist should contain", () => {
    it("should return the wishlist data", () => {
      const { localWishIds } = useWishlist();
      expect(localWishIds).toBeDefined();
    });

    it("should return the addWishlistProduct mutation", () => {
      const { addToWishlist } = useWishlist();
      expect(addToWishlist).toBeDefined();
    });

    it("should return the removeWishlistProduct mutation", () => {
      const { removeFromWishlist } = useWishlist();
      expect(removeFromWishlist).toBeDefined();
    });

    it("should return the syncWishlistProducts mutation", () => {
      const { syncWishlist } = useWishlist();
      expect(syncWishlist).toBeDefined();
    });
  });

  describe("Test Wishlist Logic for Guests - Local Storage", () => {
    it("should add a product to the wishlist", () => {
      const { addToWishlist } = useWishlist();
      addToWishlist("test-product-id");
      expect(mockSetWishIds).toHaveBeenCalledWith(["", "test-product-id"]);
    });

    it("should not add a product to the wishlist if it already exists", () => {
      // Mock the localStorage to return a product id
      localStorage.setItem("productList", JSON.stringify(["test-product-id"]));
      const { addToWishlist } = useWishlist();
      addToWishlist("test-product-id");
      expect(mockSetWishIds).toHaveBeenCalledWith(["", "test-product-id"]);
      // Expect the localStorage to return the same product id
      expect(localStorage.getItem("productList")).toEqual(
        JSON.stringify(["test-product-id"])
      );
    });

    it("should remove a product from the wishlist", () => {
      // Mock the localStorage to return a product id
      localStorage.setItem("productList", JSON.stringify(["test-product-id"]));

      // Call the remove function
      const { removeFromWishlist } = useWishlist();
      removeFromWishlist("test-product-id");

      // Test the mock function
      expect(mockSetWishIds).toHaveBeenCalledWith([""]);
      // Expect the localStorage to return the same product id
      expect(localStorage.getItem("productList")).toEqual(JSON.stringify([]));
    });
  });
});
