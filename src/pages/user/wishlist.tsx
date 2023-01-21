import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import type { GetServerSideProps, NextPage } from "next";

import WishlistTable from "@/components/WishlistTable";
import { useShopContext, type ShopContextProps } from "@/context/ShopContext";
import { useEffect } from "react";

const WishlistPage: NextPage<{ products: ProductType[] }> = ({ products }) => {
  const { syncWishlist, removeFromWishlist, filteredWishlist } =
    useShopContext() as ShopContextProps;

  useEffect(() => {
    syncWishlist(products);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-white">Wishlist</h1>
          <p className="mt-2 text-sm text-neutral-200">
            A list of all your favorite products.
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-neutral-900">
                <thead className="bg-neutral-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Category
                    </th>

                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 bg-neutral-700">
                  {filteredWishlist?.map((product: ProductType) => (
                    <WishlistTable
                      product={product}
                      key={product._id}
                      removeFromWishlist={removeFromWishlist}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
