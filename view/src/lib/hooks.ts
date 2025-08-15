import { client } from "./rpc";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { FailedToFetchUserError } from "@/components/logged-provider";
import { toast } from "sonner";

/**
 * This hook will throw an error if the user is not logged in.
 * You can safely use it inside routes that are protected by the `LoggedProvider`.
 */
export const useUser = () => {
  return useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () =>
      client.GET_USER(
        {},
        {
          handleResponse: (res: Response) => {
            if (res.status === 401) {
              throw new FailedToFetchUserError(
                "Failed to fetch user",
                globalThis.location.href
              );
            }

            return res.json();
          },
        }
      ),
    retry: false,
  });
};

/**
 * This hook will return null if the user is not logged in.
 * You can safely use it inside routes that are not protected by the `LoggedProvider`.
 * Good for pages that are public, for example.
 */
export const useOptionalUser = () => {
  return useSuspenseQuery({
    queryKey: ["user"],
    queryFn: () =>
      client.GET_USER(
        {},
        {
          handleResponse: async (res: Response) => {
            if (res.status === 401) {
              return null;
            }
            return res.json();
          },
        }
      ),
    retry: false,
  });
};

/**
 * Hook para buscar estados do IBGE
 */
export const useEstados = () => {
  return useQuery({
    queryKey: ["estados"],
    queryFn: async () => {
      try {
        // Tentar usar o client real primeiro
        if (client && typeof client.LISTAR_ESTADOS === "function") {
          return await client.LISTAR_ESTADOS({});
        }

        // Fallback para API direta do IBGE
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        const estados = await response.json();

        return {
          estados: estados.map((estado: any) => ({
            id: estado.id,
            sigla: estado.sigla,
            nome: estado.nome,
            regiao: estado.regiao || { id: 0, sigla: "", nome: "N/A" },
          })),
          total: estados.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Erro ao buscar estados:", error);
        throw error;
      }
    },
    staleTime: 24 * 60 * 60 * 1000, // Cache por 24 horas
  });
};

/**
 * Hook para buscar municípios de um estado específico
 */
export const useMunicipiosDoEstado = (estadoId: number | null) => {
  return useQuery({
    queryKey: ["municipios", estadoId],
    queryFn: async () => {
      if (!estadoId) {
        return { municipios: [], estado: null, total: 0 };
      }

      try {
        // Tentar usar o client real primeiro
        if (
          client &&
          typeof client.LISTAR_MUNICIPIOS_POR_ESTADO === "function"
        ) {
          const result = await client.LISTAR_MUNICIPIOS_POR_ESTADO({
            estadoId,
          });
          console.log("Dados do MCP client:", result);
          return result;
        }

        // Fallback para API direta do IBGE
        const [estadoResponse, municipiosResponse] = await Promise.all([
          fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}`
          ),
          fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`
          ),
        ]);

        const estado = await estadoResponse.json();
        const municipios = await municipiosResponse.json();

        console.log("Dados da API direta IBGE - Estado:", estado);
        console.log(
          "Dados da API direta IBGE - Municípios (primeiros 2):",
          municipios.slice(0, 2)
        );

        const result = {
          municipios: municipios.map((municipio: any) => ({
            id: municipio.id,
            nome: municipio.nome,
            estado: {
              id: estado.id,
              sigla: estado.sigla,
              nome: estado.nome,
            },
          })),
          estado: {
            id: estado.id,
            sigla: estado.sigla,
            nome: estado.nome,
          },
          total: municipios.length,
          timestamp: new Date().toISOString(),
        };

        console.log("Resultado final da API direta:", result);
        return result;
      } catch (error) {
        console.error("Erro ao buscar municípios:", error);
        throw error;
      }
    },
    enabled: !!estadoId,
    staleTime: 24 * 60 * 60 * 1000, // Cache por 24 horas
  });
};

/**
 * Hook para buscar municípios por nome
 */
