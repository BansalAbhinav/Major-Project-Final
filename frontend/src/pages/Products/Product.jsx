import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="w-[20rem] h-[28rem] p-3 relative flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative flex-1">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-[15rem] object-cover rounded-lg"
          />
        </Link>
        <HeartIcon product={product} />
      </div>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product._id}`} className="flex-1">
          <h2 className="flex justify-between items-start mb-2">
            <div className="text-lg font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
              {product.name}
            </div>
          </h2>
        </Link>
        <div className="mt-auto">
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            ₹ {product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Product;
