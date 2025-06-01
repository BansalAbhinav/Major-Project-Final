// Header.js
import { useGetTopProductsQuery } from "../redux/api/productApiSlice";
import Loader from "./Loader";
import SmallProduct from "../pages/Products/SmallProduct";
import ProductCarousel from "../pages/Products/ProductCarousel";

const Header = () => {
  const { data, isLoading, error } = useGetTopProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col xl:flex-row gap-8 h-[80vh] min-h-[600px]">
        <div className="xl:w-1/2 xl:block hidden h-full">
          <div className="grid grid-cols-2 gap-4 h-full">
            {data.map((product) => (
              <div key={product._id} className="h-full">
                <SmallProduct product={product} />
              </div>
            ))}
          </div>
        </div>

        <div className="xl:w-1/2 w-full h-full">
          <ProductCarousel products={data} />
        </div>
      </div>
    </div>
  );
};

export default Header;
