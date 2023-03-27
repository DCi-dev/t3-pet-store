import Head from "next/head";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>Pet Store</title>
        <meta name="description" content="Pet Food from the Future" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <script
          async
          defer
          data-website-id="0faf8398-dbc4-415a-ac04-dab6b3f28bea"
          src="https://umami.cdi.dev/umami.js"
        ></script>
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
