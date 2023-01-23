import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import type { UseNextSanityImageProps } from "next-sanity-image";
import { useNextSanityImage } from "next-sanity-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ChildProps {
  product: ProductType;
}

interface selectedData {
  productId: string;
  sizeOption: {
    size: string;
    price: number;
    _key: string;
  };
  flavor: string;
  quantity: number;
}

const OrderItem: React.FC<ChildProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedFlavor, setSelectedFlavor] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<number>(0);

  useEffect(() => {
    // Get order from local storage
    const order = JSON.parse(localStorage.getItem("order") as string);
    // Get selected selected size and selected flavor from order
    const selectedData = order.filter(
      (item: selectedData) => item.productId === product._id
    );
    // Set selected size and selected flavor
    setSelectedSize(selectedData[0].sizeOption.size);
    setSelectedPrice(
      selectedData[0].sizeOption.price * selectedData[0].quantity
    );
    setSelectedFlavor(selectedData[0].flavor);
  }, []);

  // Images
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0]
  );

  return (
    <li key={product._id} className="flex space-x-6 py-6">
      <Image
        {...productImageProps}
        alt={product.name}
        className="h-24 w-24 flex-none rounded-md bg-neutral-100 object-cover object-center"
      />
      <div className="flex-auto space-y-1">
        <h3 className="text-neutral-100">
          <Link href={product.slug.current}>{product.name}</Link>
        </h3>
        <p className="text-neutral-200">{selectedSize}</p>
        <p className="text-neutral-200">{selectedFlavor}</p>
      </div>
      <p className="flex-none font-medium text-neutral-100">${selectedPrice}</p>
    </li>
  );
};

export default OrderItem;
