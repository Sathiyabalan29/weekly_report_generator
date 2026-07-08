import { useEffect, useState } from "react";
import {
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
  Users,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function ManagerUsers() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const query = roleFilter ? `?role=${roleFilter}` : "";
      const response = await axiosInstance.get(`/users${query}`);

      setUsers(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApplyFilter = () => {
    fetchUsers();
  };

  const handleClearFilter = () => {
    setRoleFilter("");

    setTimeout(() => {
      fetchUsers();
    }, 0);
  };

  const handleRoleChange = async (userId, role) => {
    const confirmChange = window.confirm(
      `Are you sure you want to change this user's role to ${role}?`
    );

    if (!confirmChange) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await axiosInstance.patch(`/users/${userId}/role`, {
        role,
      });

      setSuccess("User role updated successfully");
      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (targetUser) => {
    const nextStatus = !targetUser.isActive;

    const confirmChange = window.confirm(
      nextStatus
        ? "Are you sure you want to activate this user?"
        : "Are you sure you want to deactivate this user?"
    );

    if (!confirmChange) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await axiosInstance.patch(`/users/${targetUser.id}/status`, {
        isActive: nextStatus,
      });

      setSuccess(
        nextStatus
          ? "User activated successfully"
          : "User deactivated successfully"
      );

      await fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    if (role === "ADMIN") return "bg-purple-50 text-purple-700";
    if (role === "MANAGER") return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              User Management
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Users</h1>
            <p className="text-slate-500 mt-2">
              View team members, managers, and admins. Admins can update roles
              and account status.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {!isAdmin && (
          <div className="mt-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm">
            You are logged in as Manager. You can view users, but only Admin can
            update roles or account status.
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-5 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Users</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {users.length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Team Members</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {users.filter((item) => item.role === "TEAM_MEMBER").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Managers</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {users.filter((item) => item.role === "MANAGER").length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Admins</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {users.filter((item) => item.role === "ADMIN").length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 p-5">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Filter by Role
              </label>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white"
              >
                <option value="">All Roles</option>
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <button
              onClick={handleApplyFilter}
              className="bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700"
            >
              Apply Filter
            </button>

            <button
              onClick={handleClearFilter}
              className="border border-slate-300 text-slate-700 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">User List</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage users and role permissions.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading users...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Change Role</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-slate-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                              {item.name?.charAt(0)?.toUpperCase()}
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {item.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadgeClass(
                              item.role
                            )}`}
                          >
                            {item.role === "ADMIN" && <ShieldCheck size={13} />}
                            {item.role === "MANAGER" && <UserCog size={13} />}
                            {item.role === "TEAM_MEMBER" && (
                              <Users size={13} />
                            )}
                            {item.role}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                              item.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {item.isActive ? (
                              <UserCheck size={13} />
                            ) : (
                              <UserX size={13} />
                            )}
                            {item.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <select
                            value={item.role}
                            onChange={(event) =>
                              handleRoleChange(item.id, event.target.value)
                            }
                            disabled={!isAdmin || item.id === user?.id}
                            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleStatusChange(item)}
                            disabled={!isAdmin || item.id === user?.id || actionLoading}
                            className={`text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50 ${
                              item.isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {item.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ManagerUsers;