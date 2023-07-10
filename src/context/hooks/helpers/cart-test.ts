import type { ProductType } from "@/types/product";
import type { Session } from "next-auth";

// Mock the localStorage
export const localStorageMock = (() => {
  let store: { [key: string]: unknown } = {};

  return {
    getItem(key: string | number) {
      return store[key.toString()];
    },

    setItem(key: string | number, value: unknown) {
      store[key.toString()] = value;
    },

    clear() {
      store = {};
    },

    removeItem(key: string | number) {
      delete store[key.toString()];
    },

    getAll() {
      return store;
    },
  };
})();

// Mock the product data
export const mockProduct: ProductType = {
  _id: "test-product-id",
  _createdAt: "test-product-created-at",
  _rev: "test-product-rev",
  _type: "product",
  _updatedAt: "test-product-updated-at",
  name: "test-product-name",
  slug: {
    current: "test-product-slug",
    _type: "slug",
  },
  image: [
    {
      _key: "test-image-key",
      _type: "image",
      _upload: {
        createdAt: "test-image-created-at",
        file: {
          name: "test-image-name",
          type: "test-image-type",
        },
        previewImage: "test-image-preview-image",
      },
      asset: {
        _ref: "test-image-ref",
        _type: "reference",
      },
    },
  ],
  description: "test-product-description",
  category: "test-product-category",
  flavor: ["test-product-flavor"],
  sizeOptions: [
    {
      size: "test-size-name",
      price: 10,
      _key: "test-size-key",
    },
  ],
};

// Mock the selected flavor
export const mockSelectedFlavor = "test-product-flavor";

// Mock the selected size
export const mockSelectedSize = {
  size: "test-size-name",
  price: 10,
  _key: "test-size-key",
};

// Mock the useSession hook to return a data: sessionData object
export const mockSession: Session = {
  user: {
    id: "test-user-id",
    name: "test-user-name",
    email: "test-user-email",
    image: "test-user-image",
  },
  expires: new Date().toISOString(),
};

// Mock second product data
export const mockProductTwo: ProductType = {
  _id: "test-product-id-2",
  _createdAt: "test-product-created-at",
  _rev: "test-product-rev",
  _type: "product",
  _updatedAt: "test-product-updated-at",
  name: "test-product-name-2",
  slug: {
    current: "test-product-slug-2",
    _type: "slug",
  },
  image: [
    {
      _key: "test-image-key-2",
      _type: "image",
      _upload: {
        createdAt: "test-image-created-at",
        file: {
          name: "test-image-name-2",
          type: "test-image-type",
        },
        previewImage: "test-image-preview-image-2",
      },
      asset: {
        _ref: "test-image-ref-2",
        _type: "reference",
      },
    },
  ],
  description: "test-product-description-2",
  category: "test-product-category-2",
  flavor: ["test-product-flavor-2"],
  sizeOptions: [
    {
      size: "test-size-name-2",
      price: 20,
      _key: "test-size-key-2",
    },
  ],
};

// Mock the selected flavor for the second product
export const mockSelectedFlavorTwo = "test-product-flavor-2";

// Mock the selected size for the second product
export const mockSelectedSizeTwo = {
  size: "test-size-name-2",
  price: 20,
  _key: "test-size-key-2",
};

// Mock two products data in one using the spread operator
export const mockTwoProducts = [
  {
    ...mockProduct,
    sizeOption: mockSelectedSize,
    flavor: mockSelectedFlavor,
    quantity: 1,
  },
  {
    ...mockProductTwo,
    sizeOption: mockSelectedSizeTwo,
    flavor: mockSelectedFlavorTwo,
    quantity: 1,
  },
];