export const useBuscarMunicipios = () => {
  return useMutation({
    mutationFn: async (nome: string) => {
      try {
        // Tentar usar o client real primeiro
        if (client && typeof client.BUSCAR_MUNICIPIOS_POR_NOME === "function") {
          return await client.BUSCAR_MUNICIPIOS_POR_NOME({ nome });
        }

        // Fallback para busca direta na API do IBGE
        const estadosResponse = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        const estados = await estadosResponse.json();

        const municipiosEncontrados = [];

        for (const estado of estados) {
          try {
            const municipiosResponse = await fetch(
              `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`
            );
            const municipios = await municipiosResponse.json();

            const filtrados = municipios.filter((m: any) =>
              m.nome.toLowerCase().includes(nome.toLowerCase())
            );

            municipiosEncontrados.push(
              ...filtrados.map((m: any) => ({
                id: m.id,
                nome: m.nome,
                estado: {
                  id: estado.id,
                  sigla: estado.sigla,
                  nome: estado.nome,
                },
                regiao: estado.regiao,
              }))
            );
          } catch (error) {
            // Continuar com próximo estado se houver erro
            continue;
          }
        }

        return {
          municipios: municipiosEncontrados,
          total: municipiosEncontrados.length,
          query: nome,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Erro ao buscar municípios por nome:", error);
        throw error;
      }
    },
  });
};

// ============================================================================
// HOOKS PARA EMAIL
// ============================================================================

// Enviar relatório de comparação por email
export const useSendComparisonReport = () => {
  return useMutation({
    mutationFn: (params: {
      toEmail: string;
      municipio1: {
        nome: string;
        estado: string;
      };
      municipio2: {
        nome: string;
        estado: string;
      };
      comparacaoCompleta: any[];
      ano: number;
    }) => client.SEND_COMPARISON_REPORT(params),
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Relatório enviado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao enviar relatório");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao enviar relatório: ${error.message}`);
    },
  });
};

// Enviar email genérico
export const useSendEmail = () => {
  return useMutation({
    mutationFn: (params: {
      to: string;
      subject: string;
      body: string;
      contentType?: "text/plain" | "text/html";
      cc?: string;
      bcc?: string;
    }) => client.SEND_EMAIL(params),
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Email enviado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao enviar email");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao enviar email: ${error.message}`);
    },
  });
};

// Enviar email com template
export const useSendTemplatedEmail = () => {
  return useMutation({
    mutationFn: (params: {
      to: string;
      template: "welcome" | "notification" | "report" | "alert" | "custom";
      subject: string;
      data: Record<string, any>;
      customHtml?: string;
    }) => client.SEND_TEMPLATED_EMAIL(params),
    onSuccess: (data: any) => {
      if (data.success) {
        toast.success("Email enviado com sucesso!");
      } else {
        toast.error(data.error || "Erro ao enviar email");
      }
    },
    onError: (error) => {
      toast.error(`Erro ao enviar email: ${error.message}`);
    },
  });
};

// ============================================================================
// HOOKS PARA SALVAR COMPARAÇÕES
// ============================================================================

export const useSalvarComparacao = () => {
  return useMutation({
    mutationFn: (params: {
      titulo: string;
      descricao?: string;
      municipio1: {
        id: number;
        nome: string;
        estado: string;
      };
      municipio2: {
        id: number;
        nome: string;
        estado: string;
      };
      ano: number;
      dadosComparacao: any[];
    }) => client.SALVAR_COMPARACAO(params),
    onSuccess: (data: any) => {
      console.log("Comparação salva:", data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Erro ao salvar comparação");
      }
    },
    onError: (error) => {
      console.error("Erro ao salvar comparação:", error);
      toast.error(`Erro ao salvar: ${error.message}`);
    },
  });
};

export const useListarComparacoesSalvas = (limite = 50, offset = 0) => {
  return useQuery({
    queryKey: ["comparacoes-salvas", limite, offset],
    queryFn: () => client.LISTAR_COMPARACOES_SALVAS({ limite, offset }),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useCarregarComparacaoSalva = () => {
  return useMutation({
    mutationFn: (params: { comparacaoId: number }) =>
      client.CARREGAR_COMPARACAO_SALVA(params),
    onSuccess: (data: any) => {
      console.log("Comparação carregada:", data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message || "Erro ao carregar comparação");
      }
    },
    onError: (error) => {
      console.error("Erro ao carregar comparação:", error);
      toast.error(`Erro ao carregar: ${error.message}`);
    },
  });
};

export const useDeletarComparacaoSalva = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { comparacaoId: number }) =>
      client.DELETAR_COMPARACAO_SALVA(params),
    onSuccess: (data: any) => {
      console.log("Comparação deletada:", data);
      if (data.success) {
        toast.success(data.message);
        // Invalidar a lista de comparações para atualizar a UI
        queryClient.invalidateQueries({ queryKey: ["comparacoes-salvas"] });
      } else {
        toast.error(data.message || "Erro ao deletar comparação");
      }
    },
    onError: (error) => {
      console.error("Erro ao deletar comparação:", error);
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });
};

// ============================================================================
// HOOKS PARA MUNICÍPIOS FAVORITOS
// ============================================================================

export const useListarMunicipiosFavoritos = () => {
  return useQuery({
    queryKey: ["municipios-favoritos"],
    queryFn: () => client.LISTAR_MUNICIPIOS_FAVORITOS({}),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
