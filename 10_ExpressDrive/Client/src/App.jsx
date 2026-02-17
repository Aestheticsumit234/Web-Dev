import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DirectoryView from "./DirectoryView";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route
        path="/"
        element={
          isAuthenticated ? <DirectoryView /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/directory/:dirId"
        element={
          isAuthenticated ? <DirectoryView /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
