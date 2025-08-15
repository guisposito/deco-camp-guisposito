/**
 * This file is used to define the schema for the database.
 *
 * After making changes to this file, run `npm run db:generate` to generate the migration file.
 * Then, by just using the app, the migration is lazily ensured at runtime.
 */
import {
  integer,
  sqliteTable,
  text,
  real,
} from "@deco/workers-runtime/drizzle";

// ============================================================================
// TABELAS PARA SISTEMA DE INDICADORES MUNICIPAIS
// ============================================================================

/**
 * Tabela para armazenar histórico de consultas de estados
 */
export const consultasEstadosTable = sqliteTable("consultas_estados", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  estadoId: integer("estado_id").notNull(),
  estadoSigla: text("estado_sigla").notNull(),
  estadoNome: text("estado_nome").notNull(),
  totalMunicipios: integer("total_municipios").notNull(),
  consultadoEm: integer("consultado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar histórico de consultas de municípios
 */
export const consultasMunicipiosTable = sqliteTable("consultas_municipios", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  municipioId: integer("municipio_id").notNull(),
  municipioNome: text("municipio_nome").notNull(),
  estadoId: integer("estado_id").notNull(),
  estadoSigla: text("estado_sigla").notNull(),
  estadoNome: text("estado_nome").notNull(),
  consultadoEm: integer("consultado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar histórico de consultas de CEP
 */
export const consultasCepTable = sqliteTable("consultas_cep", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  cep: text("cep").notNull(),
  cidade: text("cidade").notNull(),
  estado: text("estado").notNull(),
  bairro: text("bairro"),
  rua: text("rua"),
  consultadoEm: integer("consultado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar histórico de consultas de DDD
 */
export const consultasDddTable = sqliteTable("consultas_ddd", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  ddd: text("ddd").notNull(),
  estado: text("estado").notNull(),
  totalCidades: integer("total_cidades").notNull(),
  consultadoEm: integer("consultado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar histórico de comparações de indicadores
 */
export const comparacoesIndicadoresTable = sqliteTable(
  "comparacoes_indicadores",
  {
    id: integer("id").primaryKey(),
    userId: text("user_id").notNull(),
    municipio1Id: integer("municipio1_id").notNull(),
    municipio1Nome: text("municipio1_nome").notNull(),
    municipio2Id: integer("municipio2_id").notNull(),
    municipio2Nome: text("municipio2_nome").notNull(),
    indicadorId: integer("indicador_id").notNull(),
    indicadorNome: text("indicador_nome").notNull(),
    ano: integer("ano"),
    valor1: real("valor1"),
    valor2: real("valor2"),
    diferenca: real("diferenca"),
    percentual: real("percentual"),
    unidade: text("unidade"),
    comparadoEm: integer("comparado_em", { mode: "timestamp" }).notNull(),
  }
);

/**
 * Tabela para armazenar municípios favoritos dos usuários
 */
export const municipiosFavoritosTable = sqliteTable("municipios_favoritos", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  municipioId: integer("municipio_id").notNull(),
  municipioNome: text("municipio_nome").notNull(),
  estadoId: integer("estado_id").notNull(),
  estadoSigla: text("estado_sigla").notNull(),
  estadoNome: text("estado_nome").notNull(),
  adicionadoEm: integer("adicionado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar indicadores favoritos dos usuários
 */
export const indicadoresFavoritosTable = sqliteTable("indicadores_favoritos", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  indicadorId: integer("indicador_id").notNull(),
  indicadorNome: text("indicador_nome").notNull(),
  categoria: text("categoria"),
  adicionadoEm: integer("adicionado_em", { mode: "timestamp" }).notNull(),
});

/**
 * Tabela para armazenar comparações completas salvas pelos usuários
 */
export const comparacoesSalvasTable = sqliteTable("comparacoes_salvas", {
  id: integer("id").primaryKey(),
  userId: text("user_id").notNull(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  municipio1Id: integer("municipio1_id").notNull(),
  municipio1Nome: text("municipio1_nome").notNull(),
  municipio1Estado: text("municipio1_estado").notNull(),
  municipio2Id: integer("municipio2_id").notNull(),
  municipio2Nome: text("municipio2_nome").notNull(),
  municipio2Estado: text("municipio2_estado").notNull(),
  ano: integer("ano").notNull(),
  totalIndicadores: integer("total_indicadores").notNull(),
  dadosComparacao: text("dados_comparacao").notNull(), // JSON com todos os dados da comparação
  salvaEm: integer("salva_em", { mode: "timestamp" }).notNull(),
  atualizadaEm: integer("atualizada_em", { mode: "timestamp" }).notNull(),
});
