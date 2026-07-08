import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";

function CreateReport() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    weekStartDate: "",
    weekEndDate: "",
    projectId: "",
    tasksCompleted: "",
    tasksPlanned: "",
    blockers: "",
    hoursWorked: "",
    notes: "",
  });

  const fetchAssignedProjects = async () => {
    try {
      const response = await axiosInstance.get("/projects/my-assigned");
      setProjects(response.data.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load assigned projects"
      );
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchAssignedProjects();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await axiosInstance.post("/reports", {
        ...formData,
        projectId: Number(formData.projectId),
        hoursWorked: formData.hoursWorked
          ? Number(formData.hoursWorked)
          : null,
      });

      navigate("/team/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/team/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">
              Create Weekly Report
            </h1>
            <p className="text-slate-500 mt-1">
              Add your weekly progress, plans, blockers, and working hours.
            </p>
          </div>

          {error && (
            <div className="mx-6 mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Week Start Date
                </label>
                <input
                  type="date"
                  name="weekStartDate"
                  value={formData.weekStartDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Week End Date
                </label>
                <input
                  type="date"
                  name="weekEndDate"
                  value={formData.weekEndDate}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Project
              </label>

              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 bg-white"
                required
              >
                <option value="">
                  {loadingProjects
                    ? "Loading projects..."
                    : "Select assigned project"}
                </option>

                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {!loadingProjects && projects.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  No assigned projects found. Ask your manager/admin to assign
                  you to a project.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tasks Completed
              </label>
              <textarea
                name="tasksCompleted"
                value={formData.tasksCompleted}
                onChange={handleChange}
                rows="5"
                placeholder="Example: Completed login UI, connected report API, fixed validation bugs..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tasks Planned
              </label>
              <textarea
                name="tasksPlanned"
                value={formData.tasksPlanned}
                onChange={handleChange}
                rows="5"
                placeholder="Example: Build manager dashboard, add charts, improve UI responsiveness..."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Blockers
              </label>
              <textarea
                name="blockers"
                value={formData.blockers}
                onChange={handleChange}
                rows="3"
                placeholder="Mention any blockers. Leave empty if none."
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={formData.hoursWorked}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="Example: 20"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Notes / Links
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional notes or links"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate("/team/dashboard")}
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting || projects.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={18} />
                {submitting ? "Saving..." : "Save Draft"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default CreateReport;