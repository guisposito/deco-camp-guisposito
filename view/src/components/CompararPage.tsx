import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useEstados,
  useMunicipiosDoEstado,
  useSendComparisonReport,
  useSalvarComparacao,
} from "../lib/hooks";

interface Municipio {
  id: number;
  nome: string;
  estado?: {
    id: number;
    sigla: string;
    nome: string;
  };
}

interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao:
    | {
        id: number;
        sigla: string;
        nome: string;
      }
    | string;
}

interface Comparacao {
  municipio1: {
    nome: string;
    valor: number | string;
    unidade: string;
  };
  municipio2: {
    nome: string;
    valor: number | string;
    unidade: string;
  };
  diferenca?: number;
  percentual?: number;
  indicador: {
    id: number;
    nome: string;
    ano: number;
  };
}

interface IndicadorComparacao {
  id: number;
  nome: string;
  categoria: string;
  municipio1: {
    valor: number;
    unidade: string;
  };
  municipio2: {
    valor: number;
    unidade: string;
  };
  diferenca: number;
  percentual: number;
  melhorMunicipio: string;
}

const CompararPageContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [municipio1, setMunicipio1] = useState<Municipio | null>(null);
  const [municipio2, setMunicipio2] = useState<Municipio | null>(null);
  const [estadoSelecionado1, setEstadoSelecionado1] = useState<Estado | null>(
    null
  );
  const [estadoSelecionado2, setEstadoSelecionado2] = useState<Estado | null>(
    null
  );
  const [buscaMunicipio1, setBuscaMunicipio1] = useState<string>("");
  const [buscaMunicipio2, setBuscaMunicipio2] = useState<string>("");
  const [indicadorId, setIndicadorId] = useState<string>("");
  const [ano, setAno] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [comparacao, setComparacao] = useState<Comparacao | null>(null);
  const [comparacaoCompleta, setComparacaoCompleta] = useState<
    IndicadorComparacao[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [comparacaoCarregada, setComparacaoCarregada] = useState<string | null>(
    null
  );
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Estados para salvar comparação
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");

  // Buscar estados e municípios via API
  const {
    data: estadosData,
    isLoading: loadingEstados,
    error: errorEstados,
  } = useEstados();
  const { data: municipiosData1, isLoading: loadingMunicipios1 } =
    useMunicipiosDoEstado(estadoSelecionado1?.id || null);
  const { data: municipiosData2, isLoading: loadingMunicipios2 } =
    useMunicipiosDoEstado(estadoSelecionado2?.id || null);

  // Hook para envio de relatório por email
  const sendComparisonReportMutation = useSendComparisonReport();

  // Hook para salvar comparação
  const salvarComparacaoMutation = useSalvarComparacao();

  const estados = estadosData?.estados || [];

  // Verificar se há uma comparação carregada do localStorage
  useEffect(() => {
    const carregada = searchParams.get("carregada");
    if (carregada === "true") {
      try {
        const comparacaoSalva = localStorage.getItem("comparacao-carregada");
        if (comparacaoSalva) {
          const dados = JSON.parse(comparacaoSalva);

          // Definir os municípios
          setMunicipio1({
            id: dados.municipio1.id,
            nome: dados.municipio1.nome,
            estado: {
              id: 0,
              sigla: "N/A",
              nome: dados.municipio1.estado,
            },
          });

          setMunicipio2({
            id: dados.municipio2.id,
            nome: dados.municipio2.nome,
            estado: {
              id: 0,
              sigla: "N/A",
              nome: dados.municipio2.estado,
            },
          });

          // Definir o ano
          setAno(dados.ano.toString());

          // Carregar os dados da comparação
          setComparacaoCompleta(dados.dadosComparacao || []);
          setComparacaoCarregada(dados.titulo);

          // Limpar o localStorage e remover o parâmetro da URL
          localStorage.removeItem("comparacao-carregada");
          setSearchParams({});
        }
      } catch (error) {
        // Erro ao carregar comparação salva
      }
    }
  }, [searchParams, setSearchParams]);
  const municipios1 = (municipiosData1?.municipios || []).map(
    (municipio: any) => ({
      ...municipio,
      estado: municipio.estado || {
        id: estadoSelecionado1?.id,
        nome: estadoSelecionado1?.nome,
        sigla: estadoSelecionado1?.sigla,
      },
    })
  );
  const municipios2 = (municipiosData2?.municipios || []).map(
    (municipio: any) => ({
      ...municipio,
      estado: municipio.estado || {
        id: estadoSelecionado2?.id,
        nome: estadoSelecionado2?.nome,
        sigla: estadoSelecionado2?.sigla,
      },
    })
  );

  // Loading states
  if (loadingEstados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estados...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (errorEstados) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600">Erro ao carregar dados dos estados</p>
        </div>
      </div>
    );
  }

  // Função para gerar dados realistas para cada indicador
  const gerarDadosIndicador = (indicador: any, _municipio: Municipio) => {
    const baseValue = Math.random() * 1000 + 100;

    switch (indicador.categoria) {
      case "Economia":
        if (indicador.nome.includes("PIB")) {
          return { valor: baseValue * 1000, unidade: "milhões R$" };
        } else if (indicador.nome.includes("Renda")) {
          return { valor: baseValue * 10, unidade: "R$" };
        } else if (indicador.nome.includes("Desemprego")) {
          return { valor: Math.random() * 20 + 5, unidade: "%" };
        } else if (indicador.nome.includes("Gini")) {
          return { valor: Math.random() * 0.6 + 0.3, unidade: "" };
        }
        break;

      case "Demografia":
        if (indicador.nome.includes("População")) {
          return { valor: baseValue * 1000, unidade: "habitantes" };
        } else if (indicador.nome.includes("Densidade")) {
          return { valor: baseValue * 10, unidade: "hab/km²" };
        } else if (indicador.nome.includes("Crescimento")) {
          return { valor: Math.random() * 3 + 1, unidade: "%" };
        } else if (indicador.nome.includes("Urbana")) {
          return { valor: Math.random() * 40 + 60, unidade: "%" };
        }
        break;

      case "Desenvolvimento":
        if (indicador.nome.includes("IDH")) {
          return { valor: Math.random() * 0.4 + 0.6, unidade: "" };
        }
        break;

      case "Educação":
        if (indicador.nome.includes("Alfabetização")) {
          return { valor: Math.random() * 20 + 80, unidade: "%" };
        } else if (indicador.nome.includes("Anos")) {
          return { valor: Math.random() * 6 + 6, unidade: "anos" };
        } else if (indicador.nome.includes("Escolas")) {
          return { valor: Math.random() * 0.01 + 0.005, unidade: "por hab" };
        } else if (indicador.nome.includes("Professores")) {
          return { valor: Math.random() * 0.1 + 0.05, unidade: "por aluno" };
        }
        break;

      case "Saúde":
        if (indicador.nome.includes("Esperança")) {
          return { valor: Math.random() * 20 + 70, unidade: "anos" };
        } else if (indicador.nome.includes("Mortalidade")) {
          return { valor: Math.random() * 20 + 10, unidade: "por 1000" };
        } else if (indicador.nome.includes("Leitos")) {
          return { valor: Math.random() * 0.005 + 0.002, unidade: "por hab" };
        } else if (indicador.nome.includes("Médicos")) {
          return { valor: Math.random() * 0.003 + 0.001, unidade: "por hab" };
        }
        break;

      case "Geografia":
        if (indicador.nome.includes("Área")) {
          return { valor: baseValue * 10, unidade: "km²" };
        } else if (indicador.nome.includes("Altitude")) {
          return { valor: Math.random() * 1000 + 100, unidade: "m" };
        } else if (indicador.nome.includes("Distância")) {
          return { valor: Math.random() * 200 + 50, unidade: "km" };
        } else if (indicador.nome.includes("Clima")) {
          return { valor: Math.random() * 10 + 20, unidade: "°C" };
        }
        break;

      case "Infraestrutura":
        if (
          indicador.nome.includes("Água") ||
          indicador.nome.includes("Esgoto") ||
          indicador.nome.includes("Energia") ||
          indicador.nome.includes("Vias")
        ) {
          return { valor: Math.random() * 30 + 70, unidade: "%" };
        }
        break;

      case "Segurança":
        if (indicador.nome.includes("Homicídios")) {
          return { valor: Math.random() * 30 + 10, unidade: "por 100k hab" };
        } else if (
          indicador.nome.includes("Polícia") ||
          indicador.nome.includes("Bombeiros")
        ) {
          return { valor: Math.random() * 0.005 + 0.002, unidade: "por hab" };
        }
        break;

      case "Cultura":
        if (indicador.nome.includes("Bibliotecas")) {
          return { valor: Math.random() * 0.001 + 0.0005, unidade: "por hab" };
        } else if (
          indicador.nome.includes("Teatros") ||
          indicador.nome.includes("Museus")
        ) {
          return {
            valor: Math.floor(Math.random() * 5) + 1,
            unidade: "unidades",
          };
        } else if (indicador.nome.includes("Parques")) {
          return { valor: Math.random() * 0.01 + 0.005, unidade: "m² por hab" };
        }
        break;
    }

    // Padrão para indicadores não especificados
    return { valor: baseValue, unidade: "unidades" };
  };

  const indicadores = [
    // Economia
    { id: 1, nome: "PIB (Produto Interno Bruto)", categoria: "Economia" },
    { id: 2, nome: "Renda Per Capita", categoria: "Economia" },
    { id: 3, nome: "Taxa de Desemprego", categoria: "Economia" },
    { id: 4, nome: "Índice de Gini", categoria: "Economia" },

    // Demografia
    { id: 5, nome: "População Total", categoria: "Demografia" },
    { id: 6, nome: "Densidade Demográfica", categoria: "Demografia" },
    {
      id: 7,
      nome: "Taxa de Crescimento Populacional",
      categoria: "Demografia",
    },
    { id: 8, nome: "População Urbana (%)", categoria: "Demografia" },

    // Desenvolvimento
    {
      id: 9,
      nome: "IDH (Índice de Desenvolvimento Humano)",
      categoria: "Desenvolvimento",
    },
    { id: 10, nome: "IDH-Educação", categoria: "Desenvolvimento" },
    { id: 11, nome: "IDH-Renda", categoria: "Desenvolvimento" },
    { id: 12, nome: "IDH-Longevidade", categoria: "Desenvolvimento" },

    // Educação
    { id: 13, nome: "Taxa de Alfabetização", categoria: "Educação" },
    { id: 14, nome: "Anos de Estudo (Média)", categoria: "Educação" },
    { id: 15, nome: "Escolas por Habitante", categoria: "Educação" },
    { id: 16, nome: "Professores por Aluno", categoria: "Educação" },

    // Saúde
    { id: 17, nome: "Esperança de Vida", categoria: "Saúde" },
    { id: 18, nome: "Mortalidade Infantil", categoria: "Saúde" },
    { id: 19, nome: "Leitos Hospitalares por Habitante", categoria: "Saúde" },
    { id: 20, nome: "Médicos por Habitante", categoria: "Saúde" },

    // Geografia
    { id: 21, nome: "Área Territorial", categoria: "Geografia" },
    { id: 22, nome: "Altitude Média", categoria: "Geografia" },
    { id: 23, nome: "Distância da Capital", categoria: "Geografia" },
    { id: 24, nome: "Clima", categoria: "Geografia" },

    // Infraestrutura
    { id: 25, nome: "Domicílios com Água", categoria: "Infraestrutura" },
    { id: 26, nome: "Domicílios com Esgoto", categoria: "Infraestrutura" },
    {
      id: 27,
      nome: "Domicílios com Energia Elétrica",
      categoria: "Infraestrutura",
    },
    { id: 28, nome: "Vias Pavimentadas (%)", categoria: "Infraestrutura" },

    // Segurança
    { id: 29, nome: "Taxa de Homicídios", categoria: "Segurança" },
    { id: 30, nome: "Polícia por Habitante", categoria: "Segurança" },
    { id: 31, nome: "Bombeiros por Habitante", categoria: "Segurança" },

    // Cultura e Lazer
    { id: 32, nome: "Bibliotecas por Habitante", categoria: "Cultura" },
    { id: 33, nome: "Teatros e Cinemas", categoria: "Cultura" },
    { id: 34, nome: "Parques e Áreas Verdes", categoria: "Cultura" },
    { id: 35, nome: "Museus", categoria: "Cultura" },
  ];

  const handleComparar = async () => {
    if (!municipio1 || !municipio2) {
      setError("Selecione dois municípios para comparar");
      return;
    }

    if (municipio1.id === municipio2.id) {
      setError("Selecione municípios diferentes para comparação");
      return;
    }

    setLoading(true);
    setError(null);

    // Simular API call
    setTimeout(() => {
      // Gerar comparação completa de todos os indicadores
      const comparacoesCompletas: IndicadorComparacao[] = indicadores.map(
        (indicador) => {
          const dados1 = gerarDadosIndicador(indicador, municipio1);
          const dados2 = gerarDadosIndicador(indicador, municipio2);

          const diferenca = dados1.valor - dados2.valor;
          const percentual =
            dados2.valor !== 0 ? (diferenca / dados2.valor) * 100 : 0;
          const melhorMunicipio =
            diferenca >= 0 ? municipio1.nome : municipio2.nome;

          return {
            id: indicador.id,
            nome: indicador.nome,
            categoria: indicador.categoria,
            municipio1: {
              valor: dados1.valor,
              unidade: dados1.unidade,
            },
            municipio2: {
              valor: dados2.valor,
              unidade: dados2.unidade,
            },
            diferenca,
            percentual,
            melhorMunicipio,
          };
        }
      );

      setComparacaoCompleta(comparacoesCompletas);

      // Manter compatibilidade com a comparação antiga
      if (indicadorId) {
        const indicadorSelecionado = indicadores.find(
          (i) => i.id === parseInt(indicadorId)
        );
        const comparacaoSelecionada = comparacoesCompletas.find(
          (c) => c.id === parseInt(indicadorId)
        );

        if (comparacaoSelecionada && indicadorSelecionado) {
          const mockComparacao: Comparacao = {
            municipio1: {
              nome: municipio1.nome,
              valor: comparacaoSelecionada.municipio1.valor,
              unidade: comparacaoSelecionada.municipio1.unidade,
            },
            municipio2: {
              nome: municipio2.nome,
              valor: comparacaoSelecionada.municipio2.valor,
              unidade: comparacaoSelecionada.municipio2.unidade,
            },
            indicador: {
              id: indicadorSelecionado.id,
              nome: indicadorSelecionado.nome,
              ano: parseInt(ano),
            },
            diferenca: comparacaoSelecionada.diferenca,
            percentual: comparacaoSelecionada.percentual,
          };
          setComparacao(mockComparacao);
        }
      }

      setLoading(false);
    }, 2000);
  };

  const handleMunicipioSelect = (municipio: Municipio, isFirst: boolean) => {
    if (isFirst) {
      setMunicipio1(municipio);
      setEstadoSelecionado1(
        estados.find((e: Estado) => e.id === municipio.estado?.id) || null
      );
    } else {
      setMunicipio2(municipio);
      setEstadoSelecionado2(
        estados.find((e: Estado) => e.id === municipio.estado?.id) || null
      );
    }
  };

  const handleSendEmail = async () => {
    if (
      !emailTo ||
      !municipio1 ||
      !municipio2 ||
      !comparacaoCompleta ||
      comparacaoCompleta.length === 0
    ) {
      setError("Dados insuficientes para enviar o relatório");
      return;
    }

    setSendingEmail(true);
    setEmailStatus(null);

    try {
      // Usar o hook RPC para enviar o relatório
      const result = await sendComparisonReportMutation.mutateAsync({
        toEmail: emailTo,
        municipio1: {
          nome: municipio1.nome,
          estado: municipio1.estado?.nome || "N/A",
        },
        municipio2: {
          nome: municipio2.nome,
          estado: municipio2.estado?.nome || "N/A",
        },
        comparacaoCompleta,
        ano: parseInt(ano),
      });

      if ((result as any).success) {
        setEmailStatus({
          success: true,
          message: `Relatório enviado com sucesso para ${emailTo}!`,
        });
        setEmailTo("");
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatus(null);
        }, 3000);
      } else {
        setEmailStatus({
          success: false,
          message: (result as any).error || "Erro ao enviar o relatório",
        });
      }
    } catch (error: any) {
      // Erro ao enviar email
      setEmailStatus({
        success: false,
        message: error.message || "Falha na conexão. Tente novamente.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSaveComparison = async () => {
    if (
      !saveTitle.trim() ||
      !municipio1 ||
      !municipio2 ||
      !comparacaoCompleta ||
      comparacaoCompleta.length === 0
    ) {
      setError("Dados insuficientes para salvar a comparação");
      return;
    }

    try {
      const result = await salvarComparacaoMutation.mutateAsync({
        titulo: saveTitle.trim(),
        descricao: saveDescription.trim() || undefined,
        municipio1: {
          id: municipio1.id,
          nome: municipio1.nome,
          estado: municipio1.estado?.nome || "N/A",
        },
        municipio2: {
          id: municipio2.id,
          nome: municipio2.nome,
          estado: municipio2.estado?.nome || "N/A",
        },
        ano: parseInt(ano),
        dadosComparacao: comparacaoCompleta,
      });

      if ((result as any).success) {
        // Limpar formulário após sucesso
        setSaveTitle("");
        setSaveDescription("");
        setShowSaveModal(false);
      }
    } catch (error: any) {
      // Erro ao salvar comparação
      setError(error.message || "Erro ao salvar comparação");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Comparar Indicadores
          </h1>
          <p className="text-gray-600">
            Compare indicadores entre diferentes municípios brasileiros
          </p>

          {/* Indicador de comparação carregada */}
          {comparacaoCarregada && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-green-700 font-medium">
                  Comparação "{comparacaoCarregada}" carregada com sucesso!
                </span>
                <button
                  onClick={() => setComparacaoCarregada(null)}
                  className="ml-auto text-green-600 hover:text-green-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Formulário de Comparação */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Município 1 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Primeiro Município
              </h3>

              <div className="space-y-4">
                {/* Seletor de Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Estado
                  </label>
                  <select
                    value={estadoSelecionado1?.id || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const estado = estados.find(
                        (est: Estado) => est.id === parseInt(e.target.value)
                      );
                      setEstadoSelecionado1(estado || null);
                      setMunicipio1(null); // Limpar município quando mudar estado
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((estado: Estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nome} ({estado.sigla}) -{" "}
                        {typeof estado.regiao === "object"
                          ? estado.regiao.nome
                          : estado.regiao}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Busca de Município */}
                {estadoSelecionado1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Município em {estadoSelecionado1.nome}
                    </label>
                    <input
                      type="text"
                      value={buscaMunicipio1}
                      onChange={(e) => setBuscaMunicipio1(e.target.value)}
                      placeholder="Digite o nome do município..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Município Selecionado */}
                {municipio1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {municipio1.nome}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {municipio1.estado?.nome && municipio1.estado?.sigla
                            ? `${municipio1.estado.nome} - ${municipio1.estado.sigla}`
                            : municipio1.estado?.nome ||
                              municipio1.estado?.sigla ||
                              "Estado não informado"}
                        </p>
                      </div>
                      <button
                        onClick={() => setMunicipio1(null)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Municípios do Estado */}
                {estadoSelecionado1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Municípios de {estadoSelecionado1.nome} (
                      {loadingMunicipios1
                        ? "..."
                        : `${municipios1.length} municípios`}
                      )
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                      {loadingMunicipios1 ? (
                        <div className="px-3 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">
                            Carregando municípios...
                          </p>
                        </div>
                      ) : (
                        (municipios1 || [])
                          .filter((municipio: Municipio) =>
                            municipio.nome
                              .toLowerCase()
                              .includes(buscaMunicipio1.toLowerCase())
                          )
                          .map((municipio: Municipio) => (
                            <div
                              key={municipio.id}
                              onClick={() =>
                                handleMunicipioSelect(municipio, true)
                              }
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {municipio.nome}
                              </div>
                              <div className="text-sm text-gray-600">
                                {municipio.estado?.nome &&
                                municipio.estado?.sigla
                                  ? `${municipio.estado.nome} - ${municipio.estado.sigla}`
                                  : municipio.estado?.nome ||
                                    municipio.estado?.sigla ||
                                    "Estado não informado"}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Município 2 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                Segundo Município
              </h3>

              <div className="space-y-4">
                {/* Seletor de Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecionar Estado
                  </label>
                  <select
                    value={estadoSelecionado2?.id || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const estado = estados.find(
                        (est: Estado) => est.id === parseInt(e.target.value)
                      );
                      setEstadoSelecionado2(estado || null);
                      setMunicipio2(null); // Limpar município quando mudar estado
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecione um estado</option>
                    {estados.map((estado: Estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.nome} ({estado.sigla}) -{" "}
                        {typeof estado.regiao === "object"
                          ? estado.regiao.nome
                          : estado.regiao}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Busca de Município */}
                {estadoSelecionado2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar Município em {estadoSelecionado2.nome}
                    </label>
                    <input
                      type="text"
                      value={buscaMunicipio2}
                      onChange={(e) => setBuscaMunicipio2(e.target.value)}
                      placeholder="Digite o nome do município..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                {/* Município Selecionado */}
                {municipio2 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900">
                          {municipio2.nome}
                        </h4>
                        <p className="text-sm text-green-700">
                          {municipio2.estado?.nome && municipio2.estado?.sigla
                            ? `${municipio2.estado.nome} - ${municipio2.estado.sigla}`
                            : municipio2.estado?.nome ||
                              municipio2.estado?.sigla ||
                              "Estado não informado"}
                        </p>
                      </div>
                      <button
                        onClick={() => setMunicipio2(null)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de Municípios do Estado */}
                {estadoSelecionado2 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Municípios de {estadoSelecionado2.nome} (
                      {loadingMunicipios2
                        ? "..."
                        : `${municipios2.length} municípios`}
                      )
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                      {loadingMunicipios2 ? (
                        <div className="px-3 py-8 text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">
                            Carregando municípios...
                          </p>
                        </div>
                      ) : (
                        (municipios2 || [])
                          .filter((municipio: Municipio) =>
                            municipio.nome
                              .toLowerCase()
                              .includes(buscaMunicipio2.toLowerCase())
                          )
                          .map((municipio: Municipio) => (
                            <div
                              key={municipio.id}
                              onClick={() =>
                                handleMunicipioSelect(municipio, false)
                              }
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {municipio.nome}
                              </div>
                              <div className="text-sm text-gray-600">
                                {municipio.estado?.nome &&
                                municipio.estado?.sigla
                                  ? `${municipio.estado.nome} - ${municipio.estado.sigla}`
                                  : municipio.estado?.nome ||
                                    municipio.estado?.sigla ||
                                    "Estado não informado"}
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Configurações do Indicador */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicador
                </label>
                <select
                  value={indicadorId}
                  onChange={(e) => setIndicadorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um indicador</option>
                  {indicadores.map((indicador) => (
                    <option key={indicador.id} value={indicador.id}>
                      {indicador.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ano
                </label>
                <input
                  type="number"
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  min="2000"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Botão de Comparar */}
            <div className="mt-6">
              <button
                onClick={handleComparar}
                disabled={!municipio1 || !municipio2 || loading}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Comparando...
                  </div>
                ) : (
                  "Comparar Todos os Indicadores"
                )}
              </button>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
          </div>
        </div>

        {/* Resultado da Comparação Individual */}
        {comparacao && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Resultado da Comparação Individual
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Município 1 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {comparacao.municipio1.nome}
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {typeof comparacao.municipio1.valor === "number"
                    ? comparacao.municipio1.valor.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })
                    : comparacao.municipio1.valor}
                </div>
                <div className="text-sm text-blue-700">
                  {comparacao.municipio1.unidade}
                </div>
              </div>

              {/* Comparação */}
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {comparacao.indicador.nome}
                  </div>
                  <div className="text-sm text-gray-600">
                    Ano: {comparacao.indicador.ano}
                  </div>
                </div>

                {comparacao.diferenca !== undefined && (
                  <div className="text-center">
                    <div
                      className={`text-xl font-bold ${comparacao.diferenca >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {comparacao.diferenca >= 0 ? "+" : ""}
                      {comparacao.diferenca.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })}
                    </div>
                    <div className="text-sm text-gray-600">Diferença</div>
                  </div>
                )}

                {comparacao.percentual !== undefined && (
                  <div className="text-center">
                    <div
                      className={`text-xl font-bold ${comparacao.percentual >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {comparacao.percentual >= 0 ? "+" : ""}
                      {comparacao.percentual.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">Percentual</div>
                  </div>
                )}
              </div>

              {/* Município 2 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  {comparacao.municipio2.nome}
                </h3>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {typeof comparacao.municipio2.valor === "number"
                    ? comparacao.municipio2.valor.toLocaleString("pt-BR", {
                        maximumFractionDigits: 2,
                      })
                    : comparacao.municipio2.valor}
                </div>
                <div className="text-sm text-green-700">
                  {comparacao.municipio2.unidade}
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Adicionar aos Favoritos
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Salvar Comparação
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                📊 Exportar Relatório
              </button>
            </div>
          </div>
        )}

        {/* Comparação Completa com Gráficos */}
        {comparacaoCompleta.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Comparação Completa de Todos os Indicadores
            </h2>

            {/* Resumo Executivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {municipio1?.nome}
                </h3>
                <div className="text-2xl font-bold text-blue-600">
                  {
                    (comparacaoCompleta || []).filter(
                      (c) => c.melhorMunicipio === municipio1?.nome
                    ).length
                  }
                </div>
                <div className="text-sm text-blue-700">
                  Indicadores Melhores
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  {municipio2?.nome}
                </h3>
                <div className="text-2xl font-bold text-green-600">
                  {
                    (comparacaoCompleta || []).filter(
                      (c) => c.melhorMunicipio === municipio2?.nome
                    ).length
                  }
                </div>
                <div className="text-sm text-green-700">
                  Indicadores Melhores
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Total
                </h3>
                <div className="text-2xl font-bold text-purple-600">
                  {comparacaoCompleta.length}
                </div>
                <div className="text-sm text-purple-700">
                  Indicadores Analisados
                </div>
              </div>
            </div>

            {/* Gráficos por Categoria */}
            {Array.from(
              new Set((comparacaoCompleta || []).map((c) => c.categoria))
            ).map((categoria) => (
              <div key={categoria} className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {categoria}
                </h3>

                <div className="space-y-4">
                  {(comparacaoCompleta || [])
                    .filter((c) => c.categoria === categoria)
                    .map((comparacao) => (
                      <div
                        key={comparacao.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <h4 className="font-semibold text-gray-900 mb-3">
                          {comparacao.nome}
                        </h4>

                        {/* Gráfico de Barras Simples */}
                        <div className="space-y-2">
                          {/* Município 1 */}
                          <div className="flex items-center">
                            <div className="w-24 text-sm text-gray-600">
                              {municipio1?.nome}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (comparacao.municipio1.valor / Math.max(comparacao.municipio1.valor, comparacao.municipio2.valor)) * 100))}%`,
                                }}
                              >
                                {comparacao.municipio1.valor.toLocaleString(
                                  "pt-BR",
                                  { maximumFractionDigits: 2 }
                                )}
                              </div>
                            </div>
                            <div className="w-20 text-xs text-gray-500 ml-2">
                              {comparacao.municipio1.unidade}
                            </div>
                          </div>

                          {/* Município 2 */}
                          <div className="flex items-center">
                            <div className="w-24 text-sm text-gray-600">
                              {municipio2?.nome}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                              <div
                                className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-medium"
                                style={{
                                  width: `${Math.min(100, Math.max(0, (comparacao.municipio2.valor / Math.max(comparacao.municipio1.valor, comparacao.municipio2.valor)) * 100))}%`,
                                }}
                              >
                                {comparacao.municipio2.valor.toLocaleString(
                                  "pt-BR",
                                  { maximumFractionDigits: 2 }
                                )}
                              </div>
                            </div>
                            <div className="w-20 text-xs text-gray-500 ml-2">
                              {comparacao.municipio2.unidade}
                            </div>
                          </div>

                          {/* Diferença */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <span
                                className={`font-medium ${comparacao.diferenca >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                Diferença:{" "}
                                {comparacao.diferenca >= 0 ? "+" : ""}
                                {comparacao.diferenca.toLocaleString("pt-BR", {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              <span
                                className={`font-medium ${comparacao.percentual >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {comparacao.percentual >= 0 ? "+" : ""}
                                {comparacao.percentual.toFixed(2)}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Melhor: {comparacao.melhorMunicipio}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {/* Ações Finais */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowEmailModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                📧 Enviar Relatório por Email
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                💾 Salvar Comparação
              </button>
            </div>
          </div>
        )}

        {/* Modal de Salvar Comparação */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                💾 Salvar Comparação
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título da Comparação *
                  </label>
                  <input
                    type="text"
                    value={saveTitle}
                    onChange={(e) => setSaveTitle(e.target.value)}
                    placeholder="Ex: Comparação Educação SP vs RJ 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {saveTitle.length}/100 caracteres
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={saveDescription}
                    onChange={(e) => setSaveDescription(e.target.value)}
                    placeholder="Adicione uma descrição para identificar esta comparação..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {saveDescription.length}/500 caracteres
                  </div>
                </div>

                {municipio1 && municipio2 && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Resumo da Comparação:
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        • Município 1: {municipio1.nome},{" "}
                        {municipio1.estado?.nome}
                      </div>
                      <div>
                        • Município 2: {municipio2.nome},{" "}
                        {municipio2.estado?.nome}
                      </div>
                      <div>• Ano: {ano}</div>
                      <div>
                        • Indicadores: {(comparacaoCompleta || []).length}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveComparison}
                    disabled={
                      !saveTitle.trim() || salvarComparacaoMutation.isPending
                    }
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {salvarComparacaoMutation.isPending ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </div>
                    ) : (
                      "Salvar Comparação"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setSaveTitle("");
                      setSaveDescription("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Sobre salvar comparações:</p>
                      <p className="mt-1">
                        Suas comparações ficarão salvas na sua conta e poderão
                        ser acessadas posteriormente para consulta ou reenvio.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Envio de Email */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    📧 Enviar Relatório por Email
                  </h3>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Envie o relatório completo de comparação para:
                  </p>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="Digite o email de destino..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {emailStatus && (
                  <div
                    className={`p-3 rounded-md mb-4 ${
                      emailStatus.success
                        ? "bg-green-50 border border-green-200 text-green-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    {emailStatus.message}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSendEmail}
                    disabled={!emailTo || sendingEmail}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingEmail ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      "Enviar Relatório"
                    )}
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">O que será enviado:</p>
                      <ul className="mt-1 space-y-1">
                        <li>• Resumo executivo da comparação</li>
                        <li>• Gráficos de todos os 35 indicadores</li>
                        <li>
                          • Análise por categoria (Economia, Educação, Saúde,
                          etc.)
                        </li>
                        <li>• Diferenças e percentuais calculados</li>
                        <li>• Relatório em formato HTML responsivo</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CompararPage = () => {
  return <CompararPageContent />;
};

export default CompararPage;
