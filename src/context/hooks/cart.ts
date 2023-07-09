// Hooks for the cart context
import type { CartProduct, ProductType, SizeOption } from "@/types/product";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export const useCart = () => {
  const { data: sessionData } = useSession();
  const [cartIds, setCartIds] = useState<string[]>([""]);

  // Cart trpc queries and mutations
  const cart = api.cart.getItems.useQuery();
  const addCartProduct = api.cart.addItem.useMutation();
  const updateCartProductSize = api.cart.updateSize.useMutation();
  const updateCartProductFlavor = api.cart.updateFlavor.useMutation();
  const updateCartProductQuantity = api.cart.updateQuantity.useMutation();
  const removeCartProduct = api.cart.removeItem.useMutation();
  const syncCart = api.cart.synchronizeCart.useMutation();

  // Add to local storage cart
  async function addToLocalStorageCart(
    product: ProductType,
    selectedFlavor: string,
    selectedSize: SizeOption
  ) {
    const localCart = JSON.parse(localStorage.getItem("cart") ?? "[]");

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
        productName: product.name,
        image: product.image[0]?.asset?._ref,
        sizeOption: selectedSize,
        flavor: selectedFlavor,
        slug: product.slug.current,
        quantity: 1,
      });
    }

    // Save the updated cart to local storage
    localStorage.setItem("cart", JSON.stringify(localCart));
  }

  // Add to database cart
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
        name: product.name,
        image: product.image[0]?.asset?._ref,
        sizeOption: selectedSize,
        slug: product.slug.current,
        flavor: selectedFlavor,
        quantity: 1,
      });
      await cart.refetch();
    }
  }

  // Add to cart function that adds to both local storage and database cart
  // If the user is logged in, it will add to the database cart
  // If the user is not logged in, it will add to the local storage cart
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
      return err;
    });

    toast.success("Product added to cart");
  }

  // Remove from cart function that removes from both local storage and database cart
  // If the user is logged in, it will remove from the database cart and local storage cart
  // If the user is not logged in, it will remove from the local storage cart
  const handleRemoveFromCart = (productId: string) => {
    if (sessionData && cart.data) {
      removeCartProduct.mutate({
        productId: productId,
      });
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") ?? "[]").filter(
            (product: CartProduct) => product.productId !== productId
          )
        )
      );

      setCartIds(cartIds.filter((id) => id !== productId));
    } else {
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") ?? "[]").filter(
            (product: CartProduct) => product.productId !== productId
          )
        )
      );
      setCartIds(cartIds.filter((id) => id !== productId));
    }
    toast.success(`Product removed from cart`);
  };

  // Sync cart function that syncs the local storage cart with the database cart
  const processedCart = new Set();

  const mergeCart = async () => {
    // Get the cart from local storage
    const storageCart: CartProduct[] = JSON.parse(
      localStorage.getItem("cart") ?? "[]"
    );
    //  Sync the local storage cart with the server cart
    const serverCart = cart.data?.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      image: item.image,
      slug: item.slug,
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
            name: item.productName,
            image: item.image,
            sizeOption: item.sizeOption,
            flavor: item.flavor,
            quantity: item.quantity,
            slug: item.slug,
          });
        }
      });
    };
    await syncFunc();
  };

  const handleCartSync = async () => {
    // Get the cart from local storage
    const storageCart = JSON.parse(localStorage.getItem("cart") ?? "[]");

    if (sessionData?.user && cart.data) {
      mergeCart();
    }
    setCartIds(
      storageCart.map((item: CartProduct) => {
        return item.productId;
      })
    );
  };

  // Quantity change
  const handleQuantityChange = (productId: string, qty: number) => {
    const localCart = JSON.parse(localStorage.getItem("cart") ?? "[]");
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
    const cart = JSON.parse(localStorage.getItem("cart") ?? "[]");
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

  return {
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
  };
};
