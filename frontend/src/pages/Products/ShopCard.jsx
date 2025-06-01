import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";

const ShopCard = ({ p }) => {
  const dispatch = useDispatch();

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative group">
        <Link to={`/product/${p._id}`}>
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
            <img
              src={p.image}
              alt={p.name}
              className="w-full h-[300px] object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {p?.brand}
          </div>
        </Link>
        <div className="absolute top-2 left-2">
          <HeartIcon product={p} />
        </div>
      </div>

      <div className="p-5">
        <Link to={`/product/${p._id}`}>
          <h3 className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {p?.name}
          </h3>
        </Link>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {p?.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-blue-600">
            ₹{p?.price?.toLocaleString()}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              addToCartHandler(p, 1);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <AiOutlineShoppingCart size={20} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
