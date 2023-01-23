import CartList from "@/components/cart/CartList";
import { useShopContext, type ShopContextProps } from "@/context/ShopContext";
import getStripe from "@/lib/getStripe";
import type { CartProduct } from "@/types/product";
import { type NextPage } from "next";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CartPage: NextPage = () => {
  const {
    syncWishlist,
    handleCartSync,
    cartIds,
    setCartIds,
    totalPrice,
    totalShipping,
    totalTaxes,
    orderTotal,
    totalQuantity,
    handleCartDetails,
  } = useShopContext() as ShopContextProps;

  useEffect(() => {
    syncWishlist();
    handleCartSync();
    const localCart = JSON.parse(localStorage.getItem("cart") as string);
    if (!localCart) return;
    const localCartIds = localCart.map((item: CartProduct) => item.productId);
    setCartIds(localCartIds);
  }, []);

  useEffect(() => {
    handleCartDetails();
  }, [totalQuantity, cartIds, orderTotal]);

  const handleCheckout = async () => {
    // Ger orderItems from local storage key "order"
    const orderItems = JSON.parse(localStorage.getItem("order") as string);
    const stripe = await getStripe();
    const response = await fetch("/api/stripe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Cors policy
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(orderItems),
    });
    if (response.status === 500) {
      console.log("Error");
      return;
    }
    const data = await response.json();
    toast.loading("Redirecting to checkout...");
    stripe?.redirectToCheckout({
      sessionId: data.id,
    });
  };

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
              <CartList />
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
                type="button"
                onClick={handleCheckout}
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

export default CartPage;
