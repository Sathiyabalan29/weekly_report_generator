import { useEffect, useState } from "react";
import { FolderKanban, Plus, RefreshCw, Save, Trash2, Users } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

function ManagerProjects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const selectedProject = projects.find(
    (project) => String(project.id) === String(selectedProjectId)
  );

  const resetForm = () => {
    setSelectedProjectId("");
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
    setProjectMembers([]);
    setSelectedMemberIds([]);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/projects");
      setProjects(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axiosInstance.get("/users?role=TEAM_MEMBER");
      setTeamMembers(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      setMembersLoading(true);

      const response = await axiosInstance.get(`/projects/${projectId}/members`);
      setProjectMembers(response.data.data || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch project members");
      setProjectMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (!selectedProject) {
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
      setProjectMembers([]);
      setSelectedMemberIds([]);
      return;
    }

    setFormData({
      name: selectedProject.name || "",
      description: selectedProject.description || "",
      isActive: selectedProject.isActive !== false,
    });

    fetchProjectMembers(selectedProject.id);
    setSelectedMemberIds([]);
  }, [selectedProjectId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
      };

      if (selectedProject) {
        await axiosInstance.put(`/projects/${selectedProject.id}`, payload);
        setSuccess("Project updated successfully");
      } else {
        const response = await axiosInstance.post("/projects", payload);
        setSuccess("Project created successfully");
        setSelectedProjectId(String(response.data.data.id));
      }

      await fetchProjects();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  const handleAssignMembers = async () => {
    if (!selectedProject) return;

    if (selectedMemberIds.length === 0) {
      setError("Select at least one team member to add to the project");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      await axiosInstance.post(`/projects/${selectedProject.id}/assign-users`, {
        userIds: selectedMemberIds.map((memberId) => Number(memberId)),
      });

      setSuccess("Team members assigned successfully");
      setSelectedMemberIds([]);
      await fetchProjectMembers(selectedProject.id);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to assign members");
    } finally {
      setAssigning(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    const confirmed = window.confirm(
      `Delete ${selectedProject.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await axiosInstance.delete(`/projects/${selectedProject.id}`);
      setSuccess("Project deleted successfully");
      resetForm();
      await fetchProjects();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-blue-600 font-semibold">Project Management</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Projects</h1>
            <p className="text-slate-500 mt-2">
              Create projects, update project details, and assign team members.
            </p>
          </div>

          <button
            onClick={fetchProjects}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-white"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {!isAdmin && (
          <div className="mt-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm">
            You are logged in as Manager. You can create and update projects,
            but only Admin can delete them.
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
                <p className="text-sm text-slate-500">Total Projects</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{projects.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Active Projects</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {projects.filter((project) => project.isActive).length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Assigned Members</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {projectMembers.length}
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-sm text-slate-500">Team Members</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              {teamMembers.length}
            </h3>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Project List
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Select a project to edit its details or assign members.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
              >
                <Plus size={16} />
                New Project
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No projects found yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Description</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className={`hover:bg-slate-50 ${
                          String(project.id) === String(selectedProjectId)
                            ? "bg-blue-50/40"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {project.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            ID: {project.id}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              project.isActive
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {project.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                          {project.description || "No description added."}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedProjectId(String(project.id))}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Save size={18} className="text-blue-600" />
                <h2 className="font-bold text-slate-900">
                  {selectedProject ? "Edit Project" : "Create Project"}
                </h2>
              </div>

              <form onSubmit={handleProjectSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm resize-none"
                    placeholder="Describe the project"
                  />
                </div>

                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Project is active
                </label>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : selectedProject ? "Update Project" : "Create Project"}
                  </button>

                  {selectedProject && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users size={18} className="text-blue-600" />
                <h2 className="font-bold text-slate-900">Assign Members</h2>
              </div>

              {!selectedProject ? (
                <p className="text-sm text-slate-500">
                  Select a project first to manage assignments.
                </p>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">
                    Add team members to {selectedProject.name}. Existing members are shown below.
                  </p>

                  <div className="mb-5 max-h-56 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3">
                    {teamMembers.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No team members found.
                      </p>
                    ) : (
                      teamMembers.map((member) => {
                        const isAssigned = projectMembers.some(
                          (projectMember) =>
                            String(projectMember.user?.id || projectMember.userId) ===
                            String(member.id)
                        );

                        return (
                          <label
                            key={member.id}
                            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 border ${
                              isAssigned
                                ? "border-green-200 bg-green-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-medium text-slate-900">
                                {member.name}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {member.email}
                              </span>
                            </span>

                            <input
                              type="checkbox"
                              checked={selectedMemberIds.includes(String(member.id))}
                              onChange={(event) => {
                                const nextChecked = event.target.checked;

                                setSelectedMemberIds((current) =>
                                  nextChecked
                                    ? [...current, String(member.id)]
                                    : current.filter(
                                        (memberId) => String(memberId) !== String(member.id)
                                      )
                                );
                              }}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </label>
                        );
                      })
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAssignMembers}
                    disabled={assigning || membersLoading}
                    className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                  >
                    {assigning ? "Assigning..." : "Assign Selected Members"}
                  </button>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                      Currently Assigned
                    </p>

                    {membersLoading ? (
                      <p className="text-sm text-slate-500">Loading members...</p>
                    ) : projectMembers.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No members assigned yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {projectMembers.map((projectMember) => (
                          <div
                            key={`${projectMember.projectId}-${projectMember.userId}`}
                            className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {projectMember.user?.name || "Unknown user"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {projectMember.user?.email || "No email"}
                              </p>
                            </div>
                            <span className="text-xs text-slate-500">
                              Member
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleDeleteProject}
                      disabled={saving}
                      className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 text-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      Delete Project
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ManagerProjects;