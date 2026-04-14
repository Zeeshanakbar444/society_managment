import { FaEdit, FaTrash, FaUserShield, FaUser, FaSync } from "react-icons/fa";
import api from "../lib/api";
import { toast } from 'react-hot-toast';
import { useState } from "react";
import { useApi } from "../hooks/useApi";

const Users = () => {
  const { data: users, loading, refresh } = useApi('residents');
  const [editingUser, setEditingUser] = useState(null);
  const [updatedRole, setUpdatedRole] = useState("");

  const handleRefresh = async () => {
    await toast.promise(
      refresh(),
      {
        loading: 'Refreshing data...',
        success: 'Data refreshed!',
        error: 'Failed to refresh data.',
      }
    );
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUpdatedRole(user.role);
  };

  const handleUpdate = async () => {
    try {
      await toast.promise(
        api.patch(`/residents/${editingUser.id}`, { role: updatedRole }),
        {
          loading: 'Updating user role...',
          success: 'User role updated successfully!',
          error: (err) => err.response?.data?.error || 'Failed to update user role.',
        }
      );
      setEditingUser(null);
      refresh();
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await toast.promise(
          api.delete(`/residents/${id}`),
          {
            loading: 'Deleting user...',
            success: 'User deleted successfully!',
            error: (err) => err.response?.data?.error || 'Failed to delete user.',
          }
        );
        refresh();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading Users...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Admin User Management</h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <FaSync className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden min-w-[640px]">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">House</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-500">
                  No users found in the database.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-medium">{user.fullName || "N/A"}</td>
                  <td className="py-4 px-6 text-gray-600">{user.email || "N/A"}</td>
                  <td className="py-4 px-6 text-gray-600">{user.phoneNumber || "N/A"}</td>
                  <td className="py-4 px-6 text-gray-600">{user.house?.houseNumber || "N/A"}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" ? (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                          <FaUserShield /> Admin
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">
                          <FaUser /> Member
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-yellow-500 hover:text-yellow-700 p-2 hover:bg-yellow-50 rounded-full transition"
                        title="Edit Role"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                        title="Delete User"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Update User Role</h2>
            <p className="text-gray-500 text-sm mb-6">
              Changing role for{" "}
              <span className="font-semibold text-gray-700">{editingUser.fullName}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={updatedRole}
                onChange={(e) => setUpdatedRole(e.target.value)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-200 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

