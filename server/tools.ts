/**
 * This is where you define your tools.
 *
 * Tools are the functions that will be available on your
 * MCP server. They can be called from any other Deco app
 * or from your front-end code via typed RPC. This is the
 * recommended way to build your Web App.
 *
 * @see https://docs.deco.page/en/guides/creating-tools/
 */
import { createPrivateTool, createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "./main.ts";
import {
  consultasEstadosTable,
  consultasMunicipiosTable,
  consultasCepTable,
  consultasDddTable,
  comparacoesIndicadoresTable,
  municipiosFavoritosTable,
  indicadoresFavoritosTable,
  comparacoesSalvasTable,
} from "./schema.ts";
import { getDb } from "./db.ts";
import { eq, and, desc } from "drizzle-orm";

/**
 * `createPrivateTool` is a wrapper around `createTool` that
 * will call `env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated`
 * before executing the tool.
 *
 * It automatically returns a 401 error if valid user credentials
 * are not present in the request. You can also call it manually
 * to get the user object.
 */
export const createGetUserTool = (env: Env) =>
  createPrivateTool({
    id: "GET_USER",
    description: "Get the current logged in user",
    inputSchema: z.object({}),
    outputSchema: z.object({
      id: z.string(),
      name: z.string().nullable(),
      avatar: z.string().nullable(),
      email: z.string(),
    }),
    execute: async () => {
      const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        name: user.user_metadata.full_name,
        avatar: user.user_metadata.avatar_url,
        email: user.email,
      };
    },
  });

// ============================================================================
// FERRAMENTAS PARA SALVAR COMPARAÇÕES
// ============================================================================

/**
 * Ferramenta para salvar uma comparação completa no banco de dados
 */
export const createSalvarComparacaoTool = (env: Env) =>
  createPrivateTool({
    id: "SALVAR_COMPARACAO",
    description: "Salva uma comparação completa no banco de dados",
    inputSchema: z.object({
      titulo: z.string().min(1, "Título é obrigatório"),
      descricao: z.string().optional(),
      municipio1: z.object({
        id: z.number(),
        nome: z.string(),
        estado: z.string(),
      }),
      municipio2: z.object({
        id: z.number(),
        nome: z.string(),
        estado: z.string(),
      }),
      ano: z.number(),
      dadosComparacao: z.any(), // Array com todos os dados da comparação
    }),
    outputSchema: z.object({
      success: z.boolean(),
      comparacaoId: z.number().optional(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const db = await getDb(env);

        const dadosComparacaoJson = JSON.stringify(context.dadosComparacao);
        const agora = new Date();

        const [resultado] = await db
          .insert(comparacoesSalvasTable)
          .values({
            userId: user.id,
            titulo: context.titulo,
            descricao: context.descricao || null,
            municipio1Id: context.municipio1.id,
            municipio1Nome: context.municipio1.nome,
            municipio1Estado: context.municipio1.estado,
            municipio2Id: context.municipio2.id,
            municipio2Nome: context.municipio2.nome,
            municipio2Estado: context.municipio2.estado,
            ano: context.ano,
            totalIndicadores: Array.isArray(context.dadosComparacao)
              ? context.dadosComparacao.length
              : 0,
            dadosComparacao: dadosComparacaoJson,
            salvaEm: agora,
            atualizadaEm: agora,
          })
          .returning({ id: comparacoesSalvasTable.id });

        return {
          success: true,
          comparacaoId: resultado.id,
          message: "Comparação salva com sucesso!",
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Erro ao salvar comparação: ${error.message}`,
        };
      }
    },
  });

/**
 * Ferramenta para listar comparações salvas do usuário
 */
export const createListarComparacoesSalvasTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_COMPARACOES_SALVAS",
    description: "Lista todas as comparações salvas pelo usuário",
    inputSchema: z.object({
      limite: z.number().optional().default(50),
      offset: z.number().optional().default(0),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      comparacoes: z.array(
        z.object({
          id: z.number(),
          titulo: z.string(),
          descricao: z.string().nullable(),
          municipio1Nome: z.string(),
          municipio1Estado: z.string(),
          municipio2Nome: z.string(),
          municipio2Estado: z.string(),
          ano: z.number(),
          totalIndicadores: z.number(),
          salvaEm: z.date(),
          atualizadaEm: z.date(),
        })
      ),
      total: z.number(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const db = await getDb(env);

        const comparacoes = await db
          .select({
            id: comparacoesSalvasTable.id,
            titulo: comparacoesSalvasTable.titulo,
            descricao: comparacoesSalvasTable.descricao,
            municipio1Nome: comparacoesSalvasTable.municipio1Nome,
            municipio1Estado: comparacoesSalvasTable.municipio1Estado,
            municipio2Nome: comparacoesSalvasTable.municipio2Nome,
            municipio2Estado: comparacoesSalvasTable.municipio2Estado,
            ano: comparacoesSalvasTable.ano,
            totalIndicadores: comparacoesSalvasTable.totalIndicadores,
            salvaEm: comparacoesSalvasTable.salvaEm,
            atualizadaEm: comparacoesSalvasTable.atualizadaEm,
          })
          .from(comparacoesSalvasTable)
          .where(eq(comparacoesSalvasTable.userId, user.id))
          .orderBy(desc(comparacoesSalvasTable.salvaEm))
          .limit(context.limite)
          .offset(context.offset);

        // Contar total de comparações do usuário
        const [countResult] = await db
          .select({ count: comparacoesSalvasTable.id })
          .from(comparacoesSalvasTable)
          .where(eq(comparacoesSalvasTable.userId, user.id));

        return {
          success: true,
          comparacoes,
          total: comparacoes.length,
          message: `${comparacoes.length} comparações encontradas`,
        };
      } catch (error: any) {
        return {
          success: false,
          comparacoes: [],
          total: 0,
          message: `Erro ao buscar comparações: ${error.message}`,
        };
      }
    },
  });

/**
 * Ferramenta para carregar uma comparação salva específica
 */
export const createCarregarComparacaoSalvaTool = (env: Env) =>
  createPrivateTool({
    id: "CARREGAR_COMPARACAO_SALVA",
    description: "Carrega os dados completos de uma comparação salva",
    inputSchema: z.object({
      comparacaoId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      comparacao: z
        .object({
          id: z.number(),
          titulo: z.string(),
          descricao: z.string().nullable(),
          municipio1: z.object({
            id: z.number(),
            nome: z.string(),
            estado: z.string(),
          }),
          municipio2: z.object({
            id: z.number(),
            nome: z.string(),
            estado: z.string(),
          }),
          ano: z.number(),
          dadosComparacao: z.any(),
          salvaEm: z.date(),
          atualizadaEm: z.date(),
        })
        .optional(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const db = await getDb(env);

        const [comparacao] = await db
          .select()
          .from(comparacoesSalvasTable)
          .where(
            and(
              eq(comparacoesSalvasTable.id, context.comparacaoId),
              eq(comparacoesSalvasTable.userId, user!.id)
            )
          );

        if (!comparacao) {
          return {
            success: false,
            message:
              "Comparação não encontrada ou você não tem permissão para acessá-la",
          };
        }

        let dadosComparacao;
        try {
          dadosComparacao = JSON.parse(comparacao.dadosComparacao);
        } catch (parseError) {
          dadosComparacao = [];
        }

        return {
          success: true,
          comparacao: {
            id: comparacao.id,
            titulo: comparacao.titulo,
            descricao: comparacao.descricao,
            municipio1: {
              id: comparacao.municipio1Id,
              nome: comparacao.municipio1Nome,
              estado: comparacao.municipio1Estado,
            },
            municipio2: {
              id: comparacao.municipio2Id,
              nome: comparacao.municipio2Nome,
              estado: comparacao.municipio2Estado,
            },
            ano: comparacao.ano,
            dadosComparacao,
            salvaEm: comparacao.salvaEm,
            atualizadaEm: comparacao.atualizadaEm,
          },
          message: "Comparação carregada com sucesso",
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Erro ao carregar comparação: ${error.message}`,
        };
      }
    },
  });

/**
 * Ferramenta para deletar uma comparação salva
 */
export const createDeletarComparacaoSalvaTool = (env: Env) =>
  createPrivateTool({
    id: "DELETAR_COMPARACAO_SALVA",
    description: "Deleta uma comparação salva do usuário",
    inputSchema: z.object({
      comparacaoId: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }

        const db = await getDb(env);

        // Verificar se a comparação existe e pertence ao usuário
        const [comparacao] = await db
          .select({
            id: comparacoesSalvasTable.id,
            titulo: comparacoesSalvasTable.titulo,
          })
          .from(comparacoesSalvasTable)
          .where(
            and(
              eq(comparacoesSalvasTable.id, context.comparacaoId),
              eq(comparacoesSalvasTable.userId, user!.id)
            )
          );

        if (!comparacao) {
          return {
            success: false,
            message:
              "Comparação não encontrada ou você não tem permissão para deletá-la",
          };
        }

        // Deletar a comparação
        await db
          .delete(comparacoesSalvasTable)
          .where(
            and(
              eq(comparacoesSalvasTable.id, context.comparacaoId),
              eq(comparacoesSalvasTable.userId, user!.id)
            )
          );

        return {
          success: true,
          message: `Comparação "${comparacao.titulo}" deletada com sucesso`,
        };
      } catch (error: any) {
        return {
          success: false,
          message: `Erro ao deletar comparação: ${error.message}`,
        };
      }
    },
  });

