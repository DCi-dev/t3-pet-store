// This will display each item in the cart as a table row
// inside the cart page
import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { env } from "@/env/client.mjs";
import { type ProductType } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import CartItem from "./CartItem";

const CartList: React.FC = () => {
  const { cartIds } = useShopContext() as ShopContextProps;

  // Fetch the products from Sanity using the cartIds
  const fetchCartItems = async () => {
    const input = encodeURIComponent(
      `*[_type == "product" && _id in [${cartIds
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

  // Use react-query to fetch the products inside the cart
  const { data, status } = useQuery({
    queryKey: ["cart", cartIds],
    queryFn: fetchCartItems,
    enabled: cartIds.length > 0,
  });

  // If the data is still loading, return an empty div
  if (status === "loading") return <div></div>;

  return (
    <>
      {data.result.map((product: ProductType) => (
        <CartItem product={product} key={product._id} />
      ))}
    </>
  );
};

export default CartList;
