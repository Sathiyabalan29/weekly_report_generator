import { useEffect, useState } from "react";
import {
  FolderKanban,
  Info,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";

function TeamProjects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignedProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/projects/my-assigned");
      setProjects(response.data.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to fetch assigned projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">
              Assigned Work
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              My Assigned Projects
            </h1>
            <p className="text-slate-500 mt-2">
              These are the projects assigned to you by your manager or admin.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchAssignedProjects}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white"
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              onClick={() => navigate("/team/create-report")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              <Plus size={17} />
              Create Report
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
              Loading assigned projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban size={32} />
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-5">
                No Assigned Projects
              </h2>

              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                You are not assigned to any project yet. Ask your manager or
                admin to assign you to a project before creating a weekly
                report.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-blue-300 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FolderKanban size={24} />
                    </div>

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

                  <h3 className="text-lg font-bold text-slate-900 mt-5">
                    {project.name}
                  </h3>

                  <p className="text-sm text-slate-500 mt-2 min-h-12">
                    {project.description || "No description added for this project."}
                  </p>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Info size={15} />
                      Project ID: {project.id}
                    </div>

                    <button
                      onClick={() => navigate("/team/create-report")}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default TeamProjects;