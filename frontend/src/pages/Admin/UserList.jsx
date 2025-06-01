import { useEffect, useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "../../redux/api/usersApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [updateUser] = useUpdateUserMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id);
        refetch();
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const toggleEdit = (id, username, email) => {
    setEditableUserId(id);
    setEditableUserName(username);
    setEditableUserEmail(email);
  };

  const updateHandler = async (id) => {
    try {
      await updateUser({
        userId: id,
        username: editableUserName,
        email: editableUserEmail,
      });
      setEditableUserId(null);
      refetch();
      toast.success("User updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <AdminMenu />
          </div>

          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <h2 className="text-2xl font-bold text-gray-900 p-6 border-b border-gray-100">
                Users List
              </h2>

              {isLoading ? (
                <div className="p-6">
                  <Loader />
                </div>
              ) : error ? (
                <div className="p-6">
                  <Message variant="danger">
                    {error?.data?.message || error.message}
                  </Message>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Admin</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user._id}
                          </td>
                          <td className="px-6 py-4">
                            {editableUserId === user._id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editableUserName}
                                  onChange={(e) => setEditableUserName(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => updateHandler(user._id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <FaCheck className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">{user.username}</span>
                                <button
                                  onClick={() => toggleEdit(user._id, user.username, user.email)}
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editableUserId === user._id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="email"
                                  value={editableUserEmail}
                                  onChange={(e) => setEditableUserEmail(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  onClick={() => updateHandler(user._id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <FaCheck className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <a 
                                  href={`mailto:${user.email}`}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                  {user.email}
                                </a>
                                <button
                                  onClick={() => toggleEdit(user._id, user.username, user.email)}
                                  className="text-gray-600 hover:text-blue-600"
                                >
                                  <FaEdit className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {user.isAdmin ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                User
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {!user.isAdmin && (
                              <button
                                onClick={() => deleteHandler(user._id)}
                                className="text-red-600 hover:text-red-700 transition-colors duration-200"
                              >
                                <FaTrash className="w-5 h-5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
