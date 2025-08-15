import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

const EstadosPage = () => {
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegiao, setSelectedRegiao] = useState<string>("");

  // Simular dados dos estados (quando a API estiver funcionando)
  useEffect(() => {
    const mockEstados: Estado[] = [
      {
        id: 35,
        sigla: "SP",
        nome: "São Paulo",
        regiao: { id: 3, sigla: "SE", nome: "Sudeste" },
      },
      {
        id: 33,
        sigla: "RJ",
        nome: "Rio de Janeiro",
        regiao: { id: 3, sigla: "SE", nome: "Sudeste" },
      },
      {
        id: 31,
        sigla: "MG",
        nome: "Minas Gerais",
        regiao: { id: 3, sigla: "SE", nome: "Sudeste" },
      },
      {
        id: 32,
        sigla: "ES",
        nome: "Espírito Santo",
        regiao: { id: 3, sigla: "SE", nome: "Sudeste" },
      },
      {
        id: 41,
        sigla: "PR",
        nome: "Paraná",
        regiao: { id: 4, sigla: "S", nome: "Sul" },
      },
      {
        id: 42,
        sigla: "SC",
        nome: "Santa Catarina",
        regiao: { id: 4, sigla: "S", nome: "Sul" },
      },
      {
        id: 43,
        sigla: "RS",
        nome: "Rio Grande do Sul",
        regiao: { id: 4, sigla: "S", nome: "Sul" },
      },
      {
        id: 51,
        sigla: "MT",
        nome: "Mato Grosso",
        regiao: { id: 5, sigla: "CO", nome: "Centro-Oeste" },
      },
      {
        id: 52,
        sigla: "MS",
        nome: "Mato Grosso do Sul",
        regiao: { id: 5, sigla: "CO", nome: "Centro-Oeste" },
      },
      {
        id: 53,
        sigla: "GO",
        nome: "Goiás",
        regiao: { id: 5, sigla: "CO", nome: "Centro-Oeste" },
      },
      {
        id: 50,
        sigla: "DF",
        nome: "Distrito Federal",
        regiao: { id: 5, sigla: "CO", nome: "Centro-Oeste" },
      },
      {
        id: 11,
        sigla: "RO",
        nome: "Rondônia",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 12,
        sigla: "AC",
        nome: "Acre",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 13,
        sigla: "AM",
        nome: "Amazonas",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 14,
        sigla: "RR",
        nome: "Roraima",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 15,
        sigla: "PA",
        nome: "Pará",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 16,
        sigla: "AP",
        nome: "Amapá",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 17,
        sigla: "TO",
        nome: "Tocantins",
        regiao: { id: 1, sigla: "N", nome: "Norte" },
      },
      {
        id: 21,
        sigla: "MA",
        nome: "Maranhão",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 22,
        sigla: "PI",
        nome: "Piauí",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 23,
        sigla: "CE",
        nome: "Ceará",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 24,
        sigla: "RN",
        nome: "Rio Grande do Norte",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 25,
        sigla: "PB",
        nome: "Paraíba",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 26,
        sigla: "PE",
        nome: "Pernambuco",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 27,
        sigla: "AL",
        nome: "Alagoas",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 28,
        sigla: "SE",
        nome: "Sergipe",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
      {
        id: 29,
        sigla: "BA",
        nome: "Bahia",
        regiao: { id: 2, sigla: "NE", nome: "Nordeste" },
      },
    ];

    setTimeout(() => {
      setEstados(mockEstados);
      setLoading(false);
    }, 1000);
  }, []);

  const regioes = Array.from(
    new Set(estados.map((estado) => estado.regiao.nome))
  ).sort();

  const filteredEstados = estados.filter((estado) => {
    const matchesSearch =
      estado.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estado.sigla.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegiao =
      selectedRegiao === "" || estado.regiao.nome === selectedRegiao;
    return matchesSearch && matchesRegiao;
  });

  const handleEstadoClick = (estado: Estado) => {
    // Navegar para a página de municípios do estado
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao carregar
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Estados do Brasil
          </h1>
          <p className="text-gray-600">
            Explore os 27 estados brasileiros e suas características regionais
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Buscar Estado
              </label>
              <input
                type="text"
                id="search"
                placeholder="Digite o nome ou sigla do estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="regiao"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Região
              </label>
              <select
                id="regiao"
                value={selectedRegiao}
                onChange={(e) => setSelectedRegiao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as regiões</option>
                {regioes.map((regiao) => (
                  <option key={regiao} value={regiao}>
                    {regiao}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {estados.length}
            </div>
            <div className="text-sm text-gray-600">Total de Estados</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {regioes.length}
            </div>
            <div className="text-sm text-gray-600">Regiões</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredEstados.length}
            </div>
            <div className="text-sm text-gray-600">Resultados</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">5.570+</div>
            <div className="text-sm text-gray-600">Municípios</div>
          </div>
        </div>

        {/* Lista de Estados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEstados.map((estado) => (
            <div
              key={estado.id}
              onClick={() => handleEstadoClick(estado)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <span className="text-xl font-bold text-blue-600">
                    {estado.sigla}
                  </span>
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {estado.regiao.sigla}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {estado.nome}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Região: {estado.regiao.nome}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">ID: {estado.id}</span>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium mr-1">
                    Ver municípios
                  </span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há resultados */}
        {filteredEstados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum estado encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros de busca para encontrar o que procura.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstadosPage;
