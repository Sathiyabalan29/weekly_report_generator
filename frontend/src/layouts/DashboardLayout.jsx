import { NavLink, useNavigate } from "react-router-dom";
import {
  BarChart3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isTeamMember = user?.role === "TEAM_MEMBER";

  const teamLinks = [
    {
      label: "Dashboard",
      path: "/team/dashboard",
      icon: LayoutDashboard,
    },
    {
    label: "Create Report",
    path: "/team/create-report",
    icon: FileText,
    },
    {
      label: "My Reports",
      path: "/team/reports",
      icon: FileText,
    },
    {
      label: "Projects",
      path: "/team/projects",
      icon: FolderKanban,
    },
  ];

  const managerLinks = [
    {
      label: "Dashboard",
      path: "/manager/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Reports",
      path: "/manager/reports",
      icon: FileText,
    },
    {
      label: "Projects",
      path: "/manager/projects",
      icon: FolderKanban,
    },
    {
      label: "Users",
      path: "/manager/users",
      icon: Users,
    },
    {
      label: "AI Assistant",
      path: "/manager/ai",
      icon: Sparkles,
    },
  ];

  const links = isTeamMember ? teamLinks : managerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-slate-950 text-white flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="font-bold leading-tight">Weekly Report</h1>
              <p className="text-xs text-slate-400">Team Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {links.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-900 rounded-xl p-4 mb-3">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors duration-200"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72">
        <div className="lg:hidden bg-slate-950 text-white p-4 flex justify-between items-center">
          <div>
            <h1 className="font-bold">Weekly Report</h1>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        <div className="p-5 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;