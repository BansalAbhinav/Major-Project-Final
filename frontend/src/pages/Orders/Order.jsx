import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Messsage from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeliverOrderMutation,
  useGetOrderDetailsQuery,
  useGetPaypalClientIdQuery,
  usePayOrderMutation,
} from "../../redux/api/orderApiSlice";

const Order = () => {
  const { id: orderId } = useParams();

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  const {
    data: paypal,
    isLoading: loadingPaPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery();

  useEffect(() => {
    if (!errorPayPal && !loadingPaPal && paypal.clientId) {
      const loadingPaPalScript = async () => {
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": paypal.clientId,
            currency: "INR",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loadingPaPalScript();
        }
      }
    }
  }, [errorPayPal, loadingPaPal, order, paypal, paypalDispatch]);

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details });
        refetch();
        toast.success("Order is paid");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    });
  }

  function createOrder(data, actions) {
    if (!order || isNaN(order.totalPrice) || order.totalPrice <= 0) {
      toast.error("Invalid order amount");
      return Promise.reject("Invalid order amount");
    }

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: order.totalPrice,
            currency_code: "INR",
          },
        },
      ],
    });
  }

  function onError(err) {
    toast.error(err.message);
  }

  const deliverHandler = async () => {
    await deliverOrder(orderId);
    refetch();
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Messsage variant="danger">{error.data.message}</Messsage>
  ) : (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Order Items</h2>
              </div>

              {order.orderItems.length === 0 ? (
                <div className="p-6">
                  <Messsage>Order is empty</Messsage>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Image</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Product</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Price</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Total</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {order.orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Link 
                              to={`/product/${item.product}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {item.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.qty}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">₹{item.price}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            ₹{(item.qty * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/3 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span className="text-gray-900 font-medium">₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-medium">₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900 font-medium">₹{order.taxPrice}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-blue-600">₹{order.totalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Shipping</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Name:</span>{" "}
                    {order.user.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Email:</span>{" "}
                    {order.user.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Address:</span>{" "}
                    {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Method:</span>{" "}
                    {order.paymentMethod}
                  </p>
                </div>

                <div className="pt-4">
                  {order.isPaid ? (
                    <div className="bg-green-50 text-green-800 rounded-lg p-4">
                      Paid on {new Date(order.paidAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="bg-red-50 text-red-800 rounded-lg p-4">
                      Not paid
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {!order.isPaid && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="p-6">
                  {loadingPay && <Loader />}
                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      <PayPalButtons
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={onError}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Deliver Button */}
            {loadingDeliver && <Loader />}
            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                onClick={deliverHandler}
              >
                Mark As Delivered
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
