import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import EstadosPage from "./components/EstadosPage";
import CompararPage from "./components/CompararPage";
import CepDddPage from "./components/CepDddPage";
import FavoritosPage from "./components/FavoritosPage";
import ErrorBoundary from "./components/ErrorBoundary";

// Criar o QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/estados" element={<EstadosPage />} />
                <Route path="/comparar" element={<CompararPage />} />
                <Route path="/cep" element={<CepDddPage />} />
                <Route path="/favoritos" element={<FavoritosPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;
