import Head from "next/head";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>Pet Store</title>
        <meta name="description" content="Pet Food from the Future" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col justify-start bg-neutral-900">
        <header>
          <Navbar />
        </header>
        <main>{children}</main>
        <footer className="mt-auto">
          <Footer />
        </footer>
      </div>
    </>
  );
}
