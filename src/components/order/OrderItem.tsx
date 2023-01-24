import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";

interface ChildProps {
  quantity?: number;
  price?: number;
  productId?: string;
}

const OrderItem: React.FC<ChildProps> = ({ quantity, price, productId }) => {
  const { data: productData, isLoading } =
    api.stripe.getProductMetadata.useQuery(productId as string);

  // console.log(productData);

  if (isLoading) return <div></div>;

  return (
    <li key={productData?.id} className="flex space-x-6 py-6">
      <Image
        src={productData?.images[0] as string}
        width={100}
        height={100}
        alt={productData?.name as string}
        className="h-24 w-24 flex-none rounded-md bg-neutral-100 object-cover object-center"
      />
      <div className="flex-auto space-y-1">
        <h3 className="text-neutral-100">
          <Link href={`/shop/${productData?.metadata?.slug}`}>
            {productData?.name}
          </Link>
        </h3>
        <p className="flex-none font-medium text-neutral-200">
          Flavor: {productData?.metadata?.flavor}
        </p>
        <p className="flex-none font-medium text-neutral-200">
          Size: {productData?.metadata?.size}
        </p>
        <p className="flex-none font-medium text-neutral-200">
          Quantity: {quantity}
        </p>
      </div>
      <p className="flex-none font-medium text-neutral-100">${price}</p>
    </li>
  );
};

export default OrderItem;
