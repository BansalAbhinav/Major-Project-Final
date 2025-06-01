import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";

const AdminProductUpdate = () => {
  const params = useParams();
  const { data: productData } = useGetProductByIdQuery(params._id);
  const navigate = useNavigate();

  // State initialization
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(null); // Changed to null
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);

  const { data: categories = [] } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData) {
      setName(productData.name || "");
      setDescription(productData.description || "");
      setPrice(productData.price || "");
      setCategory(productData.category?._id || null);
      setQuantity(productData.quantity || "");
      setBrand(productData.brand || "");
      setImage(productData.image || "");
      setStock(productData.countInStock || 0);
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      if (category) formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("brand", brand);
      formData.append("countInStock", stock);

      if (image) {
        if (typeof image === "string") {
          formData.append("image", image);
        } else {
          formData.append("image", image);
        }
      }

      await updateProduct({
        productId: params._id,
        formData: formData,
      }).unwrap();

      toast.success("Product updated successfully");
      navigate("/admin/allproductslist");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err?.data?.message || "Failed to update product");
    }
  };

  const handleDelete = async () => {
    try {
      const answer = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!answer) return;

      await deleteProduct(params._id).unwrap();
      toast.success("Product deleted successfully");
      navigate("/admin/allproductslist");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="container xl:mx-[9rem] sm:mx-[0]">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="md:w-3/4 p-3">
          <div className="h-12 text-xl font-bold">Update Product</div>

          {image && (
            <div className="text-center mb-4">
              <img
                src={image}
                alt="product"
                className="block mx-auto max-h-60 object-contain"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center cursor-pointer">
              <span className="text-white font-medium">
                {image ? "Change Image" : "Upload Product Image"}
              </span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={uploadFileHandler}
                className="hidden"
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Price
                </label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Stock Count
                </label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category
                </label>
                <select
                  className="w-full p-3 border rounded-lg bg-[#101011] text-white"
                  value={category || ""}
                  onChange={(e) => setCategory(e.target.value || null)}
                  required
                >
                  <option value="">Select a category</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Description
              </label>
              <textarea
                className="w-full p-3 border rounded-lg bg-[#101011] text-white min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="py-3 px-6 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Update Product
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-6 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Delete Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductUpdate;
