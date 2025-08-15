# 📊 Comparador de Indicadores Municipais

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Tech Stack](https://img.shields.io/badge/stack-React%20%2B%20Cloudflare%20Workers-orange.svg)

**Plataforma para análise e comparação de indicadores socioeconômicos dos municípios brasileiros**

_Construído com dados oficiais do IBGE usando Deco + React_

</div>

---

## 🎯 **O que é**

O **Comparador de Indicadores Municipais** permite explorar e comparar **100+ indicadores socioeconômicos** de todos os **5.570+ municípios brasileiros** usando dados oficiais do IBGE.

### ✨ **Principais funcionalidades**

- 🗺️ **Exploração por Estados**: Navegue pelos 26 estados + DF
- 📊 **Comparação de Municípios**: Compare indicadores entre 2 municípios
- 📍 **Consulta CEP/DDD**: Informações de localização completas
- ⭐ **Favoritos**: Salve municípios e comparações de interesse
- 📧 **Relatórios**: Envie comparações por email
- 📱 **Responsivo**: Funciona em desktop, tablet e mobile

---

## 🚀 **Como usar**

### **1. Instalação**

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/guisposit-camp.git
cd guisposit-camp

# Instalar dependências
npm install

# Instalar Deco CLI
deno install -Ar -g -n deco jsr:@deco/cli

# Configurar projeto
deco login
npm run configure
```

### **2. Desenvolvimento**

```bash
# Iniciar servidor
npm run dev

# Acessar aplicação
# Frontend: http://localhost:5173
# Backend: http://localhost:8787
```

### **3. Deploy**

```bash
npm run deploy
```

---

## 🛠️ **Tecnologias**

### **Backend**

- **Cloudflare Workers**: Runtime serverless
- **Deco Framework**: MCP tools e workflows
- **SQLite + Drizzle**: Banco de dados
- **APIs**: IBGE e Brasil API

### **Frontend**

- **React 18**: Interface moderna
- **Tailwind CSS**: Estilização responsiva
- **TanStack Router**: Navegação type-safe
- **TanStack Query**: Gerenciamento de estado

---

## 📋 **Estrutura do Projeto**

```
guisposit-camp/
├── server/                  # Backend MCP Server
│   ├── main.ts             # Entry point
│   ├── tools.ts            # Ferramentas MCP
│   ├── schema.ts           # Schema do banco
│   └── drizzle/            # Migrações
│
├── view/                   # Frontend React
│   ├── src/components/     # Componentes UI
│   ├── src/hooks/         # Custom hooks
│   └── src/lib/           # Utilitários
│
└── README.md              # Este arquivo
```

---

## 🔧 **Principais Ferramentas**

| Funcionalidade                 | Descrição                            |
| ------------------------------ | ------------------------------------ |
| `LISTAR_ESTADOS`               | Lista todos os estados brasileiros   |
| `LISTAR_MUNICIPIOS_POR_ESTADO` | Municípios de um estado              |
| `BUSCAR_MUNICIPIOS_POR_NOME`   | Busca municípios por nome            |
| `COMPARAR_INDICADORES`         | Compara indicadores entre municípios |
| `CONSULTAR_CEP`                | Informações de CEP                   |
| `CONSULTAR_DDD`                | Informações de DDD                   |
| `SALVAR_COMPARACAO`            | Salva comparação completa            |
| `SEND_COMPARISON_REPORT`       | Envia relatório por email            |

---

## 📊 **Exemplo de Uso**

```typescript
// Buscar municípios
const municipios = await client.BUSCAR_MUNICIPIOS_POR_NOME({
  nome: "São Paulo",
  limite: 10,
});

// Comparar indicadores
const comparacao = await client.COMPARAR_INDICADORES({
  municipio1Id: 3550308, // São Paulo - SP
  municipio2Id: 3304557, // Rio de Janeiro - RJ
  ano: 2022,
});

// Enviar relatório
const emailResult = await client.SEND_COMPARISON_REPORT({
  email: "usuario@exemplo.com",
  municipio1: "São Paulo - SP",
  municipio2: "Rio de Janeiro - RJ",
  ano: 2022,
  dadosComparacao: comparacao.indicadores,
});
```

---

## 🗄️ **Banco de Dados**

O sistema usa SQLite com as seguintes tabelas principais:

- **`consultas_estados`** - Histórico de consultas
- **`municipios_favoritos`** - Municípios favoritos dos usuários
- **`comparacoes_salvas`** - Comparações completas salvas
- **`consultas_cep`** - Histórico de consultas CEP
- **`consultas_ddd`** - Histórico de consultas DDD

### Migrações

```bash
# Gerar migração após alterar schema
npm run db:generate

# Migrações são aplicadas automaticamente
```

---

## 🌐 **APIs Utilizadas**

### **IBGE API**

- **URL**: `https://servicodados.ibge.gov.br/api/v1`
- **Dados**: Estados, municípios, indicadores
- **Documentação**: [IBGE API](https://servicodados.ibge.gov.br/docs)

### **Brasil API**

- **URL**: `https://brasilapi.com.br/api`
- **Dados**: CEP, DDD
- **Documentação**: [Brasil API](https://brasilapi.com.br/docs)

---

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'feat: nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

---

## 📜 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 **Suporte**

- **Documentação**: [docs.deco.page](https://docs.deco.page)
- **Comunidade**: [Discord Deco](https://discord.gg/deco)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/guisposit-camp/issues)

---

<div align="center">

**Desenvolvido com ❤️ usando Deco e Cloudflare Workers**

[![Deco](https://img.shields.io/badge/Deco-Platform-blue?style=for-the-badge)](https://deco.chat)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge)](https://workers.cloudflare.com)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge)](https://reactjs.org)

⭐ **Se este projeto foi útil, considere dar uma estrela!**

</div>
