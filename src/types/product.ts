export type ProductType = {
  image: Array<{
    hotspot: boolean;
    _key: string;
    _type: "image";
  }>;
  name: string;
  category: "cat" | "dog";
  slug: {
    current: string;
    _type: "slug";
  };
  description: string;
  sizeOptions: Array<sizeOption>;
  flavor: Array<"chicken" | "beef" | "salmon" | "turkey" | "lamb">;
  _id: string;
  _rev: string;
  _type: "product";
  _updatedAt: string;
};

export type sizeOption = {
  size: number;
  price: number;
  _key: string;
};
