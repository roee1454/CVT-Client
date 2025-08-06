import { Routes, Route } from "react-router-dom"
import Containers from "./pages/containers-page"
import Navbar from "./components/navbar"
import SoftwarePage from "./pages/software-page"
import { AdminProtectedRoute } from "./context/auth-context"
import UsersPage from "./pages/users-page"
import GuidesPage from "./pages/guides-page"
import MembersDashboard from "./pages/members-dashboard"
import SystemPage from "./pages/system-page"

export default function App() {
  return (
    <div className="p-2.5 md:px-10 lg:px-20">
      <Navbar />
      <Routes>
        <Route index element={<MembersDashboard />} />
        <Route path="/users" element={<AdminProtectedRoute><UsersPage /></AdminProtectedRoute>} />
        <Route path="/guides" element={<AdminProtectedRoute><GuidesPage /></AdminProtectedRoute>} />
        <Route path="/systems" element={<AdminProtectedRoute><SystemPage /></AdminProtectedRoute>} />
        <Route path="/software" element={<AdminProtectedRoute><SoftwarePage /></AdminProtectedRoute>} />
        <Route path="/containers" element={<AdminProtectedRoute><Containers /></AdminProtectedRoute>} />
      </Routes>
    </div>
  )
}
