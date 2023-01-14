import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import type { GetServerSideProps, NextPage } from "next";

import WishlistTable from "@/components/WishlistTable";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const WishlistPage: NextPage<{ products: ProductType[] }> = ({ products }) => {
  const { data: sessionData } = useSession();

  const [filteredProducts, setFilteredProducts] = useState<
    ProductType[] | undefined
  >();

  const wishlist = api.wishlist.getItems.useQuery();
  const syncItems = api.wishlist.synchronizeWishlist.useMutation();

  useEffect(() => {
    let productIds = JSON.parse(sessionStorage.getItem("productList") || "[]");

    if (sessionData && wishlist.data) {
      const serverProductIds = wishlist.data.map((item) => item.productId);
      productIds = [...new Set([...productIds, ...serverProductIds])];
      sessionStorage.setItem("productList", JSON.stringify(productIds));
    }

    const filteredProductsById = products.filter((product) =>
      productIds.includes(product._id)
    );

    // Sync filteredProductsById with the database, checking if the product is already in the database
    // If it is, then we don't need to add it again
    // If it isn't, then we need to add it to the database
    if (sessionData && wishlist.data) {
      const serverProductIds = wishlist.data.map((item) => item.productId);
      const filteredProductIds = filteredProductsById.map(
        (product) => product._id
      );

      const newProductIds = filteredProductIds.filter(
        (id) => !serverProductIds.includes(id)
      );

      if (newProductIds.length > 0) {
        newProductIds.forEach((id) => {
          syncItems.mutate(id);
        });
      }
    }
    


    setFilteredProducts(filteredProductsById);
  }, [sessionData, wishlist.data]);

  const handleRemoveProduct = (productId: string) => {
    setFilteredProducts(
      filteredProducts?.filter((product) => product._id !== productId)
    );
  };

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
                  {filteredProducts?.map((product) => (
                    <WishlistTable
                      product={product}
                      key={product._id}
                      handleRemoveProduct={handleRemoveProduct}
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
