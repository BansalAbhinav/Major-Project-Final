import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import moment from "moment";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";

const ProductCarousel = ({ products }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    swipeToSlide: true,
    draggable: true,
    pauseOnHover: true,
    adaptiveHeight: false,
  };

  return (
    <div className="h-full">
      <Slider {...settings} className="h-full">
        {products.map((product) => (
          <div
            key={product._id}
            className="h-full px-2 outline-none focus:outline-none"
          >
            <div className="bg-transparent rounded-lg p-6 h-full flex flex-col">
              <div className="flex-1 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 h-64 md:h-auto">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="md:w-1/2 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{product.name}</h2>
                    <p className="text-lg text-pink-400 mb-4">
                      ${product.price}
                    </p>
                    <p className="text-gray-300 mb-6 line-clamp-3">
                      {product.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left column */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaStore className="mr-2 text-white" />
                        <span>Brand: {product.brand}</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="mr-2 text-white" />
                        <span>
                          Added: {moment(product.createdAt).fromNow()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-white" />
                        <span>Reviews: {product.numReviews}</span>
                      </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <FaStar className="mr-2 text-white" />
                        <span>Rating: {Math.round(product.rating)}/5</span>
                      </div>
                      <div className="flex items-center">
                        <FaShoppingCart className="mr-2 text-white" />
                        <span>Quantity: {product.quantity}</span>
                      </div>
                      <div className="flex items-center">
                        <FaBox className="mr-2 text-white" />
                        <span>In Stock: {product.countInStock}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ProductCarousel;
