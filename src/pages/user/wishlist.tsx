import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import type { GetServerSideProps, NextPage } from "next";

import { createTRPCContext } from "@/server/api/trpc";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

import superjson from "superjson";

import { appRouter } from "@/server/api/root";
import { contextProps } from "@trpc/react-query/shared";
import { useEffect, useState } from "react";

const WishlistPage: NextPage = () => {
  const [product, setProduct] = useState([]);

  useEffect(() => {
    const productListStorage = localStorage.getItem("productList");
    if (productListStorage) {
      const productArray = JSON.parse(productListStorage);
      setProduct(productArray);
    }
  }, []);

  return (
    <main>
      <div>
        <h1>Wishlist</h1>
        {product.map((product: ProductType) => {
          return (
            <div key={product._id}>
              <h2>{product.name}</h2>
            </div>
          );
        })}
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson,
  });

  const userId = await ssg.user.getCurrentUser.prefetch().then(user => {
    if (user) {
      return user._id;
    }
  });
  

  await ssg.wishlist.getItems.prefetch(userId);



  const query = '*[_type == "product"]';
  const products = await client.fetch(query);
  // Make sure to return { props: { trpcState: ssg.dehydrate() } }
  return {
    props: {
      trpcState: ssg.dehydrate(),
      products,
    },
  };
};

export default WishlistPage;
