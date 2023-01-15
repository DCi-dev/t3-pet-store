import {
  useNextSanityImage,
  type UseNextSanityImageProps,
} from "next-sanity-image";

import { Listbox, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronUpDownIcon,
  HeartIcon,
} from "@heroicons/react/20/solid";

import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

import { api } from "@utils/api";
import { useSession } from "next-auth/react";

const ProductCard = ({ product }: { product: ProductType }) => {
  // Images
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0]
  );

  // Product options
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavor[0]);

  const [inInWishlist, setInInWishlist] = useState<boolean>(false);

  useEffect(() => {
    const productListStorage = localStorage.getItem("productList");
    if (productListStorage) {
      const productArray = JSON.parse(productListStorage);
      const isInWishlist = productArray.includes(product._id);
      setInInWishlist(isInWishlist);
    }
  }, [product._id]);

  const wishlistClass = `h-5 w-5 fill-current ${
    inInWishlist ? "text-red-500" : "text-neutral-500"
  }`;
  const { data: sessionData } = useSession();

  function addItemToLocalStorage(productId: string) {
    const productIds = JSON.parse(localStorage.getItem("productList") || "[]");
    if (!productIds.includes(productId)) {
      productIds.push(productId);
      localStorage.setItem("productList", JSON.stringify(productIds));
    }
  }

  const wishlist = api.wishlist.getItems.useQuery();
  const addProduct = api.wishlist.addItem.useMutation();
  const removeProduct = api.wishlist.removeItem.useMutation();

  const handleAddToWishlist = async (product: ProductType) => {
    // check if the user is authenticated
    if (!sessionData?.user) {
      // if not, add the product to the wishlist on the client side
      addItemToLocalStorage(product._id);
      return;
    } else {
      // if the user is authenticated, send the product id to the server
      // using TRPC call
      addItemToLocalStorage(product._id);
      // Check if the product id is already in the database if not add it

      if (!wishlist.data) {
        addProduct.mutate(product);
      } else {
        const productIds = wishlist.data.map((product) => product.productId);
        if (!productIds.includes(product._id)) {
          // if the productIds array does not include the product id, add it
          addProduct.mutate(product);
        }
      }
    }
  };

  function removeItemFromStorage(productId: string) {
    const productIds = JSON.parse(localStorage.getItem("productList") || "[]");
    const updatedIds = productIds.filter((id: string) => id !== productId);
    localStorage.setItem("productList", JSON.stringify(updatedIds));
  }

  const handleRemoveFromWishlist = async (product: ProductType) => {
    // check if the user is authenticated
    if (!sessionData?.user) {
      // if not, remove the product from the wishlist on the client side
      removeItemFromStorage(product._id);
      return;
    } else {
      // if the user is authenticated, send the product id to the server
      // using TRPC call
      removeProduct.mutate(product);
      removeItemFromStorage(product._id);
    }
  };

  const handleWishButton = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    if (inInWishlist) {
      setInInWishlist(false);
      handleRemoveFromWishlist(product);
    } else {
      setInInWishlist(true);
      handleAddToWishlist(product);
    }
  };

  return (
    <>
      <div key={product._id}>
        <div className="relative">
          <button
            className="absolute top-3 right-3 z-10 rounded-full bg-white p-2"
            onClick={handleWishButton}
          >
            <HeartIcon className={wishlistClass} />
          </button>

          <div className="relative h-72 w-full overflow-hidden rounded-lg">
            <Image
              {...productImageProps}
              style={{ width: "100%", height: "100%" }} // layout="responsive" prior to Next 13.0.0
              alt={product.name}
              className="object-cover object-center"
            />
          </div>

          <div className="relative mt-4">
            <Link href={`/shop/${product.slug.current}`}>
              <h3 className="mb-2 text-lg font-medium text-neutral-100">
                {product.name}
              </h3>
            </Link>
            {/* Types */}
            <div className="flex justify-around gap-4">
              {/* Size */}

              <div className="flex w-1/2 flex-col">
                <span className="text-md font-medium text-neutral-200">
                  Size
                </span>
                <Listbox value={selectedSize} onChange={setSelectedSize}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate capitalize">
                        {selectedSize?.size}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-neutral-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base capitalize shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {product.sizeOptions.map((option, index: number) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-yellow-300 text-yellow-900"
                                  : "text-neutral-900"
                              }`
                            }
                            value={option}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {option.size}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
              {/* Flavor */}
              <div className="flex w-1/2 flex-col">
                <span className="text-md font-medium text-white">Flavor</span>
                <Listbox value={selectedFlavor} onChange={setSelectedFlavor}>
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                      <span className="block truncate capitalize">
                        {selectedFlavor}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                          className="h-5 w-5 text-neutral-400"
                          aria-hidden="true"
                        />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-40 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base capitalize shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {product.flavor.map((option, index: number) => (
                          <Listbox.Option
                            key={index}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active
                                  ? "bg-yellow-300 text-yellow-900"
                                  : "text-neutral-900"
                              }`
                            }
                            value={option}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={`block truncate ${
                                    selected ? "font-medium" : "font-normal"
                                  }`}
                                >
                                  {option}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                                    <CheckIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>
            ;
          </div>
          <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50"
            />
            <p className="relative text-lg font-semibold text-white">
              $
              {
                product.sizeOptions.find(
                  (option) => option.size === selectedSize?.size
                )?.price
              }
            </p>
          </div>
        </div>

        <div className="mt-1">
          <a
            href=""
            className="text-md relative flex items-center justify-center rounded-md border border-transparent bg-yellow-500 py-2 px-8 font-medium text-neutral-900 hover:bg-yellow-400"
          >
            Add to bag<span className="sr-only">, {product.name}</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
