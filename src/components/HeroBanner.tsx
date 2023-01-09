import {
  useNextSanityImage,
  type UseNextSanityImageProps,
} from "next-sanity-image";
import Link from "next/link";

import { client } from "@/lib/client";
import { type Banner } from "@/types/banner";
import Image from "next/image";

const HeroBanner = ({ heroBanner }: { heroBanner: Banner }) => {
  const imageProps: UseNextSanityImageProps = useNextSanityImage(
    client,
    heroBanner.image
  );

  return (
    <>
      <div className="bg-neutral-900 pt-10 sm:pt-16 lg:overflow-hidden lg:pt-8 lg:pb-14">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:flex lg:items-center lg:px-0 lg:text-left">
              <div className="lg:py-24">
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                  <span className="block">{heroBanner.largeText1}</span>
                  <span className="block text-yellow-400">
                    {heroBanner.largeText2}
                  </span>
                </h1>
                <p className="mt-3 text-base text-neutral-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  {heroBanner.midText}
                </p>
                <div className="mt-10 max-w-fit sm:mt-12">
                  <Link
                    className="mt-3 sm:mt-0 sm:ml-3"
                    href={`/shop/${heroBanner.product}`}
                  >
                    <button
                      type="submit"
                      className="block w-full rounded-md bg-yellow-400 py-3 px-4 font-bold text-neutral-900 shadow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 focus:ring-offset-neutral-900"
                    >
                      {heroBanner.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 lg:relative lg:m-0">
              <div className="mx-auto max-w-md px-4 py-4 sm:max-w-2xl sm:px-6 lg:h-full lg:max-w-none lg:px-0 lg:pt-16">
                <Image
                  {...imageProps}
                  style={{ width: "100%", height: "auto" }} // layout="responsive" prior to Next 13.0.0
                  alt={heroBanner.product}
                  priority={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroBanner;
