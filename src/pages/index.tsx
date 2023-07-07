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
  // Get the user's session data
  const { data: sessionData } = useSession();

  // Get the syncWishlist function from the ShopContext
  const { syncWishlist } = useShopContext() as ShopContextProps;

  // Get the first four products to display on the home page
  const firstFourProducts = products.slice(0, 4);

  // Sync the wishlist with the user's wishlist in the database when the user logs in
  useEffect(() => {
    syncWishlist();
  }, [sessionData?.user]);
  // useEffect will run when the user logs in if the sessionData.user changes
  // This will sync the wishlist with the user's wishlist in the database
  // if you add syncWishList to the dependency array, it will go into an infinite loop

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
