import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_BASE_URL = "https://31.97.232.231/booking";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const UserData = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(userSchema),
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        username: data.username,
        password: data.password,
      };

      let response;
      if (isEditMode) {
        response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to save user");
      }

      await fetchUsers(); // Refresh the list

      reset();
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingUser(null);
    } catch (error) {
      console.log(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsEditMode(true);
    setIsModalOpen(true);

    setValue("username", user.username);
    setValue("password", user.password);
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-green-700">
              {isEditMode ? "Edit User" : "Add New User"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div className="p-4">{children}</div>
        </div>
      </div>,
      document.body
    );
  };

  const InputField = ({
    label,
    name,
    type = "text",
    options = [],
    disabled = false,
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {type === "select" ? (
        <select
          id={name}
          {...register(name)}
          className="mt-1 block w-full rounded-md outline-none focus:border-green-500 focus:ring-green-500 sm:text-sm bg-white px-3 py-2 border border-green-200 transition duration-300"
          disabled={disabled || loading}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          {...register(name)}
          className="mt-1 block w-full rounded-md border border-green-200 bg-white px-3 py-2 focus:border-green-500 focus:ring-green-500 outline-none sm:text-sm transition duration-300"
          disabled={disabled || loading}
          autoComplete={type === "password" ? "new-password" : "off"}
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-[70vh] bg-green-50">
      <div className="mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-green-800">
            User Management
          </h1>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingUser(null);
              reset();
              setIsModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 text-sm"
          >
            Add New User
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-4 text-green-700">Loading users...</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              {users.length > 0 ? (
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.password}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-green-600 hover:text-green-900 mr-3 cursor-pointer"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td
                      className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      colSpan={4}
                    >
                      No Data Found
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>

        {/* User Form Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField label="Username" name="username" />
            <InputField label="Password" name="password" type="password" />

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Alert Modal */}
        <Modal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
        >
          <p className="text-gray-700 text-center">{alertMessage}</p>
        </Modal>
      </div>
    </div>
  );
};

export default UserData;
