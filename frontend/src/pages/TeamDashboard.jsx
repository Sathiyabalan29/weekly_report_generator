import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function TeamDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [projectsResponse, reportsResponse] = await Promise.all([
        axiosInstance.get("/projects/my-assigned"),
        axiosInstance.get("/reports/my"),
      ]);

      setProjects(projectsResponse.data.data || []);
      setReports(reportsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const draftReports = reports.filter((report) => report.status === "DRAFT");
  const submittedReports = reports.filter(
    (report) => report.status === "SUBMITTED"
  );

  const recentReports = reports.slice(0, 5);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Team Member Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-500 mt-2">
              Create weekly reports, track drafts, and manage your assigned
              projects.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-5 py-3 rounded-xl font-semibold hover:bg-white"
            >
              <RefreshCw size={18} />
              Refresh
            </button>

            <button
              onClick={() => navigate("/team/create-report")}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 bg-white rounded-2xl p-8 text-center text-slate-500">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
              <StatCard
                title="Total Reports"
                value={reports.length}
                icon={FileText}
                helper="All weekly reports created by you"
              />

              <StatCard
                title="Draft Reports"
                value={draftReports.length}
                icon={Clock}
                helper="Reports waiting for submission"
              />

              <StatCard
                title="Submitted"
                value={submittedReports.length}
                icon={CheckCircle2}
                helper="Reports submitted to manager"
              />

              <StatCard
                title="Assigned Projects"
                value={projects.length}
                icon={FolderKanban}
                helper="Projects assigned by manager/admin"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-8">
              <button
                onClick={() => navigate("/team/create-report")}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left hover:border-blue-300 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mt-4">
                  Create Weekly Report
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Add completed tasks, planned work, blockers, and hours.
                </p>
              </button>

              <button
                onClick={() => navigate("/team/reports")}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left hover:border-blue-300 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                  <Send size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mt-4">
                  Submit Draft Reports
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Review your drafts and submit them to your manager.
                </p>
              </button>

              <button
                onClick={() => navigate("/team/projects")}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-left hover:border-blue-300 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FolderKanban size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mt-4">
                  View Assigned Projects
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Check which projects are available for your reports.
                </p>
              </button>
            </div>

            <div className="grid xl:grid-cols-3 gap-6 mt-8">
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Recent Reports
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Your latest weekly report activity
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/team/reports")}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-6 py-4 font-medium">Week</th>
                        <th className="px-6 py-4 font-medium">Project</th>
                        <th className="px-6 py-4 font-medium">Hours</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {recentReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No reports created yet.
                          </td>
                        </tr>
                      ) : (
                        recentReports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {report.weekStartDate} to {report.weekEndDate}
                            </td>

                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {report.project?.name || "N/A"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-700">
                              {report.hoursWorked || 0}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${
                                  report.status === "SUBMITTED"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {report.status === "SUBMITTED" ? (
                                  <CheckCircle2 size={13} />
                                ) : (
                                  <Clock size={13} />
                                )}
                                {report.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Assigned Projects
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Projects you can report on
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/team/projects")}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FolderKanban size={28} />
                      </div>
                      <p className="text-sm text-slate-500 mt-4">
                        No assigned projects yet.
                      </p>
                    </div>
                  ) : (
                    projects.slice(0, 4).map((project) => (
                      <div
                        key={project.id}
                        className="border border-slate-200 rounded-xl p-4 hover:border-blue-300"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold text-slate-900">
                            {project.name}
                          </h3>

                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              project.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {project.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>

                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                          {project.description || "No description"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TeamDashboard;