import type { ProductType } from "@/types/product";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import * as React from "react";
import { createContext, useState } from "react";

export interface ShopContextProps {
  cartItems: string[];
  setCartItems: React.Dispatch<React.SetStateAction<string[]>>;
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  totalQuantities: number;
  setTotalQuantities: React.Dispatch<React.SetStateAction<number>>;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
  selectedSize: number;
  setSelectedSize: React.Dispatch<React.SetStateAction<number>>;
  selectedFlavor: number;
  setSelectedFlavor: React.Dispatch<React.SetStateAction<number>>;
  filteredWishlist: ProductType[];
  setFilteredWishlist: React.Dispatch<React.SetStateAction<ProductType[]>>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  syncWishlist: (products: ProductType[]) => void;
}

export const ShopContext = createContext<ShopContextProps | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

export const ShopProvider: React.FC<Props> = ({ children }) => {
  const { data: sessionData } = useSession();
  const [cartItems, setCartItems] = useState([""]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);

  // Product options
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState(0);

  // Wishlist
  const [filteredWishlist, setFilteredWishlist] = useState<ProductType[]>([]);

  const wishlist = api.wishlist.getItems.useQuery();
  const addWishlistProduct = api.wishlist.addItem.useMutation();
  const removeWishlistProduct = api.wishlist.removeItem.useMutation();
  const syncWishlistProducts = api.wishlist.synchronizeWishlist.useMutation();
  const processedWishlistIds = new Set();

  const addToWishlist = (productId: string) => {
    // check if the user is authenticated
    if (!sessionData?.user) {
      // if not, add the product to the wishlist on the client side
      const productIds = JSON.parse(
        localStorage.getItem("productList") || "[]"
      );
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        localStorage.setItem("productList", JSON.stringify(productIds));
      }
    } else {
      // if the user is authenticated, send the product id to the server
      // using TRPC call
      const productIds = JSON.parse(
        localStorage.getItem("productList") || "[]"
      );
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        localStorage.setItem("productList", JSON.stringify(productIds));
      }
      // Check if the product id is already in the database if not add it

      if (!wishlist.data) {
        addWishlistProduct.mutate(productId);
      } else {
        const productIds = wishlist.data.map((product) => product.productId);
        if (!productIds.includes(productId)) {
          // if the productIds array does not include the product id, add it
          addWishlistProduct.mutate(productId);
        }
      }
    }
  };

  const removeFromWishlist = (productId: string) => {
    const productListStorage = localStorage.getItem("productList");
    if (sessionData?.user) {
      removeWishlistProduct.mutate(productId);
      if (productListStorage) {
        let storageArray = JSON.parse(productListStorage);
        storageArray = storageArray.filter((id: string) => id !== productId);
        localStorage.setItem("productList", JSON.stringify(storageArray));
      }
      setFilteredWishlist(
        filteredWishlist?.filter(
          (product: ProductType) => product._id !== productId
        )
      );
    } else {
      if (productListStorage) {
        let storageArray = JSON.parse(productListStorage);
        storageArray = storageArray.filter((id: string) => id !== productId);
        localStorage.setItem("productList", JSON.stringify(storageArray));
      }
      setFilteredWishlist(
        filteredWishlist?.filter(
          (product: ProductType) => product._id !== productId
        )
      );
    }
  };

  const syncWishlist = async (products: ProductType[]) => {
    const localIds = JSON.parse(localStorage.getItem("productList") || "[]");
    if (sessionData?.user) {
      if (wishlist.data) {
        const serverProductIds = wishlist.data.map((item) => item.productId);
        const productIds = [...new Set([...localIds, ...serverProductIds])];
        localStorage.setItem("productList", JSON.stringify(productIds));
        localIds.forEach((id: string) => {
          if (!processedWishlistIds.has(id)) {
            processedWishlistIds.add(id);
            syncWishlistProducts.mutate(id);
          }
        });
      } else {
        localIds.forEach((id: string) => {
          if (!processedWishlistIds.has(id)) {
            processedWishlistIds.add(id);
            addWishlistProduct.mutate(id);
          }
        });
      }
    }
    const filteredProductsById = products.filter((product) =>
      localIds.includes(product._id)
    );
    setFilteredWishlist(filteredProductsById);
  };

  return (
    <ShopContext.Provider
      value={{
        cartItems,
        setCartItems,
        totalPrice,
        setTotalPrice,
        totalQuantities,
        setTotalQuantities,
        qty,
        setQty,
        selectedSize,
        setSelectedSize,
        selectedFlavor,
        setSelectedFlavor,
        filteredWishlist,
        setFilteredWishlist,
        addToWishlist,
        removeFromWishlist,
        syncWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShopContext = () => React.useContext(ShopContext);
