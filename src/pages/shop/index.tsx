import { ProductCard } from "@/components";
import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { type ProductType } from "@/types/product";
import { Dialog, Disclosure, Transition } from "@headlessui/react";

import {
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

import { client } from "@lib/client";
import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const filters = [
  {
    id: "pet",
    name: "Pet",
    options: [
      { value: "dog", label: "Dog" },
      { value: "cat", label: "Cat" },
    ],
  },
];

const Shop: NextPage = ({
  products,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState<
    string[]
  >([]);

  const { data: sessionData } = useSession();
  const { syncWishlist } = useShopContext() as ShopContextProps;

  useEffect(() => {
    syncWishlist();
  }, [sessionData?.user]);

  // Add event handler to update the selected category options state variable when the input is changed
  const handleCategoryOptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    if (event.target.checked) {
      setSelectedCategoryOptions((prevOptions) => [...prevOptions, value]);
    } else {
      setSelectedCategoryOptions((prevOptions) =>
        prevOptions.filter((option) => option !== value)
      );
    }
  };

  // Use the selected category options to filter the list of products
  const filteredProducts = products.filter((product: ProductType) => {
    return (
      !selectedCategoryOptions.length ||
      selectedCategoryOptions.includes(product.category)
    );
  });

  return (
    <>
      <div className="bg-neutral-800">
        {/* Mobile filter dialog */}
        <Transition.Root show={mobileFiltersOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setMobileFiltersOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-neutral-900">
                      Filters
                    </h2>
                    <button
                      type="button"
                      className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-neutral-400 hover:text-neutral-500"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Filters */}
                  <form className="mt-4">
                    {filters.map((section) => (
                      <Disclosure
                        as="div"
                        key={section.name}
                        className="border-t border-neutral-200 pb-4 pt-4"
                      >
                        {({ open }) => (
                          <fieldset>
                            <legend className="w-full px-2">
                              <Disclosure.Button className="flex w-full items-center justify-between p-2 text-neutral-400 hover:text-neutral-500">
                                <span className="text-sm font-medium text-neutral-900">
                                  {section.name}
                                </span>
                                <span className="ml-6 flex h-7 items-center">
                                  <ChevronDownIcon
                                    className={classNames(
                                      open ? "-rotate-180" : "rotate-0",
                                      "h-5 w-5 transform"
                                    )}
                                    aria-hidden="true"
                                  />
                                </span>
                              </Disclosure.Button>
                            </legend>
                            <Disclosure.Panel className="px-4 pb-2 pt-4">
                              <div className="space-y-6">
                                {section.options.map((option, optionIdx) => (
                                  <div
                                    key={option.value}
                                    className="flex items-center"
                                  >
                                    <input
                                      id={`${section.id}-${optionIdx}-mobile`}
                                      name={`${section.id}[]`}
                                      defaultValue={option.value}
                                      onChange={handleCategoryOptionChange}
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500"
                                    />
                                    <label
                                      htmlFor={`${section.id}-${optionIdx}-mobile`}
                                      className="ml-3 text-sm text-neutral-500"
                                    >
                                      {option.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </Disclosure.Panel>
                          </fieldset>
                        )}
                      </Disclosure>
                    ))}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <main className="mx-auto max-w-2xl px-4 lg:max-w-7xl lg:px-8">
          <div className="border-b border-neutral-200 pb-10 pt-24">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-100">
              New Arrivals
            </h1>
            <p className="mt-4 text-base text-neutral-300">
              Checkout out our latest products specially formulated with the
              most advanced and cutting-edge ingredients to provide your furry
              friend with all the nutrients they need to thrive.
            </p>
          </div>

          <div className="pb-24 pt-12 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
            <aside>
              <h2 className="sr-only">Filters</h2>

              <button
                type="button"
                className="inline-flex items-center lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="text-sm font-medium text-neutral-700">
                  Filters
                </span>
                <PlusIcon
                  className="ml-1 h-5 w-5 flex-shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
              </button>

              <div className="hidden lg:block">
                <form className="space-y-10 divide-y divide-neutral-600">
                  {filters.map((section, sectionIdx) => (
                    <div
                      key={section.name}
                      className={sectionIdx === 0 ? undefined : "pt-10"}
                    >
                      <fieldset>
                        <legend className="text-md block font-medium text-neutral-100">
                          {section.name}
                        </legend>
                        <div className="space-y-3 pt-6">
                          {section.options.map((option, optionIdx) => (
                            <div
                              key={option.value}
                              className="flex items-center"
                            >
                              <input
                                id={`${section.id}-${optionIdx}`}
                                name={`${section.id}[]`}
                                defaultValue={option.value}
                                type="checkbox"
                                onChange={handleCategoryOptionChange}
                                className="h-4 w-4 rounded border-neutral-300 text-yellow-400 focus:ring-yellow-500"
                              />
                              <label
                                htmlFor={`${section.id}-${optionIdx}`}
                                className="ml-3 text-sm text-neutral-300"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  ))}
                </form>
              </div>
            </aside>

            <section
              aria-labelledby="product-heading"
              className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3"
            >
              <h2 id="product-heading" className="sr-only">
                Products
              </h2>

              <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 xl:grid-cols-3">
                {filteredProducts.map((product: ProductType) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const query = '*[_type == "product"]';
  const products = await client.fetch(query);

  return {
    props: { products },
  };
};

export default Shop;
