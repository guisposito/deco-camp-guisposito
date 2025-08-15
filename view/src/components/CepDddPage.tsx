import { useState } from "react";

interface CepInfo {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

interface DddInfo {
  state: string;
  cities: string[];
  ddd: string;
}

const CepDddPage = () => {
  const [activeTab, setActiveTab] = useState<"cep" | "ddd">("cep");
  const [cepInput, setCepInput] = useState("");
  const [dddInput, setDddInput] = useState("");
  const [cepInfo, setCepInfo] = useState<CepInfo | null>(null);
  const [dddInfo, setDddInfo] = useState<DddInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cepInput.trim()) {
      setError("Digite um CEP válido");
      return;
    }

    setLoading(true);
    setError(null);
    setCepInfo(null);

    // Simular API call
    setTimeout(() => {
      try {
        // Mock data para demonstração
        const mockCepInfo: CepInfo = {
          cep: cepInput.replace(/\D/g, ""),
          state: "SP",
          city: "São Paulo",
          neighborhood: "Bela Vista",
          street: "Rua 7 de Abril",
          service: "correios",
          location: {
            type: "Point",
            coordinates: {
              longitude: "-46.6388",
              latitude: "-23.5489",
            },
          },
        };

        setCepInfo(mockCepInfo);
      } catch (err) {
        setError("Erro ao consultar CEP. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handleDddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dddInput.trim()) {
      setError("Digite um DDD válido");
      return;
    }

    const ddd = dddInput.replace(/\D/g, "");
    if (ddd.length !== 2) {
      setError("DDD deve ter 2 dígitos");
      return;
    }

    setLoading(true);
    setError(null);
    setDddInfo(null);

    // Simular API call
    setTimeout(() => {
      try {
        // Mock data para demonstração
        const mockDddInfo: DddInfo = {
          state: "São Paulo",
          cities: [
            "São Paulo",
            "Guarulhos",
            "Campinas",
            "Santo André",
            "Osasco",
          ],
          ddd: ddd,
        };

        setDddInfo(mockDddInfo);
      } catch (err) {
        setError("Erro ao consultar DDD. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const formatCep = (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length <= 5) {
      return cleaned;
    }
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCep(value);
    setCepInput(formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Consulta CEP e DDD
          </h1>
          <p className="text-gray-600">
            Consulte informações de CEPs e DDDs de todo o Brasil
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("cep")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "cep"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Consulta CEP
                </div>
              </button>
              <button
                onClick={() => setActiveTab("ddd")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "ddd"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Consulta DDD
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* CEP Tab */}
            {activeTab === "cep" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Consulta de CEP
                </h2>
                <p className="text-gray-600 mb-6">
                  Digite um CEP para obter informações completas do endereço
                </p>

                <form onSubmit={handleCepSubmit} className="max-w-md">
                  <div className="mb-4">
                    <label
                      htmlFor="cep"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      value={cepInput}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !cepInput.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Consultando...
                      </div>
                    ) : (
                      "Consultar CEP"
                    )}
                  </button>
                </form>

                {/* Resultado CEP */}
                {cepInfo && (
                  <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">
                      Resultado da Consulta
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            CEP:
                          </span>
                          <span className="ml-2 text-blue-900">
                            {cepInfo.cep}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Estado:
                          </span>
                          <span className="ml-2 text-blue-900">
                            {cepInfo.state}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Cidade:
                          </span>
                          <span className="ml-2 text-blue-900">
                            {cepInfo.city}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Bairro:
                          </span>
                          <span className="ml-2 text-blue-900">
                            {cepInfo.neighborhood}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Rua:
                          </span>
                          <span className="ml-2 text-blue-900">
                            {cepInfo.street}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Serviço:
                          </span>
                          <span className="ml-2 text-blue-900 capitalize">
                            {cepInfo.service}
                          </span>
                        </div>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-blue-700">
                            Coordenadas:
                          </span>
                          <div className="ml-2 text-blue-900 text-sm">
                            <div>
                              Lat: {cepInfo.location.coordinates.latitude}
                            </div>
                            <div>
                              Lng: {cepInfo.location.coordinates.longitude}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Copiar Endereço
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                        Ver no Mapa
                      </button>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
                        Adicionar aos Favoritos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DDD Tab */}
            {activeTab === "ddd" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Consulta de DDD
                </h2>
                <p className="text-gray-600 mb-6">
                  Digite um DDD para obter informações sobre o estado e cidades
                </p>

                <form onSubmit={handleDddSubmit} className="max-w-md">
                  <div className="mb-4">
                    <label
                      htmlFor="ddd"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      DDD
                    </label>
                    <input
                      type="text"
                      id="ddd"
                      value={dddInput}
                      onChange={(e) =>
                        setDddInput(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="11"
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !dddInput.trim()}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Consultando...
                      </div>
                    ) : (
                      "Consultar DDD"
                    )}
                  </button>
                </form>

                {/* Resultado DDD */}
                {dddInfo && (
                  <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">
                      Resultado da Consulta
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-green-700">
                          DDD:
                        </span>
                        <span className="ml-2 text-green-900 font-semibold">
                          {dddInfo.ddd}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-green-700">
                          Estado:
                        </span>
                        <span className="ml-2 text-green-900">
                          {dddInfo.state}
                        </span>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-green-700">
                          Cidades ({dddInfo.cities.length}):
                        </span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {dddInfo.cities.map((city, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                            >
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                        Copiar Informações
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Ver Municípios
                      </button>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
                        Adicionar aos Favoritos
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              💡 Sobre CEPs
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• CEPs são códigos de 8 dígitos</li>
              <li>• Formatos aceitos: 00000000 ou 00000-000</li>
              <li>• Dados fornecidos pela Brasil API</li>
              <li>• Inclui coordenadas geográficas</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              📞 Sobre DDDs
            </h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• DDDs são códigos de 2 dígitos</li>
              <li>• Vão de 11 a 99</li>
              <li>• Cada DDD pode ter múltiplas cidades</li>
              <li>• Útil para identificação regional</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CepDddPage;
