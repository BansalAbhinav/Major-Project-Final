import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-8">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <td className="px-1 py-2 text-left align-top">Image</td>
                  <td className="px-1 py-2 text-left">Product</td>
                  <td className="px-1 py-2 text-left">Quantity</td>
                  <td className="px-1 py-2 text-left">Price</td>
                  <td className="px-1 py-2 text-left">Total</td>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>

                    <td className="p-2">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">{item.price.toFixed(2)}</td>
                    <td className="p-2">
                      $ {(item.qty * item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-5 text-gray-800">Order Summary</h2>
          <div className="flex justify-between flex-wrap p-8 bg-white rounded-lg shadow-md">
            <div className="space-y-4">
              <div className="text-gray-700">
                <span className="font-semibold">Items:</span>{" "}
                <span className="text-blue-600">₹{cart.itemsPrice}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Shipping:</span>{" "}
                <span className="text-blue-600">₹{cart.shippingPrice}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Tax:</span>{" "}
                <span className="text-blue-600">₹{cart.taxPrice}</span>
              </div>
              <div className="text-gray-700">
                <span className="font-semibold">Total:</span>{" "}
                <span className="text-blue-600 text-lg">₹{cart.totalPrice}</span>
              </div>
            </div>

            {error && <Message variant="error">{error.data.message}</Message>}

            <div className="mt-6 lg:mt-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Shipping</h2>
              <div className="text-gray-700">
                <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Method</h2>
              <div className="text-gray-700">
                <strong>Method:</strong> {cart.paymentMethod}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-lg w-full mt-6 transition-colors duration-200"
            disabled={cart.cartItems === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;
