import OrdersTable from "@/components/orders/OrderTable";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import type { GetServerSideProps } from "next";

const OrdersPage = () => {
  const { data: orders } = api.user.getOrders.useQuery();

  return (
    <main className="min-h-screen bg-neutral-800 py-24">
      <div className="mx-auto max-w-7xl sm:px-2 lg:px-8">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-4xl lg:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl">
            Order history
          </h1>
          <p className="mt-2 text-sm text-neutral-300">
            Check the status of recent orders, manage returns, and discover
            similar products.
          </p>
        </div>
      </div>
      <section aria-labelledby="recent-heading" className="mt-16">
        <h2 id="recent-heading" className="sr-only">
          Recent orders
        </h2>
        <div className="mx-auto max-w-7xl sm:px-2 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-8 sm:px-4 lg:max-w-4xl lg:px-0">
            {/* Orders map */}
            {orders &&
              orders?.map((order, index) => (
                <OrdersTable
                  orderId={order?.stripeSessionId ? order.stripeSessionId : ""}
                  orderNr={index + 1}
                  key={index}
                />
              ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default OrdersPage;
