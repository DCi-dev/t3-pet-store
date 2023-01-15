import * as React from "react";
import { createContext, useState } from "react";

export interface ShopContextProps {
  showCart: boolean;
  setShowCart: React.Dispatch<React.SetStateAction<boolean>>;
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
  wishlistItems: string[];
  setWishlistItems: React.Dispatch<React.SetStateAction<string[]>>;
  increaseQuantity: () => void;
  decreaseQuantity: () => void;
}

export const ShopContext = createContext<ShopContextProps | undefined>(
  undefined
);

interface Props {
  children: React.ReactNode;
}

export const ShopProvider: React.FC<Props> = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([""]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);

  // Product options
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState(0);

  // Wishlist items
  const [wishlistItems, setWishlistItems] = useState([""]);

  // Quantity
  const increaseQuantity = () => {
    setQty(qty + 1);
  };

  const decreaseQuantity = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        showCart,
        setShowCart,
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
        wishlistItems,
        setWishlistItems,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShopContext = () => React.useContext(ShopContext);
