import { useState } from "react";
import {
  useListarMunicipiosFavoritos,
  useListarComparacoesSalvas,
  useCarregarComparacaoSalva,
  useDeletarComparacaoSalva,
} from "../lib/hooks";
import { useNavigate } from "react-router-dom";

interface MunicipioFavorito {
  id: number;
  municipioId: number;
  municipioNome: string;
  estadoId: number;
  estadoSigla: string;
  estadoNome: string;
  adicionadoEm: string;
}

interface ComparacaoSalva {
  id: number;
  titulo: string;
  descricao: string | null;
  municipio1Nome: string;
  municipio1Estado: string;
  municipio2Nome: string;
  municipio2Estado: string;
  ano: number;
  totalIndicadores: number;
  salvaEm: Date;
  atualizadaEm: Date;
}

const FavoritosPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"municipios" | "comparacoes">(
    "municipios"
  );

  // Hooks para municípios favoritos
  const { data: favoritosData, isLoading: loadingFavoritos } =
    useListarMunicipiosFavoritos();

  // Hooks para comparações salvas
  const { data: comparacoesData, isLoading: loadingComparacoes } =
    useListarComparacoesSalvas();
  const carregarComparacaoMutation = useCarregarComparacaoSalva();
  const deletarComparacaoMutation = useDeletarComparacaoSalva();

  const municipiosFavoritos = favoritosData?.favoritos || [];
  const comparacoesSalvas = comparacoesData?.comparacoes || [];

  const handleCarregarComparacao = async (comparacao: ComparacaoSalva) => {
    try {
      const result = await carregarComparacaoMutation.mutateAsync({
        comparacaoId: comparacao.id,
      });

      if (result.success && result.comparacao) {
        // Armazenar dados da comparação no localStorage para carregar na página de comparação
        localStorage.setItem(
          "comparacao-carregada",
          JSON.stringify({
            municipio1: result.comparacao.municipio1,
            municipio2: result.comparacao.municipio2,
            ano: result.comparacao.ano,
            dadosComparacao: result.comparacao.dadosComparacao,
            titulo: result.comparacao.titulo,
            carregadaEm: new Date().toISOString(),
          })
        );

        // Navegar para a página de comparação
        navigate("/comparar?carregada=true");
      }
    } catch (error) {
      console.error("Erro ao carregar comparação:", error);
    }
  };

  const handleDeletarComparacao = async (
    comparacaoId: number,
    titulo: string
  ) => {
    if (
      window.confirm(`Tem certeza que deseja deletar a comparação "${titulo}"?`)
    ) {
      try {
        await deletarComparacaoMutation.mutateAsync({ comparacaoId });
      } catch (error) {
        console.error("Erro ao deletar comparação:", error);
      }
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meus Favoritos
          </h1>
          <p className="text-gray-600">
            Gerencie seus municípios favoritos e comparações salvas
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("municipios")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "municipios"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                🏛️ Municípios Favoritos ({municipiosFavoritos.length})
              </button>
              <button
                onClick={() => setActiveTab("comparacoes")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "comparacoes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                📊 Comparações Salvas ({comparacoesSalvas.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "municipios" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Municípios Favoritos
                </h2>
              </div>

              {loadingFavoritos ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Carregando favoritos...
                  </span>
                </div>
              ) : municipiosFavoritos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏛️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum município favorito
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Adicione municípios aos favoritos para acessá-los
                    rapidamente
                  </p>
                  <button
                    onClick={() => navigate("/estados")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Explorar Municípios
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {municipiosFavoritos.map((favorito: MunicipioFavorito) => (
                    <div
                      key={favorito.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {favorito.municipioNome}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {favorito.estadoNome} ({favorito.estadoSigla})
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Adicionado em {formatDate(favorito.adicionadoEm)}
                          </p>
                        </div>
                        <button className="text-red-500 hover:text-red-700 transition-colors ml-2">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "comparacoes" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Comparações Salvas
                </h2>
              </div>

              {loadingComparacoes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Carregando comparações...
                  </span>
                </div>
              ) : comparacoesSalvas.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma comparação salva
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Salve suas comparações para acessá-las posteriormente
                  </p>
                  <button
                    onClick={() => navigate("/comparar")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Fazer Comparação
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {comparacoesSalvas.map((comparacao: ComparacaoSalva) => (
                    <div
                      key={comparacao.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {comparacao.titulo}
                          </h3>

                          {comparacao.descricao && (
                            <p className="text-gray-600 mb-3">
                              {comparacao.descricao}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-blue-50 p-3 rounded-md">
                              <h4 className="font-medium text-blue-900 mb-1">
                                Município 1
                              </h4>
                              <p className="text-blue-700">
                                {comparacao.municipio1Nome},{" "}
                                {comparacao.municipio1Estado}
                              </p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-md">
                              <h4 className="font-medium text-green-900 mb-1">
                                Município 2
                              </h4>
                              <p className="text-green-700">
                                {comparacao.municipio2Nome},{" "}
                                {comparacao.municipio2Estado}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span>📅 Ano: {comparacao.ano}</span>
                            <span>
                              📈 {comparacao.totalIndicadores} indicadores
                            </span>
                            <span>
                              💾 Salva em {formatDate(comparacao.salvaEm)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleCarregarComparacao(comparacao)}
                            disabled={carregarComparacaoMutation.isPending}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                          >
                            {carregarComparacaoMutation.isPending
                              ? "..."
                              : "🔍 Carregar"}
                          </button>
                          <button
                            onClick={() =>
                              handleDeletarComparacao(
                                comparacao.id,
                                comparacao.titulo
                              )
                            }
                            disabled={deletarComparacaoMutation.isPending}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:bg-gray-400"
                          >
                            {deletarComparacaoMutation.isPending
                              ? "..."
                              : "🗑️ Deletar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritosPage;
