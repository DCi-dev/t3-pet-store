// This component is used in CartList to display each item in the cart as a table row
import type { ShopContextProps } from "@/context/ShopContext";
import { useShopContext } from "@/context/ShopContext";
import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import { XMarkIcon } from "@heroicons/react/24/outline";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import {
  useNextSanityImage,
  type UseNextSanityImageProps,
} from "next-sanity-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChildProps {
  product: ProductType;
}

interface SelectedData {
  productId: string;
  sizeOption: {
    size: string;
    price: number;
    _key: string;
  };
  flavor: string;
  quantity: number;
}

const CartItem: React.FC<ChildProps> = ({ product }) => {
  // Get the handleRemoveFromCart and handleQuantityChange functions from the ShopContext
  const { handleRemoveFromCart, handleQuantityChange } =
    useShopContext() as ShopContextProps;

  // Set the selected data and quantity from the cart in state
  const [selectedData, setSelectedData] = useState<SelectedData>();
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  useEffect(() => {
    const storageCart = JSON.parse(localStorage.getItem("cart") ?? "[]"); // Put storageCartWithImages in local storage under Order key
    localStorage.setItem("order", JSON.stringify(storageCart));

    const selectedData = storageCart.find(
      (item: SelectedData) => item.productId === product._id,
    );
    setSelectedData(selectedData);
    setSelectedQuantity(selectedData?.quantity || 1);
  }, [product._id, handleQuantityChange]);

  // Images for the products are stored in Sanity, so we need to use the useNextSanityImage hook to get the image URL
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0] as SanityImageSource,
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
              <h3 className="text-lg">
                <Link
                  href={`/shop/${product.slug.current}`}
                  className="font-medium text-neutral-100 hover:text-neutral-300"
                >
                  {product.name}
                </Link>
              </h3>
            </div>
            <div className="text-md mt-1 flex capitalize">
              <p className="text-neutral-300 ">
                {selectedData?.flavor} - {selectedData?.sizeOption.size}
              </p>
            </div>
            <p className="text-md mt-1 font-medium text-neutral-100">
              ${selectedData?.sizeOption.price}
            </p>
          </div>

          <div className="mt-4 sm:mt-0 sm:pr-9 ">
            <label htmlFor={`quantity-${product._id}`} className="sr-only">
              Quantity, {product.name}
            </label>
            {/* Give the user the posibility to modify the quantity for each product */}
            <select
              onChange={(e) => {
                handleQuantityChange(product._id, Number(e.target.value));
                setSelectedQuantity(Number(e.target.value));
              }}
              value={selectedQuantity}
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

            <div className="absolute right-0 top-0">
              <button
                onClick={() => handleRemoveFromCart(product._id)}
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
