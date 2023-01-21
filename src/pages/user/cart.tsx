import CartItem from "@/components/CartItem";
import { useShopContext, ShopContextProps } from "@/context/ShopContext";
import { client } from "@/lib/client";
import type { ProductType } from "@/types/product";
import { api } from "@/utils/api";
import type { GetServerSideProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const CartPage: NextPage<{ products: ProductType[] }> = ({ products }) => {
  const { data: sessionData } = useSession();
   const { syncWishlist } = useShopContext() as ShopContextProps;

   useEffect(() => {
     syncWishlist(products);
   }, [sessionData?.user]);



  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>();
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [totalTaxes, setTotalTaxes] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(1);

  const cart = api.cart.getItems.useQuery();
  const removeItem = api.cart.removeItem.useMutation();
  const updateQuantity = api.cart.updateQuantity.useMutation();
  const syncProduct = api.cart.synchronizeCart.useMutation();
  const processedProducts = new Set();

  //  Async function to merge Cart
  const mergeCart = async () => {
    // Get the cart from local storage
    const storageCart = JSON.parse(localStorage.getItem("cart") || "[]");
    //  Sync the local storage cart with the server cart
    const serverCart = cart.data?.map((item) => ({
      productId: item.productId,
      sizeOption: {
        _key: item.sizeOption?.key,
        price: item.sizeOption?.price,
        size: item.sizeOption?.size,
      },
      flavor: item.flavor,
      quantity: item.quantity,
    }));

    const cartItems = [
      ...new Set(
        [...storageCart, ...serverCart].filter(
          (item, index, self) =>
            self.findIndex((i) => i.productId === item.productId) === index
        )
      ),
    ];

    localStorage.setItem("cart", JSON.stringify(cartItems));
    const syncFunc = async () => {
      await storageCart.forEach((item) => {
        if (!processedProducts.has(item.productId)) {
          processedProducts.add(item);
          syncProduct.mutate({
            _id: item.productId,
            sizeOption: item.sizeOption,
            flavor: item.flavor,
            quantity: item.quantity,
          });
        }
      });
    };
    await syncFunc();
  };

  useEffect(() => {
    // Get the cart from local storage
    const storageCart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (sessionData?.user && cart.data) {
      mergeCart();
    }

    // Filter the products by the ids, sizeOption and flavor in the cart
    const filteredProducts = products.filter((product) =>
      storageCart.some(
        (item: { productId: string; flavor: string }) =>
          item.productId === product._id && product.flavor.includes(item.flavor)
      )
    );

    // Set the filtered products
    setFilteredProducts(filteredProducts);
  }, []);

  const handleRemoveProduct = (productId: string) => {
    if (sessionData && cart.data) {
      removeItem.mutate({
        productId: productId,
      });
      setFilteredProducts(
        filteredProducts?.filter((product) => product._id !== productId)
      );
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") || "[]").filter(
            (product) => product.productId !== productId
          )
        )
      );
    } else {
      setFilteredProducts(
        filteredProducts?.filter((product) => product._id !== productId)
      );
      localStorage.setItem(
        "cart",
        JSON.stringify(
          JSON.parse(localStorage.getItem("cart") || "[]").filter(
            (product: ProductType) => product._id !== productId
          )
        )
      );
    }
  };

  const handleQuantityChange = (productId: string, qty: number) => {
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const product = localCart.find(
      (item: { productId: string }) => item.productId === productId
    );
    product.quantity = qty;
    localStorage.setItem("cart", JSON.stringify(localCart));
    if (sessionData) {
      updateQuantity.mutate({
        productId: productId,
        quantity: qty,
      });
    }
    // Set the total quantity
    setTotalQuantity(
      localCart.reduce((acc: number, item: any) => {
        return acc + item.quantity;
      }, 0)
    );
  };

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartTotal = cart.reduce((acc: number, item: any) => {
      return acc + item.sizeOption.price * item.quantity;
    }, 0);
    setTotalPrice(cartTotal);

    // Set totalShipping to 0 if the total price is 0 or over 100, otherwise set it to 5
    setTotalShipping(
      cartTotal > 100 ? 0 : cartTotal === 0 ? 0 : 5
    );

    // Set totalTax to 19% of the total price
    setTotalTaxes(cartTotal * 0.19);

    // Set orderTotal to the total price + total shipping + total taxes
    setOrderTotal(cartTotal + totalShipping + totalTaxes);
  }, [totalQuantity, totalShipping, totalTaxes, filteredProducts]);

  return (
    <main className="bg-neutral-800">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100 sm:text-4xl">
          Shopping Cart
        </h1>
        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul
              role="list"
              className="divide-y divide-neutral-200 border-t border-b border-neutral-700"
            >
              {filteredProducts?.map((product) => (
                <CartItem
                  product={product}
                  key={product._id}
                  handleRemoveProduct={handleRemoveProduct}
                  handleQuantityChange={handleQuantityChange}
                />
              ))}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-neutral-700 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2
              id="summary-heading"
              className="text-lg font-medium text-neutral-100"
            >
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-neutral-300">Subtotal</dt>
                <dd className="text-sm font-medium text-neutral-100">
                  ${totalPrice}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-600 pt-4">
                <dt className="flex items-center text-sm text-neutral-300">
                  <span>Shipping estimate</span>
                </dt>
                <dd className="text-sm font-medium text-neutral-100">
                  ${totalShipping}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-600 pt-4">
                <dt className="flex text-sm text-neutral-300">
                  <span>Tax estimate</span>
                </dt>
                <dd className="text-sm font-medium text-neutral-100">
                  ${totalTaxes}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-600 pt-4">
                <dt className="text-base font-medium text-neutral-100">
                  Order total
                </dt>
                <dd className="text-base font-medium text-neutral-100">
                  ${orderTotal}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="submit"
                className="w-full rounded-md border border-transparent bg-yellow-400 py-3 px-4 text-base font-medium text-neutral-900 shadow-sm hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-neutral-800"
              >
                Checkout
              </button>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const query = '*[_type == "product"]';
  const products = await client.fetch(query);

  return {
    props: {
      products,
    },
  };
};

export default CartPage;
