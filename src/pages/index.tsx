import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
// import { signIn, signOut, useSession } from "next-auth/react";

import {
  FooterBanner,
  HeroBanner,
  Incentives,
  ProductCard,
} from "@/components";

import { client } from "@lib/client";
// import { trpc } from "../utils/trpc";

const Home: NextPage = ({
  products,
  bannerData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const firstFourProducts = products.slice(0, 4);

  return (
    <>
      <div className="">
        <HeroBanner heroBanner={bannerData.length && bannerData[0]} />
        <div className="bg-neutral-800">
          <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-24 sm:px-6 lg:max-w-7xl lg:py-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:mt-5 sm:text-6xl  xl:text-4xl">
              Best Selling Products
            </h2>
          </div>
          <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
            <div className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {firstFourProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
        <Incentives />
        <FooterBanner footerBanner={bannerData.length && bannerData[1]} />
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const query = '*[_type == "product"]';
  const products = await client.fetch(query);

  const bannerQuery = '*[_type == "banner"]';
  const bannerData = await client.fetch(bannerQuery);

  return {
    props: { products, bannerData },
  };
};

export default Home;

// const AuthShowcase: React.FC = () => {
//   const { data: sessionData } = useSession();

//   const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
//     undefined, // no input
//     { enabled: sessionData?.user !== undefined }
//   );

//   return (
//     <div className="flex flex-col items-center justify-center gap-4">
//       <p className="text-center text-2xl text-white">
//         {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
//         {secretMessage && <span> - {secretMessage}</span>}
//       </p>
//       <button
//         className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
//         onClick={sessionData ? () => signOut() : () => signIn()}
//       >
//         {sessionData ? "Sign out" : "Sign in"}
//       </button>
//     </div>
//   );
// };
