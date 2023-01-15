import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { UseNextSanityImageProps } from "next-sanity-image";
import { useNextSanityImage } from "next-sanity-image";
import Image from "next/image";

const CartItem = ({ product }: { product: ProductType }) => {
  // Images
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0]
  );
  return (
    <li key={product._id} className="flex py-6 sm:py-10">
      <div className="flex-shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-md sm:h-48 sm:w-48">
          <Image
            {...productImageProps}
            style={{ width: "100%", height: "100%" }} // layout="responsive" prior to Next 13.0.0
            alt={product.name}
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div>
            <div className="flex justify-between">
              <h3 className="text-md">
                <a
                  href={product.slug.current}
                  className="font-medium text-neutral-100 hover:text-neutral-300"
                >
                  {product.name}
                </a>
              </h3>
            </div>
            <div className="mt-1 flex text-sm">
              {/* <p className="text-neutral-500">{product.color}</p> */}
              {/* {product.sizeOptions ? (
                <p className="ml-4 border-l border-neutral-200 pl-4 text-neutral-500">
                  {product.sizeOptions}
                </p>
              ) : null} */}
            </div>
            <p className="mt-1 text-sm font-medium text-neutral-900">
              {/* {product.price} */}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 sm:pr-9 ">
            <label htmlFor={`quantity-${product._id}`} className="sr-only">
              Quantity, {product.name}
            </label>
            <select
              id={`quantity-${product._id}`}
              name={`quantity-${product._id}`}
              className="max-w-full rounded-md border border-neutral-700 bg-neutral-700 py-1.5 text-left text-base font-medium leading-5 text-neutral-100 shadow-sm focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 sm:text-sm"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
            </select>

            <div className="absolute top-0 right-0">
              <button
                type="button"
                className="-m-2 inline-flex p-2 text-neutral-400 hover:text-neutral-500"
              >
                <span className="sr-only">Remove</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
