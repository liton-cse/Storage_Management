import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import VerifyResetCode from "../pages/Auth/VerifyResetCode";
import ResetPassword from "../pages/Auth/ResetPassword";
import Home from "../pages/ButtomNavigationPage/Home";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Favourite from "../pages/ButtomNavigationPage/Favourite";
import Calender from "../pages/ButtomNavigationPage/Calender";
import Profile from "../pages/ButtomNavigationPage/Profile";
import Folder from "../pages/Menu Page/Folder";
import ImagesFile from "../pages/Menu Page/Images";
import PdfFile from "../pages/Menu Page/Pdf";
import Button from "../components/Button";
import Note from "../pages/Menu Page/Note";
import EditProfile from "../pages/ButtomNavigationPage/EditProfile";
import Setting from "../pages/ButtomNavigationPage/Settings";
import ChangePassword from "../pages/ButtomNavigationPage/ChangePassword";
import Support from "../pages/ButtomNavigationPage/Support";
import TermsAndCondition from "../pages/ButtomNavigationPage/TermsAndCondition";
import PrivacyPolicy from "../pages/ButtomNavigationPage/PrivacyPolicy";
import About from "../pages/ButtomNavigationPage/About";
import NotePad from "../component/Notepad";
import { useAuth } from "../context/AuthContext";

function AppRouter() {
  const { user } = useAuth();
  return (
    <div>
      <header>
        <Header />
      </header>
      <main>
        <Routes>
          {/* Public Routes */}
          {user ? (
            <Route path="/" element={<Home />} />
          ) : (
            <Route path="/" element={<Login />} />
          )}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-code" element={<VerifyResetCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorite"
            element={
              <ProtectedRoute>
                <Favourite />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calender />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folder/:id"
            element={
              <ProtectedRoute>
                <Folder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folder"
            element={
              <ProtectedRoute>
                <Folder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/images"
            element={
              <ProtectedRoute>
                <ImagesFile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf"
            element={
              <ProtectedRoute>
                <PdfFile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Note />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute>
                <Setting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change/password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/terms/condition"
            element={
              <ProtectedRoute>
                <TermsAndCondition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy/policy"
            element={
              <ProtectedRoute>
                <PrivacyPolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notepad"
            element={
              <ProtectedRoute>
                <NotePad />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:id"
            element={
              <ProtectedRoute>
                <NotePad />
              </ProtectedRoute>
            }
          />
          {/* <Route path="/share" element={<ShareButton />} /> */}
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default AppRouter;
