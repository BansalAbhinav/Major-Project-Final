import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {
  return (
    <div className="w-[20rem] h-[28rem] p-3 relative flex flex-col">
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
            <div className="text-lg font-medium line-clamp-2">
              {product.name}
            </div>
          </h2>
        </Link>
        <div className="mt-auto">
          <span className="bg-pink-100 text-pink-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
            $ {product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Product;
