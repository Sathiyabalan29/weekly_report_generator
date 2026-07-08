import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Percent,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import StatCard from "../components/StatCard";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function ManagerDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [workloadByProject, setWorkloadByProject] = useState([]);
  const [tasksTrend, setTasksTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        summaryResponse,
        statusResponse,
        workloadResponse,
        trendResponse,
      ] = await Promise.all([
        axiosInstance.get("/dashboard/summary"),
        axiosInstance.get("/dashboard/submission-status"),
        axiosInstance.get("/dashboard/workload-by-project"),
        axiosInstance.get("/dashboard/tasks-trend"),
      ]);

      setSummary(summaryResponse.data.data);
      setSubmissionStatus(statusResponse.data.data);
      setWorkloadByProject(workloadResponse.data.data || []);
      setTasksTrend(trendResponse.data.data || []);
    } catch (error) {
      console.error("Failed to fetch manager dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const submissionChartData = [
    {
      status: "Submitted",
      count: Number(submissionStatus?.submittedCount || 0),
    },
    {
      status: "Pending",
      count: Number(submissionStatus?.pendingCount || 0),
    },
    {
      status: "Late",
      count: Number(submissionStatus?.lateCount || 0),
    },
  ];

  const workloadChartData = workloadByProject.map((item) => ({
    project: item.projectName || item.project?.name || "Project",
    hours: Number(item.totalHours || 0),
  }));

  const trendChartData = tasksTrend.map((item) => ({
    week: item.weekStartDate || item.week || "Week",
    completed: Number(
      item.completedTasksCount ||
        item.tasksCompletedCount ||
        item.totalReports ||
        0
    ),
  }));

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Manager Workspace
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Welcome back, {user?.name}
            </h1>
            <p className="text-slate-500 mt-2">
              Visual insights for reports, submissions, workload, and recent
              team activity.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            <RefreshCw size={18} />
            Refresh Dashboard
          </button>
        </div>

        {loading ? (
          <div className="mt-8 bg-white rounded-2xl p-8 text-center text-slate-500">
            Loading dashboard...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
              <StatCard
                title="Submitted Reports"
                value={summary?.totalSubmittedReports || 0}
                icon={FileText}
                helper="Total submitted reports"
              />

              <StatCard
                title="Team Members"
                value={summary?.totalTeamMembers || 0}
                icon={Users}
                helper="Active team members"
              />

              <StatCard
                title="Open Blockers"
                value={summary?.openBlockersCount || 0}
                icon={AlertTriangle}
                helper="Reports with blockers"
              />

              <StatCard
                title="Compliance Rate"
                value={`${summary?.complianceRate || 0}%`}
                icon={Percent}
                helper="Submitted members vs total members"
              />
            </div>

            <div className="grid xl:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Tasks Completed Trend
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Weekly completed work trend over time.
                </p>

                <div className="h-80 mt-6">
                  {trendChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500">
                      No trend data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          name="Completed"
                          stroke="#2563eb"
                          strokeWidth={3}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Report Submission Status
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Submitted, pending, and late report status.
                </p>

                <div className="h-80 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={submissionChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Reports"
                        fill="#2563eb"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-6 mt-8">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Workload Distribution by Project
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Total submitted hours grouped by project.
                </p>

                <div className="h-80 mt-6">
                  {workloadChartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-500">
                      No workload data available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={workloadChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="project" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="hours"
                          name="Hours Worked"
                          fill="#16a34a"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">
                    Recent Reports / Activity Feed
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Latest reports submitted by team members.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm">
                      <tr>
                        <th className="px-6 py-4 font-medium">Member</th>
                        <th className="px-6 py-4 font-medium">Project</th>
                        <th className="px-6 py-4 font-medium">Week</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {!summary?.recentReports ||
                      summary.recentReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No recent reports found.
                          </td>
                        </tr>
                      ) : (
                        summary.recentReports.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {report.user?.name || "N/A"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-700">
                              {report.project?.name || "N/A"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-700">
                              {report.weekStartDate} to {report.weekEndDate}
                            </td>

                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700">
                                <CheckCircle2 size={13} />
                                SUBMITTED
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ManagerDashboard;