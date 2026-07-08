import { useEffect, useState } from "react";
import { Bot, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";

function AIAssistant() {
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({
    weekStartDate: "",
    weekEndDate: "",
    projectId: "",
    userId: "",
  });
  const [question, setQuestion] = useState(
    "Summarize the main progress, blockers, and risks for this team."
  );
  const [answer, setAnswer] = useState("");
  const [reportsAnalyzed, setReportsAnalyzed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState("");

  const fetchFilterData = async () => {
    try {
      setLoadingFilters(true);

      const [projectsResponse, usersResponse] = await Promise.all([
        axiosInstance.get("/projects"),
        axiosInstance.get("/users?role=TEAM_MEMBER"),
      ]);

      setProjects(projectsResponse.data.data || []);
      setTeamMembers(usersResponse.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load filter data");
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, []);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const buildQuery = () => {
    const query = new URLSearchParams();

    if (filters.weekStartDate) query.append("weekStartDate", filters.weekStartDate);
    if (filters.weekEndDate) query.append("weekEndDate", filters.weekEndDate);
    if (filters.projectId) query.append("projectId", filters.projectId);
    if (filters.userId) query.append("userId", filters.userId);

    const queryString = query.toString();
    return queryString ? `?${queryString}` : "";
  };

  const requestSummary = async (endpoint) => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(`${endpoint}${buildQuery()}`);
      setAnswer(response.data.data?.summary || response.data.data?.answer || "");
      setReportsAnalyzed(response.data.data?.reportsAnalyzed || 0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.post("/ai/chat", {
        question,
        weekStartDate: filters.weekStartDate || undefined,
        weekEndDate: filters.weekEndDate || undefined,
        projectId: filters.projectId || undefined,
        userId: filters.userId || undefined,
      });

      setAnswer(response.data.data?.answer || "");
      setReportsAnalyzed(response.data.data?.reportsAnalyzed || 0);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">AI Assistant</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Weekly Report Insights
            </h1>
            <p className="text-slate-500 mt-2">
              Ask questions about submitted reports or generate manager-ready summaries.
            </p>
          </div>

          <button
            onClick={fetchFilterData}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white"
          >
            <RefreshCw size={17} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Projects</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {projects.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Team Members</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {teamMembers.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Reports Analyzed</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {reportsAnalyzed}
            </h3>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 xl:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <Bot size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Ask the Assistant</h2>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Your Question
                </label>
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows="5"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm resize-none"
                  placeholder="Ask about team progress, blockers, workload, or risks"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Week End Date
                  </label>
                  <input
                    type="date"
                    name="weekEndDate"
                    value={filters.weekEndDate}
                    onChange={handleFilterChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
                    Team Member
                  </label>
                  <select
                    name="userId"
                    value={filters.userId}
                    onChange={handleFilterChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm bg-white"
                  >
                    <option value="">All Members</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => requestSummary("/ai/team-summary")}
                  disabled={loading || loadingFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <Sparkles size={16} />
                  Team Summary
                </button>

                <button
                  type="button"
                  onClick={() => requestSummary("/ai/blocker-summary")}
                  disabled={loading || loadingFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <WandSparkles size={16} />
                  Blocker Summary
                </button>

                <button
                  type="submit"
                  disabled={loading || loadingFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Bot size={16} />
                  Ask Question
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles size={18} className="text-blue-600" />
              <h2 className="font-bold text-slate-900">Response</h2>
            </div>

            {loading ? (
              <div className="text-sm text-slate-500">Generating response...</div>
            ) : answer ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-6">
                  {answer}
                </div>
                <div className="text-xs text-slate-500">
                  Reports analyzed: {reportsAnalyzed}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Use a quick summary button or ask a custom question to see AI-generated insights here.
              </div>
            )}

            {loadingFilters && (
              <div className="mt-5 text-xs text-slate-500">Loading filter data...</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AIAssistant;