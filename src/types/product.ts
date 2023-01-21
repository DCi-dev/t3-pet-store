export type ProductType = {
  _createdAt: string;
  _id: string;
  _rev: string;
  _type: "product";
  _updatedAt: string;
  category: "dog" | "cat" | string;
  description: string;
  flavor: Array<"chicken" | "beef" | "turkey" | "lamb" | string>;
  image: Array<{
    _key: string;
    _type: "image";
    _upload: {
      createdAt: string;
      file: {
        name: string;
        type: string;
      };
      previewImage: string;
    };
    asset?: {
      _ref: string;
      _type: "reference";
    };
  }>;
  name: string;
  slug: {
    current: string;
    _type: "slug";
  };
  sizeOptions: Array<{
    size: string;
    price: number;
    _key: string;
  }>;
};

export interface sizeOption {
  size: string;
  price: number;
  _key: string;
}

export interface ProductPageProps {
  product: ProductType;
  products: ProductType[];
}
