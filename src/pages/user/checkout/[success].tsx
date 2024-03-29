import CheckoutItem from "@/components/checkout/CheckoutItem";
import { api } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const CheckoutSuccess = () => {
  // Get the sessionID from the URL
  // This is the sessionID from Stripe
  const router = useRouter();
  const sessionID = router.query.session_id;

  useEffect(() => {
    // clear local storage
    localStorage.removeItem("cart");
    localStorage.removeItem("order");
  }, []);

  // If sessionID is not undefinded
  if (sessionID !== undefined) {
    return <Content sessionId={sessionID as string} />;
  }
};

const Content = ({ sessionId }: { sessionId: string }) => {
  // Get the checkout session and line items from TRPC
  // based on the sessionID
  const { data: session } = api.stripe.getCheckoutSession.useQuery(sessionId);

  // Get the checkout session items from TRPC
  // based on the sessionID
  const { data: lineItems } =
    api.stripe.getCheckoutSessionItems.useQuery(sessionId);

  return (
    <main className="relative min-h-screen bg-neutral-800">
      <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
        <Image
          src="/assets/checkout-success.jpg"
          alt="Pet Store"
          className="h-full w-full object-cover object-center lg:object-left"
          width={885}
          height={1184}
        />
      </div>

      <div>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
          <div className="lg:col-start-2">
            <h1 className="text-sm font-medium text-yellow-400">
              Payment successful
            </h1>
            <p className="mt-2 text-4xl font-bold tracking-tight text-neutral-100 sm:text-5xl">
              Thanks for ordering
            </p>
            <p className="mt-2 text-base text-neutral-300">
              We appreciate your order, we’re currently processing it. So hang
              tight and we’ll send you confirmation very soon!
            </p>

            {session && lineItems && (
              <>
                <dl className="mt-16 text-sm font-medium">
                  <dt className="text-neutral-100">Tracking</dt>
                  <dd className="mt-2 break-all text-yellow-400">
                    {sessionId.replace("cs_test_", "")}
                  </dd>
                </dl>
                <ul
                  role="list"
                  className="mt-6 divide-y divide-neutral-700 border-t border-neutral-700 text-sm font-medium text-neutral-400"
                >
                  {lineItems?.data ? (
                    lineItems.data.map((product) => (
                      <CheckoutItem
                        key={product?.price?.product as string}
                        quantity={product?.quantity as number}
                        price={product.amount_total / 100}
                        productId={product?.price?.product as string}
                      />
                    ))
                  ) : (
                    <p>Loading...</p>
                  )}
                </ul>

                <dl className="space-y-6 border-t border-neutral-700 pt-6 text-sm font-medium text-neutral-400">
                  <div className="flex justify-between">
                    <dt className="text-neutral-100">Subtotal</dt>
                    <dd className="text-neutral-100">
                      $
                      {session?.amount_subtotal
                        ? session.amount_subtotal / 100
                        : 0}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-neutral-100">Shipping</dt>
                    <dd className="text-neutral-100">
                      $
                      {session?.shipping_cost?.amount_total
                        ? session.shipping_cost.amount_total / 100
                        : 0}
                    </dd>
                  </div>

                  <div className="flex justify-between">
                    <dt className="text-neutral-100">Taxes</dt>
                    <dd className="text-neutral-100">$0</dd>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-700 pt-6 text-neutral-100">
                    <dt className="text-base text-neutral-200">Total</dt>
                    <dd className="text-base text-neutral-200">
                      ${session?.amount_total ? session.amount_total / 100 : 0}
                    </dd>
                  </div>
                </dl>

                <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-neutral-400">
                  <div>
                    <dt className="font-medium text-neutral-100">
                      Shipping Address
                    </dt>
                    <dd className="mt-2">
                      <address className="not-italic text-neutral-200">
                        <span className="block">
                          {session?.shipping_details?.name}
                        </span>
                        <span className="block">
                          {session?.shipping_details?.address?.line1}
                        </span>
                        <span className="block">
                          {session?.shipping_details?.address?.city}
                        </span>
                        <span className="block">
                          {session?.shipping_details?.address?.country},{" "}
                          {session?.shipping_details?.address?.postal_code}
                        </span>
                      </address>
                    </dd>
                  </div>
                  <div>
                    <PaymentInfo
                      paymentInfo={session?.payment_intent as string}
                    />
                  </div>
                </dl>

                <div className="mt-16 border-t border-neutral-700 py-6 text-right">
                  <Link
                    href="/shop"
                    className="text-sm font-medium text-yellow-400 hover:text-yellow-500"
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

// Display the payment information from Stripe
const PaymentInfo = ({ paymentInfo }: { paymentInfo: string }) => {
  // Get the payment details using TRPC from Stripe
  const { data: paymentMethod } =
    api.stripe.getStripePaymentMethod.useQuery(paymentInfo);

  return (
    <>
      <dt className="font-medium text-neutral-100">Payment Information</dt>
      <dd className="mt-2 space-y-2 sm:flex sm:space-x-4 sm:space-y-0">
        <div className="flex-none">
          <svg
            aria-hidden="true"
            width={36}
            height={24}
            viewBox="0 0 36 24"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-auto"
          >
            <rect width={36} height={24} rx={4} fill="#224DBA" />
            <path
              d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
              fill="#fff"
            />
          </svg>
          <p className="sr-only">Visa</p>
        </div>
        <div className="flex-auto">
          <p className="text-neutral-100">
            Ending with {paymentMethod?.card?.last4}
          </p>
          <p className="text-neutral-200">
            Expires {paymentMethod?.card?.exp_month} /{" "}
            {paymentMethod?.card?.exp_year
              ? paymentMethod?.card?.exp_year % 100
              : 23}
          </p>
        </div>
      </dd>
    </>
  );
};

export default CheckoutSuccess;
