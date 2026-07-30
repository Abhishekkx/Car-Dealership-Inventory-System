import { AuthProvider, useAuth } from "./services/auth";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";

function AppContent() {
  const { token } = useAuth();
  return token ? <HomePage /> : <AuthPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
