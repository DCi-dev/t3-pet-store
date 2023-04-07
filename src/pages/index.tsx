import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";

import { HeroBanner, Incentives, ProductCard } from "@/components";

import Promo from "@/components/common/Promo";
import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { type ProductType } from "@/types/product";
import { client } from "@lib/client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const Home: NextPage = ({
  products,
  bannerData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data: sessionData } = useSession();
  const { syncWishlist } = useShopContext() as ShopContextProps;

  const firstFourProducts = products.slice(0, 4);

  useEffect(() => {
    syncWishlist();
  }, [sessionData?.user]);

  return (
    <>
      <HeroBanner heroBanner={bannerData.length && bannerData[0]} />
      <div className="bg-neutral-800">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 lg:py-6">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:mt-5 sm:text-6xl  xl:text-4xl">
            Best Selling Products
          </h2>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
          <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
            {firstFourProducts.map((product: ProductType) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </div>
      <Incentives />
      <Promo />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const query = '*[_type == "product"]';
  const products = await client.fetch(query);

  const bannerQuery = '*[_type == "banner"]';
  const bannerData = await client.fetch(bannerQuery);

  return {
    props: { products, bannerData },
  };
};

export default Home;
