import { api } from "@/utils/api";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface ChildProps {
  quantity?: number;
  price?: number;
  productId?: string;
  date?: string;
}

const OrderItem: React.FC<ChildProps> = ({
  quantity,
  price,
  productId,
  date,
}) => {
  const { data: product } = api.stripe.getProductMetadata.useQuery(
    productId as string
  );

  return (
    <li key={product?.id} className="bg-neutral-600 p-4 sm:p-6">
      <div className="flex items-center sm:items-start">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 sm:h-40 sm:w-40">
          <Image
            src={product?.images[0] as string}
            alt={product?.name as string}
            width={50}
            height={50}
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="ml-6 flex-1 text-sm">
          <div className="font-medium text-neutral-100 sm:flex sm:justify-between">
            <h5>{product?.name}</h5>
            <p className="mt-2 sm:mt-0">${price}</p>
          </div>
          <p className="hidden capitalize text-neutral-200 sm:mt-2 sm:block">
            {product?.metadata.flavor} - {product?.metadata.size}
          </p>
          <p className="hidden capitalize text-neutral-200 sm:mt-2 sm:block">
            Quantity: {quantity}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:flex sm:justify-between">
        <div className="flex items-center">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
          <p className="ml-2 text-sm font-medium text-neutral-200">
            Paid on <time dateTime={date}>{date}</time>
          </p>
        </div>

        <div className="mt-6 flex items-center space-x-4 divide-x divide-neutral-800 border-t border-neutral-800 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
          <div className="flex flex-1 justify-center">
            <a
              href={`/shop/${product?.metadata?.slug}`}
              className="whitespace-nowrap text-yellow-400 hover:text-yellow-500"
            >
              View product
            </a>
          </div>
          <div className="flex flex-1 justify-center pl-4">
            <a
              href="#"
              className="whitespace-nowrap text-yellow-400 hover:text-yellow-500"
            >
              Buy again
            </a>
          </div>
        </div>
      </div>
    </li>
  );
};

export default OrderItem;
