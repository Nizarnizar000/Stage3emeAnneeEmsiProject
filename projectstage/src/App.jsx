import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import CalendrierParticipant from "./pages/CalendrierParticipant";
import Dashboard from "./pages/Dashboard";
import ReunionsAdmin from "./pages/ReunionsAdmin";
import SallesAdmin from "./pages/SallesAdmin";
import ResponsablesAdmin from "./pages/ResponsablesAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import ParticipantsAdmin from "./pages/ParticipantsAdmin";
import PlanificationAdmin from "./pages/PlanificationAdmin";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/calendrier" element={<CalendrierParticipant />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE"]}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
        path="/admin/planification"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE"]}>
            <AdminLayout>
              <PlanificationAdmin />
            </AdminLayout>
          </ProtectedRoute>
       }
      />
        <Route
          path="/admin/participants"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE"]}>
              <AdminLayout>
                <ParticipantsAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }       
        />
        <Route
          path="/admin/responsables"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout>
                <ResponsablesAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/salles"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE"]}>
              <AdminLayout>
                <SallesAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reunions"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "RESPONSABLE"]}>
              <AdminLayout>
                <ReunionsAdmin />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;