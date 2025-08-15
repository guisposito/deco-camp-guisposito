CREATE TABLE `comparacoes_indicadores` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`municipio1_id` integer NOT NULL,
	`municipio1_nome` text NOT NULL,
	`municipio2_id` integer NOT NULL,
	`municipio2_nome` text NOT NULL,
	`indicador_id` integer NOT NULL,
	`indicador_nome` text NOT NULL,
	`ano` integer,
	`valor1` real,
	`valor2` real,
	`diferenca` real,
	`percentual` real,
	`unidade` text,
	`comparado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consultas_cep` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cep` text NOT NULL,
	`cidade` text NOT NULL,
	`estado` text NOT NULL,
	`bairro` text,
	`rua` text,
	`consultado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consultas_ddd` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ddd` text NOT NULL,
	`estado` text NOT NULL,
	`total_cidades` integer NOT NULL,
	`consultado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consultas_estados` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`estado_id` integer NOT NULL,
	`estado_sigla` text NOT NULL,
	`estado_nome` text NOT NULL,
	`total_municipios` integer NOT NULL,
	`consultado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `consultas_municipios` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`municipio_id` integer NOT NULL,
	`municipio_nome` text NOT NULL,
	`estado_id` integer NOT NULL,
	`estado_sigla` text NOT NULL,
	`estado_nome` text NOT NULL,
	`consultado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `indicadores_favoritos` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`indicador_id` integer NOT NULL,
	`indicador_nome` text NOT NULL,
	`categoria` text,
	`adicionado_em` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `municipios_favoritos` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`municipio_id` integer NOT NULL,
	`municipio_nome` text NOT NULL,
	`estado_id` integer NOT NULL,
	`estado_sigla` text NOT NULL,
	`estado_nome` text NOT NULL,
	`adicionado_em` integer NOT NULL
);
