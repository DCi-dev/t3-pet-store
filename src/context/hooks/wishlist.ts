import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

export const useWishlist = () => {
  const { data: sessionData } = useSession();
  // Wishlist
  const [localWishIds, setWishIds] = useState<string[]>([""]);

  // Wishlist trpc queries and mutations
  const wishlist = api.wishlist.getItems.useQuery();
  const addWishlistProduct = api.wishlist.addItem.useMutation();
  const removeWishlistProduct = api.wishlist.removeItem.useMutation();
  const syncWishlistProducts = api.wishlist.synchronizeWishlist.useMutation();
  const processedWishlistIds = new Set();

// Add to wishlist function that checks if the user is authenticated
// if not, add the product to the wishlist on the client side
// if the user is authenticated, send the product id to the server
  const addToWishlist = (productId: string) => {
    // Check if the user is authenticated
    if (!sessionData?.user) {
      // if not, add the product to the wishlist on the client side
      const productIds = JSON.parse(
        localStorage.getItem("productList") ?? "[]"
      );
      // Check if the product id is already in the local storage if not add it
      if (!productIds.includes(productId)) {
        productIds.push(productId);
        localStorage.setItem("productList", JSON.stringify(productIds));
      }
      setWishIds([...localWishIds, productId]);
    } else {
      // if the user is authenticated, send the product id to the server
      // using TRPC call
      const productIds = JSON.parse(
        localStorage.getItem("productList") ?? "[]"
      );
      setWishIds([...localWishIds, productId]);
      // Check if the product id is already in the local storage if not add it
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

    toast.success("Product added to wishlist");
  };

  // Remove from wishlist function that checks if the user is authenticated
  const removeFromWishlist = (productId: string) => {
    const productListStorage = localStorage.getItem("productList");
    // Check if the user is authenticated
    if (sessionData?.user) {
      // if the user is authenticated, send the product id to the server
      // using TRPC call to remove the product from the wishlist
      removeWishlistProduct.mutate(productId);
      if (productListStorage) {
        let storageArray = JSON.parse(productListStorage);
        storageArray = storageArray.filter((id: string) => id !== productId);
        localStorage.setItem("productList", JSON.stringify(storageArray));
      }
      // Remove the product id from the local wishlist
      setWishIds(localWishIds.filter((id: string) => id !== productId));
    } else {
      // if the user is not authenticated, remove the product from the wishlist
      // on the client side
      if (productListStorage) {
        let storageArray = JSON.parse(productListStorage);
        storageArray = storageArray.filter((id: string) => id !== productId);
        localStorage.setItem("productList", JSON.stringify(storageArray));
      }

      setWishIds(localWishIds.filter((id: string) => id !== productId));
    }
    toast.success("Product removed from wishlist");
  };

  // Sync wishlist function that checks if the user is authenticated
  // if it is authenticated, it will merge the product ids from the local storage
  // with the server using TRPC call
  const syncWishlist = async () => {
    // Check local storage for product ids
    const localIds = JSON.parse(localStorage.getItem("productList") ?? "[]");
    // Check if the user is authenticated
    if (sessionData?.user) {
      // if there is a wishlist on the server, get the product ids
      // and add them to the local storage
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
        // if there is no wishlist on the server, add the product ids from the local storage
        localIds.forEach((id: string) => {
          if (!processedWishlistIds.has(id)) {
            processedWishlistIds.add(id);
            syncWishlistProducts.mutate(id);
          }
        });
      }
    }
    setWishIds(localIds);
  };

  return {
    localWishIds,
    setWishIds,
    addToWishlist,
    removeFromWishlist,
    syncWishlist,
  };
};
