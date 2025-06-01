import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetMyOrdersQuery } from "../../redux/api/orderApiSlice";

const UserOrder = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Orders</h2>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="error">{error?.data?.error || error.error}</Message>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">IMAGE</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">ID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">DATE</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">TOTAL</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">PAID</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">DELIVERED</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <img
                      src={order.orderItems[0].image}
                      alt={order.user}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{order._id}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {order.createdAt.substring(0, 10)}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    $ {order.totalPrice}
                  </td>
                  <td className="py-4 px-4">
                    {order.isPaid ? (
                      <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                        Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm text-red-800 bg-red-100 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {order.isDelivered ? (
                      <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                        Delivered
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full">
                        Not Delivered
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <Link to={`/order/${order._id}`}>
                      <button className="bg-pink-400 text-back py-2 px-3 rounded">
                        View Details
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserOrder;
