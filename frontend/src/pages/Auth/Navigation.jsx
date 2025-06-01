import { useState } from "react";
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { FaHeart } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{ zIndex: 9999 }}
      onMouseEnter={() => setIsSidebarExpanded(true)}
      onMouseLeave={() => {
        setIsSidebarExpanded(false);
        setDropdownOpen(false);
      }}
      className={`${
        isSidebarExpanded ? "w-[15%]" : "w-[4%]"
      } xl:flex lg:flex md:hidden sm:hidden flex-col justify-between p-4 text-gray-700 bg-white border-r border-gray-200 h-[100vh] fixed transition-all duration-300 shadow-lg`}
      id="navigation-container"
    >
      {/* Top Navigation Links */}
      <div className="flex flex-col justify-center space-y-4">
        <Link
          to="/"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-blue-600"
        >
          <AiOutlineHome className="mr-2 mt-[3rem]" size={26} />
          {isSidebarExpanded && (
            <span className="nav-item-name mt-[3rem] text-sm font-medium">
              HOME
            </span>
          )}
        </Link>

        <Link
          to="/shop"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-blue-600"
        >
          <AiOutlineShopping className="mr-2 mt-[1.85rem]" size={26} />
          {isSidebarExpanded && (
            <span className="nav-item-name mt-[1.85rem] text-sm font-medium">
              SHOP
            </span>
          )}
        </Link>

        <Link
          to="/cart"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-blue-600"
        >
          <AiOutlineShoppingCart className="mr-2 mt-[1.85rem]" size={26} />
          {isSidebarExpanded && (
            <span className="nav-item-name mt-[1.85rem] text-sm font-medium">
              CART
            </span>
          )}
        </Link>

        <Link
          to="/favorite"
          className="flex items-center transition-transform transform hover:translate-x-2 hover:text-blue-600"
        >
          <FaHeart className="mr-2 mt-[1.85rem]" size={22} />
          {isSidebarExpanded && (
            <span className="nav-item-name mt-[1.85rem] text-sm font-medium">
              FAVORITE
            </span>
          )}
        </Link>
      </div>

      <div className="relative mt-auto">
        {userInfo ? (
          <button
            onClick={toggleDropdown}
            className="flex items-center text-gray-700 focus:outline-none mb-1"
          >
            {isSidebarExpanded ? (
              <>
                <span className="text-gray-700">{userInfo.username}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="gray"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                  />
                </svg>
              </>
            ) : (
              <AiOutlineUser size={26} />
            )}
          </button>
        ) : (
          <ul>
            <li>
              <Link
                to="/login"
                className="flex items-center transition-transform transform hover:translate-x-2"
              >
                <AiOutlineLogin className="mr-2 mt-[3rem]" size={26} />
                {isSidebarExpanded && (
                  <span className="nav-item-name mt-[3rem]">Login</span>
                )}
              </Link>
            </li>
            <li>
              <Link
                to="/register"
                className="flex items-center transition-transform transform hover:translate-x-2"
              >
                <AiOutlineUserAdd className="mr-2 mt-[1rem]" size={26} />
                {isSidebarExpanded && (
                  <span className="nav-item-name mt-[1rem]">Register</span>
                )}
              </Link>
            </li>
          </ul>
        )}

        {dropdownOpen && userInfo && isSidebarExpanded && (
          <ul
            className={`absolute right-0 mt-2 mr-14 rounded-md overflow-hidden space-y-2 bg-[#383737] text-[#edeaea] ${
              !userInfo.isAdmin ? "-top-20" : "-top-72"
            }`}
          >
            {userInfo.isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="block px-4 py-1 hover:bg-[#747272]"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/productlist"
                    className="block px-4 py-1 hover:bg-[#747272]"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/categorylist"
                    className="block px-4 py-1 hover:bg-[#747272]"
                  >
                    Category
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/orderlist"
                    className="block px-4 py-1 hover:bg-[#747272]"
                  >
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/userlist"
                    className="block px-4 py-1 hover:bg-[#747272]"
                  >
                    Users
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to="/profile"
                className="block px-4 py-1 hover:bg-[#747272]"
              >
                Profile
              </Link>
            </li>
            <li>
              <button
                onClick={logoutHandler}
                className="block w-full px-4 py-1 text-left hover:bg-[#747272]"
              >
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Navigation;
