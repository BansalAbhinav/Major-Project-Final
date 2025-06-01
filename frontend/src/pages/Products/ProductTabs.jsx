import { useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import { useGetTopProductsQuery } from "../../redux/api/productApiSlice";
import SmallProduct from "./SmallProduct";
import Loader from "../../components/Loader";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  const { data, isLoading } = useGetTopProductsQuery();
  const [activeTab, setActiveTab] = useState(1);

  if (isLoading) {
    return <Loader />;
  }

  const handleTabClick = (tabNumber) => {
    setActiveTab(tabNumber);
  };

  return (
    <div className="w-full bg-white">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-100">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabClick(1)}
            className={`${
              activeTab === 1
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Write Review
          </button>
          <button
            onClick={() => handleTabClick(2)}
            className={`${
              activeTab === 2
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Reviews ({product.reviews.length})
          </button>
          <button
            onClick={() => handleTabClick(3)}
            className={`${
              activeTab === 3
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } py-4 px-4 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Related Products
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="py-8">
        {/* Write Review Panel */}
        {activeTab === 1 && (
          <div className="max-w-2xl">
            {userInfo ? (
              <form onSubmit={submitHandler} className="space-y-6">
                <div>
                  <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    id="rating"
                    required
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="block w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    id="comment"
                    rows="4"
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="block w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    placeholder="Share your thoughts about the product..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      Please{" "}
                      <Link to="/login" className="font-medium text-blue-700 underline hover:text-blue-600">
                        sign in
                      </Link>{" "}
                      to write a review
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews Panel */}
        {activeTab === 2 && (
          <div className="space-y-6">
            {product.reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>
            ) : (
              product.reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">{review.name}</h4>
                    <time className="text-sm text-gray-500" dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="mb-4">
                    <Ratings value={review.rating} />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Related Products Panel */}
        {activeTab === 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {!data ? (
              <Loader />
            ) : (
              data.map((product) => (
                <SmallProduct key={product._id} product={product} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
