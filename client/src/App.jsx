import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyPage from "./pages/VerifyPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import CreatePollPage from "./pages/CreatePollPage.jsx";
import PollManagePage from "./pages/PollManagePage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import PublicPollPage from "./pages/PublicPollPage.jsx";

function Layout() {
  return (
    <div className="shell">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/polls/new"
              element={
                <ProtectedRoute>
                  <CreatePollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/polls/:pollId"
              element={
                <ProtectedRoute>
                  <PollManagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/polls/:pollId/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/p/:shareToken" element={<PublicPollPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
