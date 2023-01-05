export type ProductType = {
  image: Array<{
    hotspot: boolean;
  }>;
  name: string;
  category: "cat" | "dog";
  slug: {
    current: string;
  };
  description: string;
  price: number;
  size: Array<"small" | "medium" | "large">;
  flavor: Array<"chicken" | "beef" | "salmon" | "turkey" | "lamb">;
};
