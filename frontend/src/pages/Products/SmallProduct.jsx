import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const SmallProduct = ({ product }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="relative">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        </Link>
        <div className="absolute top-2 right-2">
          <HeartIcon product={product} />
        </div>
      </div>

      <div className="p-4">
        <Link 
          to={`/product/${product._id}`}
          className="block group"
        >
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-blue-600 font-semibold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {product.brand}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SmallProduct;
