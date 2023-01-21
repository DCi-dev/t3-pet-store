import { ShopProvider } from "@/context/ShopContext";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Toaster } from "react-hot-toast";

import { api } from "../utils/api";

import { Layout } from "@/components";
import type { Banner } from "@/types/banner";
import type { ProductType } from "@/types/product";
import "../styles/globals.css";

const MyApp: AppType<{
  session: Session | null;
  products: ProductType[];
  banner: Banner;
}> = ({ Component, pageProps: { session, ...pageProps } }) => {
  return (
    <SessionProvider session={session}>
      <ShopProvider>
        <Layout>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </Layout>
      </ShopProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
