import {
  useNextSanityImage,
  type UseNextSanityImageProps
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
      <section className="bg-black">
        <div className="mx-auto grid max-w-screen-xl gap-4 py-8 px-8 md:grid-cols-12 lg:gap-8 lg:py-16  xl:gap-0">
          <div className="order-2 mr-auto place-self-center md:order-1 md:col-span-5">
            <p className="md:text-md mb-6 max-w-2xl text-sm font-light text-gray-300 lg:mb-8 lg:text-lg">
              {heroBanner.smallText}
            </p>

            <h1 className="mb-4 max-w-2xl text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl xl:text-6xl">
              {heroBanner.largeText1}
            </h1>

            <h3 className="mb-6 max-w-2xl font-light text-gray-300 md:text-lg lg:mb-8 lg:text-xl">
              {heroBanner.midText}
            </h3>

            <Link href={`/${heroBanner.product}`}>
              <button
                type="button"
                className="mr-3 inline-flex items-center justify-center rounded-lg bg-yellow-400 px-5 py-3 text-center text-base font-bold text-gray-900 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300"
              >
                {heroBanner.buttonText}
              </button>
            </Link>
          </div>

          <div className="order-1 md:order-2 md:col-span-7 lg:mt-0 lg:flex">
            <Image
              {...imageProps}
              style={{ width: "100%", height: "auto" }} // layout="responsive" prior to Next 13.0.0
              sizes="(max-width: 800px) 100vw, 800px"
              alt={heroBanner.product}
              priority={true}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroBanner;
