import {
  type GetServerSideProps,
  type InferGetServerSidePropsType,
  type NextPage,
} from "next";
// import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";

import { type ProductType } from "@/types/product";

import { FooterBanner, HeroBanner } from "@/components";

import { client } from "@lib/client";
// import { trpc } from "../utils/trpc";

const Home: NextPage = ({
  products,
  bannerData,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>Pet Store</title>
        <meta name="description" content="Pet Food from the Future" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="">
        <HeroBanner heroBanner={bannerData.length && bannerData[0]} />
        <div className="text-center">
          <h2 className="text-bold text-2xl text-neutral-700">
            Best Selling Products
          </h2>
          <p>Cat food of many variations</p>
        </div>
        <div>
          {products?.map((product: ProductType, index: Key) => (
            <div key={index}>
              <h3>{product.name}</h3>
              <p>Product description</p>
              <button>Add to Cart</button>
            </div>
          ))}
        </div>
        Footer
      </main>
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
