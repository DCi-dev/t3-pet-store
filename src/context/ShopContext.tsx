import type { ProductType, SizeOption } from "@/types/product";
import * as React from "react";
import { createContext } from "react";
import { useCart } from "./hooks/cart";
import { useWishlist } from "./hooks/wishlist";

export interface ShopContextProps {
  localWishIds: string[];
  setWishIds: React.Dispatch<React.SetStateAction<string[]>>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  syncWishlist: () => void;
  handleAddToCart: (
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) => void;
  cartIds: string[];
  setCartIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleRemoveFromCart: (productId: string) => void;
  handleCartSync: () => void;
  handleQuantityChange: (productId: string, quantity: number) => void;
  totalPrice: number;
  totalTaxes: number;
  totalQuantity: number;
  totalShipping: number;
  orderTotal: number;
  handleCartDetails: () => void;
}

export const ShopContext = createContext<ShopContextProps | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

export const ShopProvider: React.FC<Props> = ({ children }) => {
  // Wishlist
  const {
    localWishIds,
    setWishIds,
    addToWishlist,
    removeFromWishlist,
    syncWishlist,
  } = useWishlist();

  // Cart
  const {
    handleAddToCart,
    cartIds,
    setCartIds,
    handleRemoveFromCart,
    handleCartSync,
    handleQuantityChange,
    totalPrice,
    totalShipping,
    totalTaxes,
    orderTotal,
    totalQuantity,
    handleCartDetails,
  } = useCart();

  return (
    <ShopContext.Provider
      value={{
        localWishIds,
        setWishIds,
        addToWishlist,
        removeFromWishlist,
        syncWishlist,
        handleAddToCart,
        cartIds,
        setCartIds,
        handleRemoveFromCart,
        handleCartSync,
        handleQuantityChange,
        totalPrice,
        totalShipping,
        totalTaxes,
        orderTotal,
        totalQuantity,
        handleCartDetails,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShopContext = () => React.useContext(ShopContext);
