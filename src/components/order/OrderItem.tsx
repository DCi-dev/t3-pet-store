import { env } from "@/env/client.mjs";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

interface ChildProps {
  productName?: string;
  quantity?: number;
  price?: number;
}

const OrderItem = ({ productName, quantity, price }: ChildProps) => {
  const fetchOrderItem = async () => {
    const input = encodeURIComponent(
      `*[_type == "product" && name == "${productName}" ]`
    );
    const res = await fetch(
      `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET}?query=${input}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.NEXT_PUBLIC_SANITY_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return res.json();
  };

  const { data, isLoading, isSuccess } = useQuery({
    queryKey: ["orderItems", productName],
    queryFn: fetchOrderItem,
  });

  if (isLoading) return <div></div>;

  if (isSuccess) {
    const image = data.result[0].image[0].asset._ref;
    const newImage = image
      .replace(
        "image-",
        `https://cdn.sanity.io/images/${env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${env.NEXT_PUBLIC_SANITY_DATASET}/`
      )
      .replace("-jpg", ".jpg");
    return (
      <li key={data.result[0]._id} className="flex space-x-6 py-6">
        {/* <Image
          {...productImageProps}
          alt={data.result[0].name}
          className="h-24 w-24 flex-none rounded-md bg-neutral-100 object-cover object-center"
        /> */}

        <Image
          src={newImage}
          width={100}
          height={100}
          alt={data.result[0].name}
          className="h-24 w-24 flex-none rounded-md bg-neutral-100 object-cover object-center"
        />
        <div className="flex-auto space-y-1">
          <h3 className="text-neutral-100">
            <Link href={data.result[0].slug.current}>
              {data.result[0].name}
            </Link>
          </h3>
          <p className="flex-none font-medium text-neutral-200">
            Quantity: {quantity}
          </p>
        </div>
        <p className="flex-none font-medium text-neutral-100">${price}</p>
      </li>
    );
  }
};

export default OrderItem;
