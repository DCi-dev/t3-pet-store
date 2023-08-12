// This component is used on the wishlist page to display the items in the wishlist

import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { env } from "@/env/client.mjs";
import { type ProductType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

import WishlistItem from "./WishlistItem";

const WishlistTable: React.FC = () => {
  const { removeFromWishlist, localWishIds } =
    useShopContext() as ShopContextProps;

  // Fetch data from Sanity CMS for the products in the wishlist
  const fetchWishlistItems = async () => {
    const input = encodeURIComponent(
      `*[_type == "product" && _id in [${localWishIds
        .map((id: string) => `"${id}"`)
        .join(",")}] ]`,
    );
    const res = await fetch(
      `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET}?query=${input}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.NEXT_PUBLIC_SANITY_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );
    return res.json();
  };

  // Query the wishlist items
  const { data, status } = useQuery({
    queryKey: ["wishlist", localWishIds],
    queryFn: fetchWishlistItems,
  });

  // While the data is loading, display a loading indicator
  if (status === "loading")
    return (
      <tbody className="divide-y divide-neutral-900 bg-neutral-700">
        <tr>
          <td
            colSpan={3}
            className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6"
          >
            <div className="flex items-center">
              <div className="h-16 w-16 flex-shrink-0">
                <div className="h-full w-full animate-pulse rounded-md bg-neutral-600" />
              </div>
              <div className="ml-4">
                <div className="h-4 w-1/2 animate-pulse rounded-md bg-neutral-600" />
                <div className="mt-1 h-4 w-1/4 animate-pulse rounded-md bg-neutral-600" />
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    );

  return (
    <tbody className="divide-y divide-neutral-900 bg-neutral-700">
      {data.result.map((product: ProductType) => (
        <WishlistItem
          product={product}
          key={product._id}
          removeFromWishlist={removeFromWishlist}
        />
      ))}
    </tbody>
  );
};

export default WishlistTable;
