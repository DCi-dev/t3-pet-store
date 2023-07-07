// TODO: Replace the hardcoded data with the data from an API call
// or from the CMS (Sanity), or atleast using a config file

import Image from "next/image";
import Link from "next/link";

const Promo: React.FC = () => {
  return (
    <div className="bg-neutral-900">
      <div className="overflow-hidden pt-32 sm:pt-14">
        <div className="bg-yellow-400">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative pb-16 pt-48 sm:pb-24">
              <div>
                <h2
                  id="sale-heading"
                  className="text-4xl font-bold tracking-tight text-neutral-900 md:text-5xl"
                >
                  New Stock.
                  <br />
                  New Taste. New Formula
                </h2>
                <div className="mt-6 text-base">
                  <Link href="/shop" className="font-semibold text-neutral-900">
                    Shop Now
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </div>

              <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform sm:top-6 sm:translate-x-0">
                <div className="ml-24 flex min-w-max space-x-6 sm:ml-3 lg:space-x-8">
                  <div className="flex space-x-6 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-cat.jpg"
                        alt="cat"
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-cat-treats.jpg"
                        alt="cat treats"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:-mt-20 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-dog-treats.jpg"
                        alt="dog treats"
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-cat-eating.jpg"
                        alt="cat eating"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-6 sm:flex-col sm:space-x-0 sm:space-y-6 lg:space-y-8">
                    <div className="flex-shrink-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-cat-treats.jpg"
                        alt=""
                      />
                    </div>

                    <div className="mt-6 flex-shrink-0 sm:mt-0">
                      <Image
                        className="h-64 w-64 rounded-lg object-cover md:h-72 md:w-72"
                        width={300}
                        height={300}
                        src="/assets/promo-dog-treats.jpg"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promo;
