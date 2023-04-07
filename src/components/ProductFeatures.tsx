import Image from "next/image";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const features = [
  {
    name: "Nano-Nutrient Formula",
    description: `This innovative pet food is made with microscopic nutrients that are easily absorbed by your pet's body, providing optimal nutrition and promoting overall health.`,
    imageSrc: "/assets/promo-cat-eating.jpg",
    imageAlt:
      "White canvas laptop sleeve with neutral felt interior, silver zipper, and tan leather zipper pull.",
  },
  {
    name: "Synthetic Meat Treats",
    description: `These treats are made with lab-grown meat, providing all the protein and flavor of traditional meat treats without the environmental impact of animal agriculture.`,
    imageSrc: "/assets/promo-dog-treats.jpg",
    imageAlt: "Detail of zipper pull with tan leather and silver rivet.",
  },
];

const ProductFeatures: React.FC = () => {
  return (
    <div className="bg-neutral-900">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
            Protect your loved ones
          </h2>
          <p className="mt-4 text-neutral-300">
            We understand the importance of protecting your loved ones,
            especially your furry companions. That`&apos;`s why we have
            developed a line of pet food products that not only provide optimal
            nutrition, but also offer added benefits to promote the overall
            health and well-being of your pets.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {features.map((feature, featureIdx) => (
            <div
              key={feature.name}
              className="flex flex-col-reverse lg:grid lg:grid-cols-12 lg:items-center lg:gap-x-8"
            >
              <div
                className={classNames(
                  featureIdx % 2 === 0
                    ? "lg:col-start-1"
                    : "lg:col-start-8 xl:col-start-9",
                  "mt-6 lg:col-span-5 lg:row-start-1 lg:mt-0 xl:col-span-4"
                )}
              >
                <h3 className="text-lg font-medium text-neutral-100">
                  {feature.name}
                </h3>
                <p className="mt-2 text-sm text-neutral-300">
                  {feature.description}
                </p>
              </div>
              <div
                className={classNames(
                  featureIdx % 2 === 0
                    ? "lg:col-start-6 xl:col-start-5"
                    : "lg:col-start-1",
                  "flex-auto lg:col-span-7 lg:row-start-1 xl:col-span-8"
                )}
              >
                <div className="aspect-h-2 aspect-w-5 overflow-hidden rounded-lg bg-neutral-800">
                  <Image
                    width={1000}
                    height={500}
                    src={feature.imageSrc}
                    alt={feature.imageAlt}
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFeatures;
