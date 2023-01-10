import { ProductCard } from "@/components";
import { client } from "@/lib/client";
import type { ProductType, sizeOption } from "@/types/product";
import { Disclosure, RadioGroup } from "@headlessui/react";
import {
  ChevronUpIcon,
  CurrencyDollarIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import { useNextSanityImage } from "next-sanity-image";
import Image from "next/image";
import { useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

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

const ProductPage: NextPage = ({
  product,
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(product.flavor[0]);

  const productImageProps = useNextSanityImage(client, product.image[0]);

  return (
    <main className="bg-neutral-800">
      <div className="mx-auto max-w-2xl   px-4 pt-8 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
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
                    (option: sizeOption) => option.size === selectedSize?.size
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
                    {product.sizeOptions.map((opt: sizeOption) => (
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
                            "flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase sm:flex-1"
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
                            "flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase sm:flex-1"
                          )
                        }
                      >
                        <RadioGroup.Label as="span">{opt}</RadioGroup.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <button
                type="submit"
                className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-yellow-400 py-3 px-8 text-base font-bold text-neutral-900 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Add to cart
              </button>
            </form>

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
                    <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
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
        <section aria-labelledby="related-heading" className="mt-16 sm:mt-24">
          <h2
            id="related-heading"
            className="text-lg font-medium text-neutral-100"
          >
            Customers also purchased
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {products.map((relatedProduct: ProductType) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </section>
      </div>
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
