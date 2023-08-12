import type { ProductType, SizeOption } from "@/types/product";
import * as React from "react";
import { createContext } from "react";
import { useCart } from "./hooks/cart";
import { useWishlist } from "./hooks/wishlist";

// Shop Context Types
export interface ShopContextProps {
  localWishIds: string[];
  setWishIds: React.Dispatch<React.SetStateAction<string[]>>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  syncWishlist: () => void;
  handleAddToCart: (
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption,
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

// Shop Context
export const ShopContext = createContext<ShopContextProps | undefined>(
  undefined,
);

interface Props {
  children: React.ReactNode;
}

// Shop Provider
export const ShopProvider: React.FC<Props> = ({ children }) => {
  // Wishlist Context
  const {
    localWishIds,
    setWishIds,
    addToWishlist,
    removeFromWishlist,
    syncWishlist,
  } = useWishlist();

  // Cart Context
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
