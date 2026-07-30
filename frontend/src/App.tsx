/**
 * Root SPA shell: shows auth screens until a JWT session exists.
 */
import { AuthProvider, useAuth } from "./services/auth";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";

function AppContent() {
  const { token } = useAuth();
  return token ? <DashboardPage /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
