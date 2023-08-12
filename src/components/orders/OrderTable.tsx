// This component is used on the orders page to display the items in the order

import { api } from "@/utils/api";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import OrderItem from "./OrderItem";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
interface ChildProps {
  orderId?: string;
  orderNr?: number;
}

const OrdersTable: React.FC<ChildProps> = ({ orderId, orderNr }) => {
  // Get the checkout session data from Stripe
  const { data: session } = api.stripe.getCheckoutSession.useQuery(
    orderId as string,
  );

  // Get the products from the checkout session data
  const { data: products } = api.stripe.getCheckoutSessionItems.useQuery(
    orderId as string,
  );

  // Format the date
  const orderDate = session && new Date(session.created * 1000);
  const formattedDate = orderDate && orderDate.toDateString();

  return (
    <div
      key={orderNr}
      className="border-b border-t border-neutral-600 bg-neutral-700 shadow-sm sm:rounded-lg sm:border"
    >
      <h3 className="sr-only">
        Order placed on <time dateTime={formattedDate}>{formattedDate}</time>
      </h3>

      <div className="flex items-center border-b border-neutral-600 p-4 sm:grid sm:grid-cols-4 sm:gap-x-6 sm:p-6">
        <dl className="grid flex-1 grid-cols-2 gap-x-6 text-sm sm:col-span-3 sm:grid-cols-3 lg:col-span-2">
          <div>
            <dt className="font-medium text-neutral-100">Order number</dt>
            <dd className="mt-1 text-neutral-200">{orderNr}</dd>
          </div>
          <div className="hidden sm:block">
            <dt className="font-medium text-neutral-100">Date placed</dt>
            <dd className="mt-1 text-neutral-200">
              <time dateTime={formattedDate}>{formattedDate}</time>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-neutral-100">Total amount</dt>
            <dd className="mt-1 font-medium text-neutral-100">
              ${session?.amount_total ? session.amount_total / 100 : 0}
            </dd>
          </div>
        </dl>

        <Menu
          as="div"
          className="relative flex justify-end bg-neutral-700 lg:hidden"
        >
          <div className="flex items-center">
            <Menu.Button className="-m-2 flex items-center p-2 text-neutral-200 hover:text-neutral-300">
              <span className="sr-only">Options for order {orderNr}</span>
              <EllipsisVerticalIcon className="h-6 w-6" aria-hidden="true" />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-bottom-right rounded-md bg-neutral-600 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active
                          ? "bg-neutral-700 text-neutral-100"
                          : "text-neutral-200",
                        "block px-4 py-2 text-sm",
                      )}
                    >
                      View
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active
                          ? "bg-neutral-700 text-neutral-100"
                          : "text-neutral-200",
                        "block px-4 py-2 text-sm",
                      )}
                    >
                      Invoice
                    </a>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>

        <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:justify-end lg:space-x-4">
          <a
            href="#"
            className="flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-600 px-2.5 py-2 text-sm font-medium text-neutral-200 shadow-sm hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            <span>View Order</span>
            <span className="sr-only">{orderNr}</span>
          </a>
          <a
            href="#"
            className="flex items-center justify-center rounded-md border border-neutral-700 bg-neutral-600 px-2.5 py-2 text-sm font-medium text-neutral-200 shadow-sm hover:bg-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            <span>View Invoice</span>
            <span className="sr-only">for order {orderNr}</span>
          </a>
        </div>
      </div>
      {session && products && (
        <>
          <h4 className="sr-only">Items</h4>
          <ul role="list" className="divide-y divide-neutral-700">
            {/* Map Products */}
            {products?.data ? (
              products.data.map((product) => (
                <OrderItem
                  key={product?.price?.product as string}
                  quantity={product?.quantity as number}
                  price={product.amount_total / 100}
                  productId={product?.price?.product as string}
                  date={formattedDate}
                />
              ))
            ) : (
              <p>Loading...</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default OrdersTable;
