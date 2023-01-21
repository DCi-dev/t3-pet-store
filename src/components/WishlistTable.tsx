import { client } from "@/lib/client";
import { type ProductType } from "@/types/product";
import type { UseNextSanityImageProps } from "next-sanity-image";
import { useNextSanityImage } from "next-sanity-image";
import Image from "next/image";
import Link from "next/link";

interface ChildProps {
  removeFromWishlist: (productId: string) => void;
  product: ProductType;
}

const WishlistTable: React.FC<ChildProps> = ({
  removeFromWishlist,
  product,
}) => {
  // Images
  const productImageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    product.image[0]
  );

  return (
    <tr key={product._id}>
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        <div className="flex items-center">
          <div className="h-16 w-16 flex-shrink-0">
            <Image
              {...productImageProps}
              style={{ width: "100%", height: "100%" }} // layout="responsive" prior to Next 13.0.0
              alt={product.name}
              className="object-cover object-center"
            />
          </div>
          <div className="ml-4">
            <Link href={`/shop/${product.slug.current}`}>
              <div className="font-semibold text-neutral-100">
                {product.name}
              </div>
            </Link>
          </div>
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-500">
        <div className="capitalize text-neutral-200">{product.category}</div>
      </td>

      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button
          onClick={() => removeFromWishlist(product._id)}
          className="text-yellow-400 hover:text-yellow-500"
        >
          Remove
          <span className="sr-only">, {product.name}</span>
        </button>
      </td>
    </tr>
  );
};

export default WishlistTable;
