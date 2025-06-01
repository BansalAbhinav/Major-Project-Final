import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ShopCard from "./Products/ShopCard";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, categoriesQuery.isLoading, dispatch]);

  useEffect(() => {
    if (!checked.length || !radio.length) {
      if (!filteredProductsQuery.isLoading) {
        const filteredProducts =
          filteredProductsQuery.data?.filter((product) => {
            return (
              product.price.toString().includes(priceFilter) ||
              product.price === parseInt(priceFilter, 10)
            );
          }) || [];
        dispatch(setProducts(filteredProducts));
      }
    }
  }, [
    checked,
    radio,
    filteredProductsQuery.data,
    filteredProductsQuery.isLoading,
    dispatch,
    priceFilter,
  ]);

  const handleBrandClick = (brand) => {
    const productsByBrand =
      filteredProductsQuery.data?.filter(
        (product) => product.brand === brand
      ) || [];
    dispatch(setProducts(productsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...new Set(
      filteredProductsQuery.data
        ?.map((product) => product.brand)
        .filter((brand) => brand !== undefined) || []
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  return (
    <div className="container mx-auto">
      <div className="flex md:flex-row">
        <div className="bg-[#151515] p-3 ml-14 mt-2 mb-2">
          <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
            Filter by Categories
          </h2>

          <div className="p-5 w-[15rem]">
            {categories?.map((c) => (
              <div key={c._id} className="mb-2">
                <div className="flex items-center mr-4">
                  <input
                    type="checkbox"
                    id={`category-${c._id}`}
                    onChange={(e) => handleCheck(e.target.checked, c._id)}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label
                    htmlFor={`category-${c._id}`}
                    className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                  >
                    {c.name}
                  </label>
                </div>
              </div>
            ))}
          </div>

          <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
            Filter by Brands
          </h2>

          <div className="p-5">
            {uniqueBrands.map((brand) => (
              <div key={brand} className="flex items-center mr-4 mb-5">
                <input
                  type="radio"
                  id={`brand-${brand}`}
                  name="brand"
                  onChange={() => handleBrandClick(brand)}
                  className="w-4 h-4 text-pink-400 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label
                  htmlFor={`brand-${brand}`}
                  className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>

          <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
            Filter by Price
          </h2>

          <div className="p-5 w-[15rem]">
            <input
              type="text"
              placeholder="Enter Price"
              value={priceFilter}
              onChange={handlePriceChange}
              className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
            />
          </div>

          <div className="p-5 pt-0">
            <button
              className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              onClick={() => window.location.reload()}
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="p-3 flex-1">
          {filteredProductsQuery.isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white text-lg mb-4">
                No products found matching your filters
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-[#0e1024]">
              {products.map((product) => (
                <ShopCard key={product._id} p={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
