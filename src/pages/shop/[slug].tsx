// This is the product page

import { Incentives, ProductCard } from "@/components";
import ProductFeatures from "@/components/ProductFeatures";
import Promo from "@/components/common/Promo";
import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { client } from "@/lib/client";
import type { ProductPageProps, SizeOption } from "@/types/product";
import { type ProductType } from "@/types/product";
import { Disclosure, RadioGroup } from "@headlessui/react";
import {
  ChevronUpIcon,
  CurrencyDollarIcon,
  GlobeAmericasIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import {
  useNextSanityImage,
  type UseNextSanityImageProps,
} from "next-sanity-image";
import Image from "next/image";
import { useEffect, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// TODO: Replace hardcoded policies with data from Sanity CMS or a config file
const policies = [
  {
    name: "International delivery",
    icon: GlobeAmericasIcon,
    description: "Get your order in 2 years",
  },
  {
    name: "Loyalty rewards",
    icon: CurrencyDollarIcon,
    description: "Don't look at other stores",
  },
];

const ProductPage: NextPage<ProductPageProps> = ({ product, products }) => {
  // Get user session data
  const { data: sessionData } = useSession();

  // Shop context functions
  const { syncWishlist, handleAddToCart, addToWishlist, removeFromWishlist } =
    useShopContext() as ShopContextProps;

  // Check if the product is in the wishlist
  const [isInWishlist, setIsInWishlist] = useState<boolean>(false);

  const isInWishlistHandler = (product: ProductType) => {
    const productListStorage = localStorage.getItem("productList");
    if (productListStorage) {
      const productArray = JSON.parse(productListStorage);
      const isInWishlist = productArray.includes(product._id);
      setIsInWishlist(isInWishlist);
    }
  };

  // If it is in the wishlist, set the wishlist icon to red
  const wishlistClass = `h-12 w-12 fill-current ${
    isInWishlist ? "text-red-500" : "text-neutral-500"
  }`;

  useEffect(() => {
    isInWishlistHandler(product);
  }, [product]);

  // Wishlist button handler function (add or remove from wishlist)
  // It also updates the wishlist icon
  const handleWishButton = (
    event:
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.preventDefault();
    if (isInWishlist) {
      setIsInWishlist(false);
      removeFromWishlist(product._id);
    } else {
      setIsInWishlist(true);
      addToWishlist(product._id);
    }
  };

  // Product Image
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0] as SanityImageSource,
  );

  // Product Options
  const [selectedSize, setSelectedSize] = useState<SizeOption>(
    product.sizeOptions[0] as SizeOption,
  );
  const [selectedFlavor, setSelectedFlavor] = useState<string>(
    product.flavor[0] as string,
  );

  // Sync wishlist on user login
  useEffect(() => {
    syncWishlist();
  }, [sessionData?.user]);

  return (
    <main className="bg-neutral-800">
      <div className="max-w-2x mx-auto px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:min-h-screen lg:max-w-7xl lg:px-8 lg:pt-16">
        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="flex justify-between">
              <h1 className="text-xl font-medium text-neutral-100">
                {product.name}
              </h1>
              <p className="text-xl font-medium text-neutral-100">
                $
                {
                  product.sizeOptions.find(
                    (option: SizeOption) => option.size === selectedSize?.size,
                  )?.price
                }
              </p>
            </div>
          </div>

          {/* Image gallery */}
          <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
            <h2 className="sr-only">Images</h2>

            <div>
              <Image
                {...productImageProps}
                alt={product.name}
                className="rounded-lg lg:col-span-2 lg:row-span-2 "
              />
            </div>
          </div>

          <div className="mt-8 lg:col-span-5">
            <form>
              {/* Size picker */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-neutral-100">Size</h2>
                </div>

                <RadioGroup
                  value={selectedSize}
                  onChange={setSelectedSize}
                  className="mt-2"
                >
                  <RadioGroup.Label className="sr-only">
                    {" "}
                    Choose a size{" "}
                  </RadioGroup.Label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {product.sizeOptions.map((opt: SizeOption) => (
                      <RadioGroup.Option
                        key={opt._key}
                        value={opt}
                        className={({ active, checked }) =>
                          classNames(
                            "cursor-pointer font-bold focus:outline-none",
                            active
                              ? "ring-2 ring-yellow-500 ring-offset-2"
                              : "",
                            checked
                              ? "border-transparent bg-yellow-400  text-neutral-900 hover:bg-yellow-300"
                              : "border-neutral-200 bg-neutral-700 text-neutral-100 hover:bg-neutral-600",
                            "flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase sm:flex-1",
                          )
                        }
                      >
                        <RadioGroup.Label as="span">
                          {opt.size}
                        </RadioGroup.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Flavor picker */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-neutral-100">
                    Flavor
                  </h2>
                </div>

                <RadioGroup
                  value={selectedFlavor}
                  onChange={setSelectedFlavor}
                  className="mt-2"
                >
                  <RadioGroup.Label className="sr-only">
                    {" "}
                    Choose a flavor{" "}
                  </RadioGroup.Label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {product.flavor.map((opt: string, index: number) => (
                      <RadioGroup.Option
                        key={index}
                        value={opt}
                        className={({ active, checked }) =>
                          classNames(
                            "cursor-pointer font-bold focus:outline-none",
                            active
                              ? "ring-2 ring-yellow-500 ring-offset-2"
                              : "",
                            checked
                              ? "border-transparent bg-yellow-400 font-bold text-neutral-900 hover:bg-yellow-300"
                              : "border-neutral-200 bg-neutral-700 text-neutral-100 hover:bg-neutral-600",
                            "flex items-center justify-center rounded-md border px-4 py-3 text-sm font-medium uppercase sm:flex-1",
                          )
                        }
                      >
                        <RadioGroup.Label as="span">{opt}</RadioGroup.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </form>
            <div className="justify-left flex w-full  items-center gap-8">
              <button
                onClick={() =>
                  handleAddToCart(product, selectedFlavor, selectedSize)
                }
                className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-400 px-8 py-3 text-base font-bold text-neutral-900 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Add to cart
              </button>
              <button
                onClick={handleWishButton}
                className="mt-8 flex items-center justify-center rounded-md  text-base font-bold text-neutral-900 "
              >
                <HeartIcon className={wishlistClass} />
              </button>
            </div>
            {/* Product details */}
            <div className="mt-10">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between rounded-lg bg-neutral-700 px-4 py-2 text-left text-sm font-medium text-neutral-100 hover:bg-neutral-600 focus:outline-none focus-visible:ring focus-visible:ring-neutral-500 focus-visible:ring-opacity-75">
                      <h2 className="text-sm font-medium text-neutral-100">
                        Description
                      </h2>
                      <ChevronUpIcon
                        className={`${
                          open ? "rotate-180 transform" : ""
                        } h-5 w-5 text-neutral-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                      <div
                        className="prose prose-sm mt-4 text-neutral-300"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>

            {/* Policies */}
            <section aria-labelledby="policies-heading" className="mt-10">
              <h2 id="policies-heading" className="sr-only">
                Our Policies
              </h2>

              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {policies.map((policy) => (
                  <div
                    key={policy.name}
                    className="rounded-lg border border-neutral-700 bg-neutral-600 p-6 text-center"
                  >
                    <dt>
                      <policy.icon
                        className="mx-auto h-6 w-6 flex-shrink-0 text-neutral-100"
                        aria-hidden="true"
                      />
                      <span className="mt-4 text-sm font-medium text-neutral-100">
                        {policy.name}
                      </span>
                    </dt>
                    <dd className="mt-1 text-sm text-neutral-200">
                      {policy.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
      <ProductFeatures />
      <section aria-labelledby="related-heading" className="mt-16 sm:mt-24">
        <div className="max-w-2x mx-auto px-4 pb-16 pt-8 sm:px-6 sm:pb-24 lg:max-w-7xl  lg:px-8">
          <h2
            id="related-heading"
            className="text-lg font-medium text-neutral-100"
          >
            Customers also purchased
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((relatedProduct: ProductType) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </section>
      <Incentives />
      <Promo />
    </main>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const query = `*[_type == "product"] {slug { current}}`;
  const products = await client.fetch(query);
  const paths = products.map((product: ProductType) => ({
    params: { slug: product.slug.current },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "product" && slug.current == "${params?.slug}"][0]`;
  const product = await client.fetch(query);
  const productsQuery = `*[_type == "product" && category == "${product?.category}"]`;
  const products = await client.fetch(productsQuery);

  return {
    props: { product, products },
  };
};

export default ProductPage;
