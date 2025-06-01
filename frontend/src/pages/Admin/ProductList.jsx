import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
import { useCreateProductMutation } from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select an image");
      return;
    }

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("quantity", quantity);
      productData.append("brand", brand);
      productData.append("countInStock", stock);

      const { data } = await createProduct(productData);

      if (data.error) {
        toast.error("Product create failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/admin/allproductslist");
      }
    } catch (error) {
      console.error(error);
      toast.error("Product create failed. Try Again.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      toast.success("Image selected successfully");
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageUrl(null);
    toast.info("Product image was removed");
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12 font-bold text-xl">Create Product</div>

          {imageUrl && (
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="product preview"
                  className="block mx-auto max-h-[200px] rounded-lg border border-gray-600"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200 focus:outline-none"
                  aria-label="Remove image"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            </div>
          )}

          <div className="mb-6">
            <label className="border-2 border-dashed border-gray-400 hover:border-gray-300 transition-colors duration-200 text-white px-4 block w-full rounded-lg cursor-pointer py-8">
              <div className="flex items-center justify-center space-x-3">
                <FaUpload className="text-xl text-gray-300" />
                <span className="font-medium">
                  {image ? image.name : "Click to upload image"}
                </span>
              </div>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="p-3 bg-[#1a1a1a] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  type="text"
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Count In Stock
                </label>
                <input
                  type="number"
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="p-3 w-full border rounded-lg bg-[#101011] text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="py-3 px-12 rounded-lg text-lg font-bold bg-pink-600 hover:bg-pink-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
