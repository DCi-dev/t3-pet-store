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
import { Fragment, useState } from "react";

const ProductCard = ({ product }: { product: ProductType }) => {
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0]
  );

  const wishlistClass = `h-5 w-5 fill-current ${
    product.inWishlist ? "text-red-500" : "text-gray-500"
  }`;

  const [selectedSize, setSelectedSize] = useState(product.sizeOptions[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavor[0]);

  return (
    <>
      {/* Container */}
      <div className="flex flex-col rounded-3xl  bg-neutral-900 p-4 shadow-lg shadow-neutral-500">
        {/*  Image */}
        <div className="relative">
          <Image
            {...productImageProps}
            style={{ width: "100%", height: "auto" }} // layout="responsive" prior to Next 13.0.0
            sizes="(max-width: 800px) 100vw, 800px"
            alt={product.name}
            className="rounded-3xl"
          />
          {/* Wishlist */}
          <button className="absolute top-5 right-5 rounded-full bg-white p-3">
            <HeartIcon className={wishlistClass} />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <span className="text-lg capitalize text-neutral-300">
            {product.category}
          </span>
          <h2 className="text-2xl font-bold text-white">{product.name}</h2>
          {/* Types */}
          <div className="flex justify-around gap-4">
            {/* Size */}

            <div className="flex w-1/2 flex-col">
              <span className="text-lg font-bold text-white">Size</span>
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
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base capitalize shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
              <span className="text-lg font-bold text-white">Flavor</span>
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
                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base capitalize shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
          {/* Price */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="mr-3 inline-flex items-center justify-center rounded-lg bg-yellow-400 px-5 py-3 text-center text-base font-bold text-gray-900 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300"
            >
              Add to cart
            </button>
            <span className="text-2xl font-bold text-white">
              $
              {
                product.sizeOptions.find(
                  (option) => option.size === selectedSize?.size
                )?.price
              }
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
