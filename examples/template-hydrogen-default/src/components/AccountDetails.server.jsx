import {useShopQuery, NoStore, flattenConnection} from '@shopify/hydrogen';
import gql from 'graphql-tag';

import Layout from './Layout.server';
import MoneyPrice from './MoneyPrice.client';

export default function AccountDetails({customerAccessToken}) {
  const {data} = useShopQuery({
    query: QUERY,
    variables: {
      customerAccessToken,
    },
    cache: NoStore(),
  });

  const customer = data && data.customer;

  const orders =
    customer && customer.orders && customer.orders.edges.length > 0
      ? flattenConnection(customer.orders)
      : [];

  const pageHeader = customer
    ? `Welcome ${customer.firstName || customer.email} !`
    : 'Account Details';

  return (
    <Layout>
      <h1>{pageHeader}</h1>
      <div className="flex items-center justify-between">
        <a
          className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
          href="/api/logout"
        >
          Logout
        </a>
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-6 mb-4">
        <h2>Order History</h2>
        <table className="min-w-full table-fixed text-sm text-left mt-6">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Payment Status</th>
              <th>Fulfillment Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.orderNumber}</td>
                <td>{new Date(order.processedAt).toDateString()}</td>
                <td>{order.financialStatus}</td>
                <td>{order.fulfillmentStatus}</td>
                <td>
                  <MoneyPrice money={order.currentTotalPrice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const QUERY = gql`
  query CustomerDetails($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      firstName
      email
      orders(first: 250) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
