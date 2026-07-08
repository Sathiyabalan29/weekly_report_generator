import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  Filter,
  RefreshCw,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";

function ManagerReports() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [filters, setFilters] = useState({
    userId: "",
    projectId: "",
    weekStartDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFilterData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        axiosInstance.get("/projects"),
        axiosInstance.get("/users?role=TEAM_MEMBER"),
      ]);

      setProjects(projectsResponse.data.data || []);
      setUsers(usersResponse.data.data || []);
    } catch (error) {
      console.error("Failed to fetch filter data:", error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (filters.userId) params.append("userId", filters.userId);
      if (filters.projectId) params.append("projectId", filters.projectId);
      if (filters.weekStartDate)
        params.append("weekStartDate", filters.weekStartDate);

      const response = await axiosInstance.get(
        `/reports/submitted?${params.toString()}`
      );

      setReports(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
    fetchReports();
  }, []);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleApplyFilters = () => {
    fetchReports();
  };

  const handleClearFilters = () => {
    setFilters({
      userId: "",
      projectId: "",
      weekStartDate: "",
    });

    setTimeout(() => {
      fetchReports();
    }, 0);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Manager Reports
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Submitted Reports
            </h1>
            <p className="text-slate-500 mt-2">
              Review submitted weekly reports from team members.
            </p>
          </div>

          <button
            onClick={fetchReports}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-blue-600" />
            <h2 className="font-bold text-slate-900">Filters</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Team Member
              </label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white"
              >
                <option value="">All Members</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Project
              </label>
              <select
                name="projectId"
                value={filters.projectId}
                onChange={handleFilterChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Week Start Date
              </label>
              <input
                type="date"
                name="weekStartDate"
                value={filters.weekStartDate}
                onChange={handleFilterChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700"
              >
                Apply
              </button>

              <button
                onClick={handleClearFilters}
                className="flex-1 border border-slate-300 text-slate-700 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Report List
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {reports.length} submitted report(s) found
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading reports...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">Member</th>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Week</th>
                      <th className="px-6 py-4 font-medium">Hours</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {reports.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No submitted reports found.
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {report.user?.name || "N/A"}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            {report.project?.name || "N/A"}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-slate-400"
                              />
                              <span>{report.weekStartDate}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-700">
                            {report.hoursWorked || 0}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700">
                              <CheckCircle2 size={13} />
                              SUBMITTED
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Report Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Select a submitted report to view
              </p>
            </div>

            {!selectedReport ? (
              <div className="p-6 text-sm text-slate-500">
                No report selected.
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-slate-500">Team Member</p>
                  <h3 className="font-semibold text-slate-900 mt-1">
                    {selectedReport.user?.name || "N/A"}
                  </h3>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Project</p>
                  <h3 className="font-semibold text-slate-900 mt-1">
                    {selectedReport.project?.name || "N/A"}
                  </h3>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Week</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedReport.weekStartDate} to{" "}
                    {selectedReport.weekEndDate}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Tasks Completed</p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                    {selectedReport.tasksCompleted}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Tasks Planned</p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                    {selectedReport.tasksPlanned}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Blockers</p>
                  <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                    {selectedReport.blockers || "No blockers mentioned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Hours Worked</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedReport.hoursWorked || 0} hours
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Notes</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedReport.notes || "No notes"}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <span className="inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700">
                    SUBMITTED
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ManagerReports;