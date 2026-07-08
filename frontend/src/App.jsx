import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import TeamDashboard from "./pages/TeamDashboard";
import CreateReport from "./pages/CreateReport";
import MyReports from "./pages/MyReports";
import TeamProjects from "./pages/TeamProjects";

import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerReports from "./pages/ManagerReports";
import ManagerProjects from "./pages/ManagerProjects";
import ManagerUsers from "./pages/ManagerUsers";
import AIAssistant from "./pages/AIAssistant";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "TEAM_MEMBER") {
    return <Navigate to="/team/dashboard" replace />;
  }

  return <Navigate to="/manager/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Team Member Routes */}
      <Route
        path="/team/dashboard"
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <TeamDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team/create-report"
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <CreateReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team/reports"
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <MyReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/team/projects"
        element={
          <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
            <TeamProjects />
          </ProtectedRoute>
        }
      />

      {/* Manager/Admin Routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerReports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/projects"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerProjects />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/users"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <ManagerUsers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/ai"
        element={
          <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
            <AIAssistant />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;