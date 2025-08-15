import { Link } from "react-router-dom";
import StatsCard from "./StatsCard";
import InfoCard from "./InfoCard";

const HomePage = () => {
  const features = [
    {
      title: "🗺️ Estados Brasileiros",
      description:
        "Navegue pelos 26 estados e o Distrito Federal. Explore dados demográficos, econômicos e sociais de cada região.",
      icon: (
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      link: "/estados",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "📊 Comparador de Indicadores",
      description:
        "Faça comparações detalhadas entre municípios usando indicadores socioeconômicos oficiais do IBGE.",
      icon: (
        <svg
          className="w-8 h-8 text-purple-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      link: "/comparar",
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "📍 Consulta CEP & DDD",
      description:
        "Busque informações completas de endereços por CEP e consulte códigos de área (DDD) de qualquer região.",
      icon: (
        <svg
          className="w-8 h-8 text-orange-600"
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
      ),
      link: "/cep",
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "⭐ Meus Favoritos",
      description:
        "Acesse rapidamente seus municípios favoritos e comparações salvas. Gerencie sua biblioteca pessoal.",
      icon: (
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      link: "/favoritos",
      color: "bg-yellow-50 border-yellow-200",
    },
  ];

  const stats = [
    { label: "Estados", value: "27", icon: "🇧🇷" },
    { label: "Municípios", value: "5.570+", icon: "🏙️" },
    { label: "Indicadores", value: "100+", icon: "📊" },
    { label: "APIs Integradas", value: "2", icon: "🔌" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              📊 Comparador de
              <br className="sm:hidden" />
              <span className="text-yellow-300"> Indicadores Municipais</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Explore, compare e analise{" "}
              <span className="font-semibold text-white">
                mais de 100 indicadores
              </span>{" "}
              de todos os municípios brasileiros com dados oficiais atualizados
              do IBGE
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
              <Link
                to="/estados"
                className="w-full sm:w-auto bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                🗺️ Explorar Estados
              </Link>
              <Link
                to="/comparar"
                className="w-full sm:w-auto border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                📈 Comparar Agora
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.label}
                value={stat.value}
                icon={<span className="text-2xl">{stat.icon}</span>}
                className="text-center"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            🚀 Funcionalidades Principais
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ferramentas completas para explorar, comparar e analisar dados
            municipais de todo o Brasil
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link} className="block group">
              <InfoCard
                title={feature.title}
                className={`${feature.color} border-2 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full group-hover:border-opacity-80`}
                icon={feature.icon}
                clickable
              >
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </InfoCard>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Acesse dados oficiais e faça análises comparativas entre municípios
            brasileiros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/estados"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Explorar Estados
            </Link>
            <Link
              to="/municipios"
              className="border-2 border-white text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Buscar Municípios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