export const createSendComparisonReportTool = (env: Env) =>
  createTool({
    id: "SEND_COMPARISON_REPORT",
    description: "Send comparison report via email",
    inputSchema: z.object({
      toEmail: z.string().email("Email inválido"),
      municipio1: z.object({
        nome: z.string(),
        estado: z.string(),
      }),
      municipio2: z.object({
        nome: z.string(),
        estado: z.string(),
      }),
      comparacaoCompleta: z.array(
        z.object({
          id: z.number(),
          nome: z.string(),
          categoria: z.string(),
          municipio1: z.object({
            valor: z.number(),
            unidade: z.string(),
          }),
          municipio2: z.object({
            valor: z.number(),
            unidade: z.string(),
          }),
          diferenca: z.number(),
          percentual: z.number(),
          melhorMunicipio: z.string(),
        })
      ),
      ano: z.number(),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      const { toEmail, municipio1, municipio2, comparacaoCompleta, ano } =
        context;
      try {
        // Verificar se a integração Gmail está disponível
        if (!(env as any).MCP_GMAIL_N1?.SendEmail) {
          return {
            success: false,
            error: "Serviço de email não está configurado corretamente",
          };
        }

        // Gerar conteúdo do email
        const emailContent = generateEmailContent(
          municipio1,
          municipio2,
          comparacaoCompleta,
          ano
        );

        // Preparar dados do email
        const emailRequest = {
          to: toEmail,
          subject: `Relatório de Comparação: ${municipio1.nome} vs ${municipio2.nome}`,
          bodyHtml: emailContent,
        };

        // Debug info removed for production

        // Enviar email via Gmail
        const response = await (env as any).MCP_GMAIL_N1.SendEmail(
          emailRequest
        );

        // Response processed

        return {
          success: true,
          messageId:
            response.messageId || response.id || "Email enviado com sucesso",
        };
      } catch (error: any) {
        // Error handling:("Erro ao enviar email:", error);
        return {
          success: false,
          error: error.message || "Erro desconhecido ao enviar email",
        };
      }
    },
  });

// Função para gerar o conteúdo HTML do email
const generateEmailContent = (
  municipio1: { nome: string; estado: string },
  municipio2: { nome: string; estado: string },
  comparacaoCompleta: any[],
  ano: number
): string => {
  // Verificação de segurança para o array
  const comparacoes = Array.isArray(comparacaoCompleta)
    ? comparacaoCompleta
    : [];

  const resumoMunicipio1 = comparacoes.filter(
    (c) => c && c.melhorMunicipio === municipio1.nome
  ).length;
  const resumoMunicipio2 = comparacoes.filter(
    (c) => c && c.melhorMunicipio === municipio2.nome
  ).length;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Comparação de Indicadores</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .summary-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .category { margin-bottom: 30px; }
        .category-title { background: #e9ecef; padding: 15px; border-radius: 5px; font-weight: bold; margin-bottom: 20px; }
        .indicator { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .indicator-name { font-weight: bold; margin-bottom: 15px; color: #495057; }
        .comparison-bar { display: flex; align-items: center; margin-bottom: 10px; }
        .municipio-label { width: 120px; font-size: 0.9em; color: #6c757d; }
        .bar-container { flex: 1; background: #e9ecef; height: 20px; border-radius: 10px; margin: 0 10px; overflow: hidden; }
        .bar { height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; font-size: 0.8em; font-weight: bold; color: white; }
        .bar.municipio1 { background: #007bff; }
        .bar.municipio2 { background: #28a745; }
        .unit { width: 80px; font-size: 0.8em; color: #6c757d; text-align: right; }
        .difference { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6; }
        .difference-info { display: flex; gap: 20px; }
        .difference-value { font-weight: bold; }
        .difference-value.positive { color: #28a745; }
        .difference-value.negative { color: #dc3545; }
        .best-municipio { font-size: 0.9em; color: #6c757d; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Relatório de Comparação de Indicadores</h1>
          <p>Análise completa entre municípios brasileiros - Ano ${ano}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <div class="summary-number">${municipio1.nome}</div>
            <div>${resumoMunicipio1} indicadores melhores</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${municipio2.nome}</div>
            <div>${resumoMunicipio2} indicadores melhores</div>
          </div>
          <div class="summary-card">
            <div class="summary-number">${comparacoes.length}</div>
            <div>Total de indicadores</div>
          </div>
        </div>
  `;

  // Agrupar por categoria
  const categorias = Array.from(
    new Set(comparacoes.map((c) => c && c.categoria).filter(Boolean))
  );

  categorias.forEach((categoria) => {
    const indicadoresCategoria = comparacoes.filter(
      (c) => c && c.categoria === categoria
    );

    html += `
      <div class="category">
        <div class="category-title">${categoria}</div>
    `;

    indicadoresCategoria.forEach((indicador) => {
      // Verificações de segurança
      if (!indicador || !indicador.municipio1 || !indicador.municipio2) {
        return; // Pula este indicador se estiver mal formado
      }

      const valor1 = Number(indicador.municipio1.valor) || 0;
      const valor2 = Number(indicador.municipio2.valor) || 0;
      const maxValor = Math.max(valor1, valor2);
      const width1 = maxValor > 0 ? (valor1 / maxValor) * 100 : 0;
      const width2 = maxValor > 0 ? (valor2 / maxValor) * 100 : 0;

      html += `
        <div class="indicator">
          <div class="indicator-name">${indicador.nome}</div>
          
          <div class="comparison-bar">
            <div class="municipio-label">${municipio1.nome}</div>
            <div class="bar-container">
              <div class="bar municipio1" style="width: ${width1}%">
                ${valor1.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div class="unit">${indicador.municipio1.unidade || ""}</div>
          </div>
          
          <div class="comparison-bar">
            <div class="municipio-label">${municipio2.nome}</div>
            <div class="bar-container">
              <div class="bar municipio2" style="width: ${width2}%">
                ${valor2.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </div>
            </div>
            <div class="unit">${indicador.municipio2.unidade || ""}</div>
          </div>
          
          <div class="difference">
            <div class="difference-info">
              <span class="difference-value ${(indicador.diferenca || 0) >= 0 ? "positive" : "negative"}">
                Diferença: ${(indicador.diferenca || 0) >= 0 ? "+" : ""}${(indicador.diferenca || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
              </span>
              <span class="difference-value ${(indicador.percentual || 0) >= 0 ? "positive" : "negative"}">
                ${(indicador.percentual || 0) >= 0 ? "+" : ""}${(indicador.percentual || 0).toFixed(2)}%
              </span>
            </div>
            <div class="best-municipio">Melhor: ${indicador.melhorMunicipio || "N/A"}</div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
  });

  html += `
        <div class="footer">
          <p>Relatório gerado automaticamente pelo Sistema de Comparação de Indicadores Municipais</p>
          <p>Data: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

// ============================================================================
// FERRAMENTAS PARA SISTEMA DE INDICADORES MUNICIPAIS
// ============================================================================

/**
 * Ferramenta para listar todos os estados do Brasil via API do IBGE
 */
export const createListarEstadosTool = (env: Env) =>
  createTool({
    id: "LISTAR_ESTADOS",
    description: "Lista todos os estados do Brasil usando a API do IBGE",
    inputSchema: z.object({}),
    outputSchema: z.object({
      estados: z.array(
        z.object({
          id: z.number(),
          sigla: z.string(),
          nome: z.string(),
          regiao: z.object({
            id: z.number(),
            sigla: z.string(),
            nome: z.string(),
          }),
        })
      ),
      total: z.number(),
      timestamp: z.string(),
    }),
    execute: async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );

        if (!response.ok) {
          throw new Error(`Erro na API do IBGE: ${response.status}`);
        }

        const estados = await response.json();

        return {
          estados,
          total: estados.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        // Error handling:("Erro ao listar estados:", error);
        throw new Error("Falha ao buscar estados do IBGE");
      }
    },
  });

/**
 * Ferramenta para listar municípios de um estado específico
 */
export const createListarMunicipiosPorEstadoTool = (env: Env) =>
  createTool({
    id: "LISTAR_MUNICIPIOS_POR_ESTADO",
    description: "Lista municípios de um estado específico via API do IBGE",
    inputSchema: z.object({
      estadoId: z.number().describe("ID do estado (ex: 35 para SP)"),
    }),
    outputSchema: z.object({
      municipios: z.array(
        z.object({
          id: z.number(),
          nome: z.string(),
          microrregiao: z.object({
            id: z.number(),
            nome: z.string(),
            mesorregiao: z.object({
              id: z.number(),
              nome: z.string(),
              UF: z.object({
                id: z.number(),
                sigla: z.string(),
                nome: z.string(),
              }),
            }),
          }),
        })
      ),
      estado: z.object({
        id: z.number(),
        sigla: z.string(),
        nome: z.string(),
      }),
      total: z.number(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        // Primeiro buscar o estado para obter informações
        const estadoResponse = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${context.estadoId}`
        );

        if (!estadoResponse.ok) {
          throw new Error(`Estado não encontrado: ${context.estadoId}`);
        }

        const estado = await estadoResponse.json();

        // Buscar municípios do estado
        const municipiosResponse = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${context.estadoId}/municipios`
        );

        if (!municipiosResponse.ok) {
          throw new Error(
            `Erro ao buscar municípios do estado ${context.estadoId}`
          );
        }

        const municipios = await municipiosResponse.json();

        return {
          municipios,
          estado: {
            id: estado.id,
            sigla: estado.sigla,
            nome: estado.nome,
          },
          total: municipios.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao listar municípios:", error);
        throw new Error(
          `Falha ao buscar municípios do estado ${context.estadoId}`
        );
      }
    },
  });

/**
 * Ferramenta para buscar município por nome (busca parcial)
 */
export const createBuscarMunicipiosPorNomeTool = (env: Env) =>
  createTool({
    id: "BUSCAR_MUNICIPIOS_POR_NOME",
    description:
      "Busca municípios por nome usando busca parcial na API do IBGE",
    inputSchema: z.object({
      nome: z
        .string()
        .min(2)
        .max(100)
        .describe("Nome ou parte do nome do município"),
    }),
    outputSchema: z.object({
      municipios: z.array(
        z.object({
          id: z.number(),
          nome: z.string(),
          estado: z.object({
            id: z.number(),
            sigla: z.string(),
            nome: z.string(),
          }),
          regiao: z.object({
            id: z.number(),
            sigla: z.string(),
            nome: z.string(),
          }),
        })
      ),
      total: z.number(),
      query: z.string(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const nomeBusca = context.nome.toLowerCase().trim();
        const municipiosEncontrados = [];

        // Buscar em todos os estados
        const estadosResponse = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        const estados = await estadosResponse.json();

        for (const estado of estados) {
          try {
            const municipiosResponse = await fetch(
              `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado.id}/municipios`
            );
            const municipios = await municipiosResponse.json();

            const filtrados = municipios.filter((m: any) =>
              m.nome.toLowerCase().includes(nomeBusca)
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
          query: context.nome,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao buscar municípios por nome:", error);
        throw new Error("Falha ao buscar municípios por nome");
      }
    },
  });

/**
 * Ferramenta para consultar CEP via Brasil API
 */
export const createConsultarCepTool = (env: Env) =>
  createTool({
    id: "CONSULTAR_CEP",
    description: "Consulta informações de um CEP usando a Brasil API",
    inputSchema: z.object({
      cep: z.string().describe("CEP a ser consultado (com ou sem formatação)"),
    }),
    outputSchema: z.object({
      cep: z.string(),
      state: z.string(),
      city: z.string(),
      neighborhood: z.string(),
      street: z.string(),
      service: z.string(),
      location: z.object({
        type: z.string(),
        coordinates: z.object({
          longitude: z.string(),
          latitude: z.string(),
        }),
      }),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        // Limpar formatação do CEP
        const cepLimpo = context.cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
          throw new Error("CEP deve ter 8 dígitos numéricos");
        }

        const response = await fetch(
          `https://brasilapi.com.br/api/cep/v1/${cepLimpo}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("CEP não encontrado");
          }
          throw new Error(`Erro na Brasil API: ${response.status}`);
        }

        const cepInfo = await response.json();

        return {
          ...cepInfo,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao consultar CEP:", error);
        throw new Error(
          `Falha ao consultar CEP ${context.cep}: ${error.message}`
        );
      }
    },
  });

/**
 * Ferramenta para consultar DDD via Brasil API
 */
export const createConsultarDddTool = (env: Env) =>
  createTool({
    id: "CONSULTAR_DDD",
    description: "Consulta informações de um DDD usando a Brasil API",
    inputSchema: z.object({
      ddd: z.string().describe("DDD a ser consultado (2 dígitos)"),
    }),
    outputSchema: z.object({
      state: z.string(),
      cities: z.array(z.string()),
      ddd: z.string(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        // Limpar formatação do DDD
        const dddLimpo = context.ddd.replace(/\D/g, "");

        if (dddLimpo.length !== 2) {
          throw new Error("DDD deve ter 2 dígitos");
        }

        const dddNum = parseInt(dddLimpo);
        if (dddNum < 11 || dddNum > 99) {
          throw new Error("DDD deve estar entre 11 e 99");
        }

        const response = await fetch(
          `https://brasilapi.com.br/api/ddd/v1/${dddLimpo}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("DDD não encontrado");
          }
          throw new Error(`Erro na Brasil API: ${response.status}`);
        }

        const dddInfo = await response.json();

        return {
          ...dddInfo,
          ddd: context.ddd,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao consultar DDD:", error);
        throw new Error(
          `Falha ao consultar DDD ${context.ddd}: ${error.message}`
        );
      }
    },
  });

/**
 * Ferramenta para comparar indicadores entre dois municípios
 */
export const createCompararIndicadoresTool = (env: Env) =>
  createTool({
    id: "COMPARAR_INDICADORES",
    description:
      "Compara indicadores entre dois municípios usando a API do IBGE",
    inputSchema: z.object({
      municipio1Id: z.number().describe("ID do primeiro município"),
      municipio2Id: z.number().describe("ID do segundo município"),
      indicadorId: z.number().describe("ID do indicador a ser comparado"),
      ano: z.number().optional().describe("Ano do indicador (opcional)"),
    }),
    outputSchema: z.object({
      municipio1: z.object({
        nome: z.string(),
        valor: z.union([z.number(), z.string()]),
        unidade: z.string(),
      }),
      municipio2: z.object({
        nome: z.string(),
        valor: z.union([z.number(), z.string()]),
        unidade: z.string(),
      }),
      diferenca: z.number().optional(),
      percentual: z.number().optional(),
      indicador: z.object({
        id: z.number(),
        nome: z.string(),
        ano: z.number(),
      }),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        if (context.municipio1Id === context.municipio2Id) {
          throw new Error("Os municípios devem ser diferentes para comparação");
        }

        // Buscar indicadores dos dois municípios
        const [indicador1Response, indicador2Response] = await Promise.all([
          fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${context.municipio1Id}/indicadores/${context.indicadorId}${context.ano ? `?ano=${context.ano}` : ""}`
          ),
          fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${context.municipio2Id}/indicadores/${context.indicadorId}${context.ano ? `?ano=${context.ano}` : ""}`
          ),
        ]);

        if (!indicador1Response.ok || !indicador2Response.ok) {
          throw new Error("Erro ao buscar indicadores dos municípios");
        }

        const [indicador1, indicador2] = await Promise.all([
          indicador1Response.json(),
          indicador2Response.json(),
        ]);

        if (!indicador1[0] || !indicador2[0]) {
          throw new Error(
            "Indicadores não encontrados para os municípios especificados"
          );
        }

        const dados1 = indicador1[0];
        const dados2 = indicador2[0];

        // Calcular diferença se os valores forem numéricos
        let diferenca: number | undefined;
        let percentual: number | undefined;

        if (
          typeof dados1.valor === "number" &&
          typeof dados2.valor === "number"
        ) {
          diferenca = dados1.valor - dados2.valor;
          percentual =
            dados2.valor !== 0 ? (diferenca / dados2.valor) * 100 : 0;
        }

        return {
          municipio1: {
            nome: dados1.municipio.nome,
            valor: dados1.valor,
            unidade: dados1.unidade,
          },
          municipio2: {
            nome: dados2.municipio.nome,
            valor: dados2.valor,
            unidade: dados2.unidade,
          },
          diferenca,
          percentual,
          indicador: {
            id: context.indicadorId,
            nome: dados1.nome,
            ano: context.ano || new Date().getFullYear(),
          },
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao comparar indicadores:", error);
        throw new Error(`Falha ao comparar indicadores: ${error.message}`);
      }
    },
  });

// ============================================================================
// FERRAMENTAS PARA GERENCIAMENTO DE HISTÓRICO E FAVORITOS
// ============================================================================

/**
 * Ferramenta para obter histórico de consultas do usuário
 */
export const createObterHistoricoConsultasTool = (env: Env) =>
  createPrivateTool({
    id: "OBTER_HISTORICO_CONSULTAS",
    description: "Obtém o histórico de consultas do usuário logado",
    inputSchema: z.object({
      tipo: z
        .enum(["estados", "municipios", "cep", "ddd", "comparacoes"])
        .optional()
        .describe("Tipo de consulta para filtrar"),
      limite: z
        .number()
        .min(1)
        .max(100)
        .default(20)
        .describe("Número máximo de registros a retornar"),
    }),
    outputSchema: z.object({
      historico: z.array(
        z.object({
          id: z.number(),
          tipo: z.string(),
          dados: z.record(z.any()),
          consultadoEm: z.string(),
        })
      ),
      total: z.number(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        const db = await getDb(env);

        let historico = [];
        let total = 0;

        // Buscar histórico baseado no tipo solicitado
        switch (context.tipo) {
          case "estados":
            const consultasEstados = await db
              .select()
              .from(consultasEstadosTable)
              .where(eq(consultasEstadosTable.userId, user.id))
              .orderBy(desc(consultasEstadosTable.consultadoEm))
              .limit(context.limite);

            historico = consultasEstados.map((c) => ({
              id: c.id,
              tipo: "estado",
              dados: {
                estadoId: c.estadoId,
                estadoSigla: c.estadoSigla,
                estadoNome: c.estadoNome,
                totalMunicipios: c.totalMunicipios,
              },
              consultadoEm: c.consultadoEm.toISOString(),
            }));
            total = consultasEstados.length;
            break;

          case "municipios":
            const consultasMunicipios = await db
              .select()
              .from(consultasMunicipiosTable)
              .where(eq(consultasMunicipiosTable.userId, user.id))
              .orderBy(desc(consultasMunicipiosTable.consultadoEm))
              .limit(context.limite);

            historico = consultasMunicipios.map((c) => ({
              id: c.id,
              tipo: "municipio",
              dados: {
                municipioId: c.municipioId,
                municipioNome: c.municipioNome,
                estadoId: c.estadoId,
                estadoSigla: c.estadoSigla,
                estadoNome: c.estadoNome,
              },
              consultadoEm: c.consultadoEm.toISOString(),
            }));
            total = consultasMunicipios.length;
            break;

          case "cep":
            const consultasCep = await db
              .select()
              .from(consultasCepTable)
              .where(eq(consultasCepTable.userId, user.id))
              .orderBy(desc(consultasCepTable.consultadoEm))
              .limit(context.limite);

            historico = consultasCep.map((c) => ({
              id: c.id,
              tipo: "cep",
              dados: {
                cep: c.cep,
                cidade: c.cidade,
                estado: c.estado,
                bairro: c.bairro,
                rua: c.rua,
              },
              consultadoEm: c.consultadoEm.toISOString(),
            }));
            total = consultasCep.length;
            break;

          case "ddd":
            const consultasDdd = await db
              .select()
              .from(consultasDddTable)
              .where(eq(consultasDddTable.userId, user.id))
              .orderBy(desc(consultasDddTable.consultadoEm))
              .limit(context.limite);

            historico = consultasDdd.map((c) => ({
              id: c.id,
              tipo: "ddd",
              dados: {
                ddd: c.ddd,
                estado: c.estado,
                totalCidades: c.totalCidades,
              },
              consultadoEm: c.consultadoEm.toISOString(),
            }));
            total = consultasDdd.length;
            break;

          case "comparacoes":
            const comparacoes = await db
              .select()
              .from(comparacoesIndicadoresTable)
              .where(eq(comparacoesIndicadoresTable.userId, user.id))
              .orderBy(desc(comparacoesIndicadoresTable.comparadoEm))
              .limit(context.limite);

            historico = comparacoes.map((c) => ({
              id: c.id,
              tipo: "comparacao",
              dados: {
                municipio1Nome: c.municipio1Nome,
                municipio2Nome: c.municipio2Nome,
                indicadorNome: c.indicadorNome,
                ano: c.ano,
                diferenca: c.diferenca,
                percentual: c.percentual,
                unidade: c.unidade,
              },
              consultadoEm: c.comparadoEm.toISOString(),
            }));
            total = comparacoes.length;
            break;

          default:
            // Buscar todos os tipos
            const [estados, municipios, ceps, ddds, comps] = await Promise.all([
              db
                .select()
                .from(consultasEstadosTable)
                .where(eq(consultasEstadosTable.userId, user.id))
                .orderBy(desc(consultasEstadosTable.consultadoEm))
                .limit(context.limite),
              db
                .select()
                .from(consultasMunicipiosTable)
                .where(eq(consultasMunicipiosTable.userId, user.id))
                .orderBy(desc(consultasMunicipiosTable.consultadoEm))
                .limit(context.limite),
              db
                .select()
                .from(consultasCepTable)
                .where(eq(consultasCepTable.userId, user.id))
                .orderBy(desc(consultasCepTable.consultadoEm))
                .limit(context.limite),
              db
                .select()
                .from(consultasDddTable)
                .where(eq(consultasDddTable.userId, user.id))
                .orderBy(desc(consultasDddTable.consultadoEm))
                .limit(context.limite),
              db
                .select()
                .from(comparacoesIndicadoresTable)
                .where(eq(comparacoesIndicadoresTable.userId, user.id))
                .orderBy(desc(comparacoesIndicadoresTable.comparadoEm))
                .limit(context.limite),
            ]);

            historico = [
              ...estados.map((c) => ({
                id: c.id,
                tipo: "estado",
                dados: {
                  estadoId: c.estadoId,
                  estadoSigla: c.estadoSigla,
                  estadoNome: c.estadoNome,
                  totalMunicipios: c.totalMunicipios,
                },
                consultadoEm: c.consultadoEm.toISOString(),
              })),
              ...municipios.map((c) => ({
                id: c.id,
                tipo: "municipio",
                dados: {
                  municipioId: c.municipioId,
                  municipioNome: c.municipioNome,
                  estadoId: c.estadoId,
                  estadoSigla: c.estadoSigla,
                  estadoNome: c.estadoNome,
                },
                consultadoEm: c.consultadoEm.toISOString(),
              })),
              ...ceps.map((c) => ({
                id: c.id,
                tipo: "cep",
                dados: {
                  cep: c.cep,
                  cidade: c.cidade,
                  estado: c.estado,
                  bairro: c.bairro,
                  rua: c.rua,
                },
                consultadoEm: c.consultadoEm.toISOString(),
              })),
              ...ddds.map((c) => ({
                id: c.id,
                tipo: "ddd",
                dados: {
                  ddd: c.ddd,
                  estado: c.estado,
                  totalCidades: c.totalCidades,
                },
                consultadoEm: c.consultadoEm.toISOString(),
              })),
              ...comps.map((c) => ({
                id: c.id,
                tipo: "comparacao",
                dados: {
                  municipio1Nome: c.municipio1Nome,
                  municipio2Nome: c.municipio2Nome,
                  indicadorNome: c.indicadorNome,
                  ano: c.ano,
                  diferenca: c.diferenca,
                  percentual: c.percentual,
                  unidade: c.unidade,
                },
                consultadoEm: c.comparadoEm.toISOString(),
              })),
            ];

            // Ordenar por data mais recente
            historico.sort(
              (a, b) =>
                new Date(b.consultadoEm).getTime() -
                new Date(a.consultadoEm).getTime()
            );
            historico = historico.slice(0, context.limite);
            total = historico.length;
            break;
        }

        return {
          historico,
          total,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao obter histórico:", error);
        throw new Error("Falha ao obter histórico de consultas");
      }
    },
  });

/**
 * Ferramenta para adicionar município aos favoritos
 */
export const createAdicionarMunicipioFavoritoTool = (env: Env) =>
  createPrivateTool({
    id: "ADICIONAR_MUNICIPIO_FAVORITO",
    description: "Adiciona um município aos favoritos do usuário",
    inputSchema: z.object({
      municipioId: z.number().describe("ID do município"),
      municipioNome: z.string().describe("Nome do município"),
      estadoId: z.number().describe("ID do estado"),
      estadoSigla: z.string().describe("Sigla do estado"),
      estadoNome: z.string().describe("Nome do estado"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      favorito: z.object({
        id: z.number(),
        municipioId: z.number(),
        municipioNome: z.string(),
        estadoId: z.number(),
        estadoSigla: z.string(),
        estadoNome: z.string(),
        adicionadoEm: z.string(),
      }),
      message: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        const db = await getDb(env);

        // Verificar se já existe nos favoritos
        const existing = await db
          .select()
          .from(municipiosFavoritosTable)
          .where(
            and(
              eq(municipiosFavoritosTable.userId, user.id),
              eq(municipiosFavoritosTable.municipioId, context.municipioId)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          return {
            success: false,
            favorito: {
              id: existing[0].id,
              municipioId: existing[0].municipioId,
              municipioNome: existing[0].municipioNome,
              estadoId: existing[0].estadoId,
              estadoSigla: existing[0].estadoSigla,
              estadoNome: existing[0].estadoNome,
              adicionadoEm: existing[0].adicionadoEm.toISOString(),
            },
            message: "Município já está nos favoritos",
          };
        }

        // Adicionar aos favoritos
        const novoFavorito = await db
          .insert(municipiosFavoritosTable)
          .values({
            userId: user.id,
            municipioId: context.municipioId,
            municipioNome: context.municipioNome,
            estadoId: context.estadoId,
            estadoSigla: context.estadoSigla,
            estadoNome: context.estadoNome,
            adicionadoEm: new Date(),
          })
          .returning();

        return {
          success: true,
          favorito: {
            id: novoFavorito[0].id,
            municipioId: novoFavorito[0].municipioId,
            municipioNome: novoFavorito[0].municipioNome,
            estadoId: novoFavorito[0].estadoId,
            estadoSigla: novoFavorito[0].estadoSigla,
            estadoNome: novoFavorito[0].estadoNome,
            adicionadoEm: novoFavorito[0].adicionadoEm.toISOString(),
          },
          message: "Município adicionado aos favoritos com sucesso",
        };
      } catch (error: any) {
        // Error handling:("Erro ao adicionar favorito:", error);
        throw new Error("Falha ao adicionar município aos favoritos");
      }
    },
  });

/**
 * Ferramenta para listar municípios favoritos do usuário
 */
export const createListarMunicipiosFavoritosTool = (env: Env) =>
  createPrivateTool({
    id: "LISTAR_MUNICIPIOS_FAVORITOS",
    description: "Lista os municípios favoritos do usuário logado",
    inputSchema: z.object({}),
    outputSchema: z.object({
      favoritos: z.array(
        z.object({
          id: z.number(),
          municipioId: z.number(),
          municipioNome: z.string(),
          estadoId: z.number(),
          estadoSigla: z.string(),
          estadoNome: z.string(),
          adicionadoEm: z.string(),
        })
      ),
      total: z.number(),
      timestamp: z.string(),
    }),
    execute: async () => {
      try {
        const user = env.DECO_CHAT_REQUEST_CONTEXT.ensureAuthenticated();
        if (!user) {
          throw new Error("Usuário não autenticado");
        }
        const db = await getDb(env);

        const favoritos = await db
          .select()
          .from(municipiosFavoritosTable)
          .where(eq(municipiosFavoritosTable.userId, user.id))
          .orderBy(desc(municipiosFavoritosTable.adicionadoEm));

        return {
          favoritos: favoritos.map((f) => ({
            id: f.id,
            municipioId: f.municipioId,
            municipioNome: f.municipioNome,
            estadoId: f.estadoId,
            estadoSigla: f.estadoSigla,
            estadoNome: f.estadoNome,
            adicionadoEm: f.adicionadoEm.toISOString(),
          })),
          total: favoritos.length,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        // Error handling:("Erro ao listar favoritos:", error);
        throw new Error("Falha ao listar municípios favoritos");
      }
    },
  });

/**
 * Ferramenta genérica para envio de emails via Gmail
 */
export const createSendEmailTool = (env: Env) =>
  createTool({
    id: "SEND_EMAIL",
    description: "Envia email via Gmail usando a integração configurada",
    inputSchema: z.object({
      to: z.string().email("Email de destino inválido"),
      subject: z.string().min(1, "Assunto é obrigatório"),
      body: z.string().min(1, "Corpo do email é obrigatório"),
      contentType: z
        .enum(["text/plain", "text/html"])
        .default("text/plain")
        .describe("Tipo de conteúdo do email"),
      cc: z.string().email().optional().describe("Email para cópia (CC)"),
      bcc: z
        .string()
        .email()
        .optional()
        .describe("Email para cópia oculta (BCC)"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
      error: z.string().optional(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        // Verificar se a integração Gmail está disponível
        if (!(env as any).MCP_GMAIL_N1?.SendEmail) {
          return {
            success: false,
            error: "Serviço de email não está configurado corretamente",
            timestamp: new Date().toISOString(),
          };
        }

        // Preparar dados do email
        const emailData: any = {
          to: context.to,
          subject: context.subject,
        };

        // Definir tipo de conteúdo baseado no contentType
        if (context.contentType === "text/html") {
          emailData.bodyHtml = context.body;
        } else {
          emailData.bodyText = context.body;
        }

        // Adicionar CC se fornecido
        if (context.cc) {
          emailData.cc = context.cc;
        }

        // Adicionar BCC se fornecido
        if (context.bcc) {
          emailData.bcc = context.bcc;
        }

        // Debug info removed for production

        // Enviar email via Gmail
        const response = await (env as any).MCP_GMAIL_N1.SendEmail(emailData);

        // Response processed

        return {
          success: true,
          messageId:
            response.messageId || response.id || "Email enviado com sucesso",
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao enviar email:", error);
        return {
          success: false,
          error: error.message || "Erro desconhecido ao enviar email",
          timestamp: new Date().toISOString(),
        };
      }
    },
  });

/**
 * Ferramenta para envio de email com template personalizado
 */
export const createSendTemplatedEmailTool = (env: Env) =>
  createTool({
    id: "SEND_TEMPLATED_EMAIL",
    description: "Envia email usando templates HTML pré-definidos",
    inputSchema: z.object({
      to: z.string().email("Email de destino inválido"),
      template: z
        .enum(["welcome", "notification", "report", "alert", "custom"])
        .describe("Tipo de template a ser usado"),
      subject: z.string().min(1, "Assunto é obrigatório"),
      data: z.record(z.any()).describe("Dados para preencher o template"),
      customHtml: z
        .string()
        .optional()
        .describe("HTML customizado (usado apenas com template 'custom')"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      messageId: z.string().optional(),
      error: z.string().optional(),
      template: z.string(),
      timestamp: z.string(),
    }),
    execute: async ({ context }) => {
      try {
        // Verificar se a integração Gmail está disponível
        if (!(env as any).MCP_GMAIL_N1?.SendEmail) {
          return {
            success: false,
            error: "Serviço de email não está configurado corretamente",
            template: context.template,
            timestamp: new Date().toISOString(),
          };
        }

        let htmlContent = "";

        // Gerar conteúdo baseado no template
        switch (context.template) {
          case "welcome":
            htmlContent = generateWelcomeTemplate(context.data);
            break;
          case "notification":
            htmlContent = generateNotificationTemplate(context.data);
            break;
          case "report":
            htmlContent = generateReportTemplate(context.data);
            break;
          case "alert":
            htmlContent = generateAlertTemplate(context.data);
            break;
          case "custom":
            htmlContent = context.customHtml || "";
            break;
          default:
            throw new Error(`Template '${context.template}' não suportado`);
        }

        if (!htmlContent) {
          throw new Error("Falha ao gerar conteúdo do template");
        }

        // Enviar email
        const response = await (env as any).MCP_GMAIL_N1.SendEmail({
          to: context.to,
          subject: context.subject,
          bodyHtml: htmlContent,
        });

        return {
          success: true,
          messageId: response.messageId || "Email enviado com sucesso",
          template: context.template,
          timestamp: new Date().toISOString(),
        };
      } catch (error: any) {
        // Error handling:("Erro ao enviar email com template:", error);
        return {
          success: false,
          error: error.message || "Erro desconhecido ao enviar email",
          template: context.template,
          timestamp: new Date().toISOString(),
        };
      }
    },
  });

// Funções auxiliares para gerar templates
const generateWelcomeTemplate = (data: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px; }
        .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo!</h1>
        </div>
        <div class="content">
          <h2>Olá, ${data.nome || "Usuário"}!</h2>
          <p>${data.mensagem || "Seja bem-vindo à nossa plataforma!"}</p>
          ${data.link ? `<a href="${data.link}" class="button">Começar agora</a>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateNotificationTemplate = (data: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificação</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { padding: 20px; background: #f8f9fa; border-radius: 10px; margin-top: 20px; }
        .timestamp { color: #6c757d; font-size: 0.9em; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Notificação</h1>
        </div>
        <div class="content">
          <h2>${data.titulo || "Nova notificação"}</h2>
          <p>${data.mensagem || "Você tem uma nova notificação."}</p>
          <div class="timestamp">
            Data: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateReportTemplate = (data: any): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-number { font-size: 1.8em; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${data.titulo || "Relatório"}</h1>
          <p>${data.subtitulo || "Relatório gerado automaticamente"}</p>
        </div>
        <div class="content">
          <p>${data.descricao || "Descrição do relatório"}</p>
          
          ${
            data.estatisticas
              ? `
            <div class="stats">
              ${Object.entries(data.estatisticas)
                .map(
                  ([key, value]) => `
                <div class="stat-card">
                  <div class="stat-number">${value}</div>
                  <div>${key}</div>
                </div>
              `
                )
                .join("")}
            </div>
          `
              : ""
          }
          
          ${
            data.detalhes
              ? `
            <h3>Detalhes</h3>
            <p>${data.detalhes}</p>
          `
              : ""
          }
          
          <div style="margin-top: 30px; color: #6c757d; font-size: 0.9em;">
            Relatório gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateAlertTemplate = (data: any): string => {
  const alertType = data.tipo || "info";
  const alertColors = {
    error: "#dc3545",
    warning: "#ffc107",
    success: "#28a745",
    info: "#17a2b8",
  };

  const alertIcons = {
    error: "❌",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️",
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${alertColors[alertType as keyof typeof alertColors] || alertColors.info}; color: white; padding: 20px; text-align: center; border-radius: 10px; }
        .content { padding: 20px; background: #f8f9fa; border-radius: 10px; margin-top: 20px; }
        .alert-box { background: white; border-left: 4px solid ${alertColors[alertType as keyof typeof alertColors] || alertColors.info}; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .priority { font-weight: bold; text-transform: uppercase; color: ${alertColors[alertType as keyof typeof alertColors] || alertColors.info}; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${alertIcons[alertType as keyof typeof alertIcons] || alertIcons.info} Alerta</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <div class="priority">Prioridade: ${data.prioridade || "Normal"}</div>
            <h2>${data.titulo || "Alerta do Sistema"}</h2>
            <p>${data.mensagem || "Um evento importante foi detectado."}</p>
            
            ${
              data.detalhes
                ? `
              <h3>Detalhes:</h3>
              <p>${data.detalhes}</p>
            `
                : ""
            }
            
            ${
              data.acaoRequerida
                ? `
              <h3>Ação Requerida:</h3>
              <p>${data.acaoRequerida}</p>
            `
                : ""
            }
          </div>
          
          <div style="margin-top: 20px; color: #6c757d; font-size: 0.9em;">
            Alerta gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const tools = [
  createGetUserTool,
  // Ferramentas para indicadores municipais
  createListarEstadosTool,
  createListarMunicipiosPorEstadoTool,
  createBuscarMunicipiosPorNomeTool,
  createConsultarCepTool,
  createConsultarDddTool,
  createCompararIndicadoresTool,
  // Ferramentas para histórico e favoritos
  createObterHistoricoConsultasTool,
  createAdicionarMunicipioFavoritoTool,
  createListarMunicipiosFavoritosTool,
  // Ferramentas para salvar comparações
  createSalvarComparacaoTool,
  createListarComparacoesSalvasTool,
  createCarregarComparacaoSalvaTool,
  createDeletarComparacaoSalvaTool,
  createSendComparisonReportTool,
  // Ferramentas de email
  createSendEmailTool,
  createSendTemplatedEmailTool,
];
