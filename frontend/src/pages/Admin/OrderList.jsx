import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <AdminMenu />
          </div>

          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 p-6 border-b border-gray-100">
                Orders List
              </h2>

              {isLoading ? (
                <div className="p-6">
                  <Loader />
                </div>
              ) : error ? (
                <div className="p-6">
                  <Message variant="danger">
                    {error?.data?.message || error.message}
                  </Message>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Items</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">User</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Paid</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Delivered</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <img
                              src={order.orderItems[0].image}
                              alt={order._id}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order._id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.user ? order.user.username : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            ₹{order.totalPrice}
                          </td>
                          <td className="px-6 py-4">
                            {order.isPaid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {order.isDelivered ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Delivered
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/order/${order._id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
