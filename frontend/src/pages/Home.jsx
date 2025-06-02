import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader.jsx";
import Message from "../components/Message.jsx";
import Header from "../components/Header.jsx";
import Product from "./Products/Product.jsx";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  const { keyword } = useParams();
  const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="container mx-auto text-center">
          <p className="text-3xl text-blue-600 font-semibold mb-4">Welcome to Ecommerce</p>
          <h1 className="text-5xl font-bold text-gray-900 mb-8">FIND AMAZING PRODUCTS BELOW</h1>
          <Link
            to="/shop"
            className="inline-block bg-blue-600 text-white font-bold rounded-full py-3 px-12 hover:bg-blue-700 transition duration-300"
          >
            Shop Now
          </Link>
        </div>
      </div>

      <div className="ml-10">
        <div className="ml-8 h-[7rem] w-[60%]">
          {/* <input type="text" name="" id="" />
          <FaSearch className="text-red-500" size={20} /> */}
        </div>
        {!keyword && <Header />}
        {isLoading ? (
          <Loader />
        ) : isError ? (
          <Message variant="danger">
            {isError?.data?.message ||
              isError?.message ||
              isError?.error ||
              "An error occurred"}
          </Message>
        ) : (
          <>
            <div className="flex justify-between items-center mt-16">
              <h1 className="ml-[20rem] text-[3rem]">
                Special Products
              </h1>

              <Link
                to="/shop"
                className="bg-pink-600 font-bold rounded-full py-2 px-10 mr-[18rem]"
              >
                Shop
              </Link>
            </div>

            <div>
              <div className="flex justify-center flex-wrap mt-[2rem]">
                {data?.products?.map((product) => (
                  <div key={product._id}>
                    <Product product={product} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Home;
