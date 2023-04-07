import Image from "next/image";

const incentives = [
  {
    name: "Free Shipping",
    description: "It's not really free, but we'll pretend it is.",
    imageSrc: "/assets/free-shipping.svg",
  },
  {
    name: "24/7 Customer Support",
    description:
      "Our AI chat widget is powered by if/else statements and will probably annoy you. No human interraction guaranteed.",
    imageSrc: "/assets/customer-support.svg",
  },
  {
    name: "Fast Shopping Cart",
    description: "It's fast, but does it really matter?",
    imageSrc: "/assets/fast-shopping-cart.svg",
  },
  {
    name: "Gift Cards",
    description:
      "Buy them for your friends, especially if they don't like your food. It's basically free money for us.",
    imageSrc: "/assets/gift-cards.svg",
  },
];

export default function Incentives() {
  return (
    <div className="bg-neutral-900">
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {incentives.map((incentive) => (
            <div key={incentive.name}>
              <Image
                src={incentive.imageSrc}
                alt={incentive.name}
                height={64}
                width={64}
                className="h-24 w-auto"
              />
              <h3 className="mt-6 text-lg font-medium text-neutral-100">
                {incentive.name}
              </h3>
              <p className="text-md mt-2 text-neutral-300">
                {incentive.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
