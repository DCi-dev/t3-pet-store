// Type for banner data from Sanity CMS
// the banner is used on the homepage hero section
export type Banner = {
  image: {
    hotspot: boolean;
  };
  buttonText: string;
  product: string;
  desc: string;
  smallText: string;
  midText: string;
  largeText1: string;
  largeText2: string;
  discount: string;
  saleTime: string;
};
