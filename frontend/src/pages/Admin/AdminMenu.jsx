import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

const AdminMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <button
        className={`${
          isMenuOpen ? "top-2 right-2" : "top-5 right-7"
        } bg-white p-2 fixed rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200`}
        onClick={toggleMenu}
      >
        {isMenuOpen ? (
          <FaTimes className="text-gray-600" />
        ) : (
          <>
            <div className="w-6 h-0.5 bg-gray-600 my-1"></div>
            <div className="w-6 h-0.5 bg-gray-600 my-1"></div>
            <div className="w-6 h-0.5 bg-gray-600 my-1"></div>
          </>
        )}
      </button>

      {isMenuOpen && (
        <section className="bg-white p-4 fixed right-7 top-5 rounded-lg shadow-lg">
          <ul className="list-none mt-2">
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                Admin Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/categorylist"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                Create Category
              </NavLink>
            </li>
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/productlist"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                Create Product
              </NavLink>
            </li>
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/allproductslist"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                All Products
              </NavLink>
            </li>
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/userlist"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink
                className="py-2 px-3 block mb-2 hover:bg-gray-50 rounded-md transition-colors duration-200"
                to="/admin/orderlist"
                style={({ isActive }) => ({
                  color: isActive ? "#2563eb" : "#4b5563",
                })}
              >
                Manage Orders
              </NavLink>
            </li>
          </ul>
        </section>
      )}
    </>
  );
};

export default AdminMenu;
