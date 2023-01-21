import type { CartProduct, ProductType, SizeOption } from "@/types/product";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import * as React from "react";
import { createContext, useState } from "react";

export interface ShopContextProps {
  filteredWishlist: ProductType[];
  setFilteredWishlist: React.Dispatch<React.SetStateAction<ProductType[]>>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  syncWishlist: (products: ProductType[]) => void;
  handleAddToCart: (
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) => void;
  filteredCart: ProductType[];
  handleRemoveFromCart: (productId: string) => void;
  handleCartSync: (products: ProductType[]) => void;
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
  const { data: sessionData } = useSession();

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
            syncWishlistProducts.mutate(id);
          }
        });
      }
    }
    const filteredProductsById = products.filter((product) =>
      localIds.includes(product._id)
    );
    setFilteredWishlist(filteredProductsById);
  };

  // Cart
  const [filteredCart, setFilteredCart] = useState<ProductType[]>([]);

  const cart = api.cart.getItems.useQuery();
  const addCartProduct = api.cart.addItem.useMutation();
  const updateCartProductSize = api.cart.updateSize.useMutation();
  const updateCartProductFlavor = api.cart.updateFlavor.useMutation();
  const updateCartProductQuantity = api.cart.updateQuantity.useMutation();
  const removeCartProduct = api.cart.removeItem.useMutation();
  const syncCart = api.cart.synchronizeCart.useMutation();

  async function addToLocalStorageCart(
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) {
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // filter the cart by product id and selected size and flavor
    const existingItem = localCart.filter(
      (item: { productId: string }) => item.productId === product._id
    );
    if (existingItem.length > 0) {
      // update the sizeOption and flavor of the existing item
      existingItem[0].sizeOption = selectedSize;
      existingItem[0].flavor = selectedFlavor;
    } else {
      //create new item with selectedSize, selectedFlavor and quantity 1
      localCart.push({
        productId: product._id,
        sizeOption: selectedSize,
        flavor: selectedFlavor,
        quantity: 1,
      });
    }

    // Save the updated cart to local storage
    localStorage.setItem("cart", JSON.stringify(localCart));
  }

  async function addToDatabaseCart(
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) {
    // Wait for server cart data to be fetched
    await cart.refetch();

    // Update the product if it exists
    const serverItems = cart.data?.find(
      (item: { productId: string }) => item.productId === product._id
    );
    if (serverItems) {
      updateCartProductSize.mutate({
        productId: serverItems.productId,
        cartItemId: serverItems.id,
        size: selectedSize,
      });
      updateCartProductFlavor.mutate({
        productId: product._id,
        flavor: selectedFlavor,
      });
    } else {
      // Make sure that the product isn't already in the database
      removeCartProduct.mutate({
        productId: product._id,
      });
      //  Add product to the database
      addCartProduct.mutate({
        _id: product._id,
        sizeOption: selectedSize,
        flavor: selectedFlavor,
        quantity: 1,
      });
      await cart.refetch();
    }
  }

  // Add to cart
  async function handleAddToCart(
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) {
    const [serverPromise, localPromise] = sessionData
      ? [
          addToDatabaseCart(product, selectedFlavor, selectedSize),
          addToLocalStorageCart(product, selectedFlavor, selectedSize),
        ]
      : [null, addToLocalStorageCart(product, selectedFlavor, selectedSize)];

    await Promise.all([serverPromise, localPromise]).catch((err) => {
      console.log(err);
    });
  }

  // Remove from cart
  const handleRemoveFromCart = (productId: string) => {
    if (sessionData && cart.data) {
      removeCartProduct.mutate({
        productId: productId,
      });
      setFilteredCart(
        filteredCart?.filter((product) => product._id !== productId)
      );
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") || "[]").filter(
            (product: CartProduct) => product.productId !== productId
          )
        )
      );
    } else {
      setFilteredCart(
        filteredCart?.filter((product) => product._id !== productId)
      );
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") || "[]").filter(
            (product: ProductType) => product._id !== productId
          )
        )
      );
    }
  };

  // Sync cart

  const processedCart = new Set();

  const mergeCart = async () => {
    // Get the cart from local storage
    const storageCart: CartProduct[] = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );
    //  Sync the local storage cart with the server cart
    const serverCart = cart.data?.map((item) => ({
      productId: item.productId,
      sizeOption: {
        _key: item.sizeOption?.key,
        price: item.sizeOption?.price,
        size: item.sizeOption?.size,
      },
      flavor: item.flavor,
      quantity: item.quantity,
    })) as CartProduct[];

    const cartItems = [
      ...new Set(
        [...storageCart, ...serverCart].filter(
          (item, index, self) =>
            self.findIndex((i) => i.productId === item.productId) === index
        )
      ),
    ];

    localStorage.setItem("cart", JSON.stringify(cartItems));
    const syncFunc = async () => {
      storageCart.forEach((item: CartProduct) => {
        if (!processedCart.has(item.productId)) {
          processedCart.add(item);
          syncCart.mutate({
            _id: item.productId,
            sizeOption: item.sizeOption,
            flavor: item.flavor,
            quantity: item.quantity,
          });
        }
      });
    };
    await syncFunc();
  };

  const handleCartSync = async (products: ProductType[]) => {
    // Get the cart from local storage
    const storageCart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (sessionData?.user && cart.data) {
      mergeCart();
    }

    // Filter the products by the ids, sizeOption and flavor in the cart
    const filteredProducts = products.filter((product) =>
      storageCart.some(
        (item: { productId: string; flavor: string }) =>
          item.productId === product._id && product.flavor.includes(item.flavor)
      )
    );

    // Set the filtered products
    setFilteredCart(filteredProducts);
  };

  // Quantity change
  const handleQuantityChange = (productId: string, qty: number) => {
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const product = localCart.find(
      (item: { productId: string }) => item.productId === productId
    );
    product.quantity = qty;
    localStorage.setItem("cart", JSON.stringify(localCart));
    if (sessionData) {
      updateCartProductQuantity.mutate({
        productId: productId,
        quantity: qty,
      });
    }
    // Set the total quantity
    setTotalQuantity(
      localCart.reduce((acc: number, item: CartProduct) => {
        return acc + item.quantity;
      }, 0)
    );
  };

  // Cart Details
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(1);

  const handleCartDetails = async () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartTotal = cart.reduce((acc: number, item: CartProduct) => {
      return acc + item.sizeOption.price * item.quantity;
    }, 0);
    setTotalPrice(cartTotal);

    // Set totalShipping to 0 if the total price is 0 or over 100, otherwise set it to 5
    setTotalShipping(cartTotal > 100 ? 0 : cartTotal === 0 ? 0 : 5);

    // Set totalTax to 19% of the total price
    setTotalTaxes(cartTotal * 0.19);

    // Set orderTotal to the total price + total shipping + total taxes
    setOrderTotal(cartTotal + totalShipping + totalTaxes);
  };

  return (
    <ShopContext.Provider
      value={{
        filteredWishlist,
        setFilteredWishlist,
        addToWishlist,
        removeFromWishlist,
        syncWishlist,
        handleAddToCart,
        filteredCart,
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
