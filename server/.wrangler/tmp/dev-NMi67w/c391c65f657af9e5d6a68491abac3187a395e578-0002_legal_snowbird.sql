CREATE TABLE `comparacoes_salvas` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text,
	`municipio1_id` integer NOT NULL,
	`municipio1_nome` text NOT NULL,
	`municipio1_estado` text NOT NULL,
	`municipio2_id` integer NOT NULL,
	`municipio2_nome` text NOT NULL,
	`municipio2_estado` text NOT NULL,
	`ano` integer NOT NULL,
	`total_indicadores` integer NOT NULL,
	`dados_comparacao` text NOT NULL,
	`salva_em` integer NOT NULL,
	`atualizada_em` integer NOT NULL
);
