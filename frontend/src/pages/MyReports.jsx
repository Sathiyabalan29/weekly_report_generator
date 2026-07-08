import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Trash2,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/reports/my");
      setReports(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmitReport = async (reportId) => {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit this report? You cannot edit it after submission."
    );

    if (!confirmSubmit) return;

    try {
      setActionLoading(true);
      await axiosInstance.patch(`/reports/${reportId}/submit`);
      await fetchReports();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this draft report?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      await axiosInstance.delete(`/reports/${reportId}`);
      await fetchReports();
      setSelectedReport(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete report");
    } finally {
      setActionLoading(false);
    }
  };

  const draftReports = reports.filter((report) => report.status === "DRAFT");
  const submittedReports = reports.filter(
    (report) => report.status === "SUBMITTED"
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Weekly Reports
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              My Reports
            </h1>
            <p className="text-slate-500 mt-2">
              View, submit, and manage your weekly reports.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
              <p className="text-xs text-slate-500">Drafts</p>
              <h3 className="text-xl font-bold text-slate-900">
                {draftReports.length}
              </h3>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
              <p className="text-xs text-slate-500">Submitted</p>
              <h3 className="text-xl font-bold text-slate-900">
                {submittedReports.length}
              </h3>
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
                Report History
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Your weekly report submissions and drafts
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
                      <th className="px-6 py-4 font-medium">Week</th>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Hours</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {reports.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No reports found.
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-slate-400"
                              />
                              <span>
                                {report.weekStartDate} to {report.weekEndDate}
                              </span>
                            </div>
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

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedReport(report)}
                                className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>

                              {report.status === "DRAFT" && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleSubmitReport(report.id)
                                    }
                                    disabled={actionLoading}
                                    className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center disabled:opacity-60"
                                    title="Submit"
                                  >
                                    <Send size={16} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteReport(report.id)
                                    }
                                    disabled={actionLoading}
                                    className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center disabled:opacity-60"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
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
                Select a report to view full details
              </p>
            </div>

            {!selectedReport ? (
              <div className="p-6 text-sm text-slate-500">
                No report selected.
              </div>
            ) : (
              <div className="p-6 space-y-5">
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
                  <p className="text-xs text-slate-500">Notes</p>
                  <p className="text-sm text-slate-700 mt-1">
                    {selectedReport.notes || "No notes"}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <span
                    className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedReport.status === "SUBMITTED"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {selectedReport.status}
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

export default MyReports;