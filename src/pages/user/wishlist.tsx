import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import type { GetServerSideProps, NextPage } from "next";

import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const WishlistPage: NextPage<{ products: ProductType[] }> = ({ products }) => {
  const { data: sessionData } = useSession();

  const [productId, setProductId] = useState([""]);

  // This filter should be realisticaly done in the getServersideProps
  const filteredPropducstById =
    productId.length === 0
      ? products
      : products.filter((product) => productId.includes(product._id));

  console.log(filteredPropducstById + "filtered shit");

  console.log(productId);

  const wishlist = api.wishlist.getItems.useQuery();

  const setProductIdState = () => {
    const productListStorage = sessionStorage.getItem("productList");
    const localProductIds = productListStorage
      ? JSON.parse(productListStorage)
      : [];
    if (sessionData?.user && wishlist.data) {
      const serverProductIds = wishlist.data.map((item) => item.productId);
      setProductId([...new Set([...localProductIds, ...serverProductIds])]);
    } else if (sessionData?.user && !wishlist.data) {
      setProductId(localProductIds);
    } else {
      setProductId([]);
    }
  };

  useEffect(() => {
    setProductIdState();
  }, [sessionData?.user, wishlist.data]);

  return (
    <main>
      <div>
        <h1>Wishlist</h1>
        {filteredPropducstById.map((product: ProductType) => {
          return (
            <div key={product._id}>
              <h2 className="text-3xl text-white">{product.name}</h2>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const query = '*[_type == "product"]';
  const products = await client.fetch(query);

  return {
    props: {
      products,
    },
  };
};

export default WishlistPage;
