# Frontend - Comparador de Indicadores Municipais

Este é o frontend da aplicação Comparador de Indicadores Municipais, desenvolvido em React com TypeScript e Tailwind CSS.

## 🚀 Tecnologias Utilizadas

- **React 19** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework de CSS utilitário
- **React Router DOM** - Roteamento da aplicação
- **Vite** - Build tool e dev server

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Header.tsx      # Cabeçalho da aplicação
│   ├── HomePage.tsx    # Página inicial
│   ├── EstadosPage.tsx # Lista de estados
│   ├── CompararPage.tsx # Comparação de indicadores
│   ├── CepDddPage.tsx  # Consulta de CEP/DDD
│   ├── LoadingSpinner.tsx # Spinner de carregamento
│   ├── ErrorBoundary.tsx # Boundary de erro
│   ├── InfoCard.tsx    # Card de informação
│   ├── SearchInput.tsx # Input de busca
│   ├── DataTable.tsx   # Tabela de dados
│   ├── StatsCard.tsx   # Card de estatísticas
│   └── index.ts        # Exportações dos componentes
├── App.tsx             # Componente principal da aplicação
├── main.tsx            # Ponto de entrada
└── index.css           # Estilos globais
```

## 🎯 Funcionalidades

### Páginas Principais

- **Home** - Página inicial com visão geral e navegação
- **Estados** - Lista de estados brasileiros com busca e filtros
- **Comparar** - Comparação de indicadores entre municípios
- **CEP/DDD** - Consulta de códigos postais e códigos de área
- **Municípios** - Gerenciamento de municípios favoritos
- **Favoritos** - Lista de itens favoritos do usuário
- **Histórico** - Histórico de consultas realizadas

### Componentes Reutilizáveis

- **LoadingSpinner** - Indicador de carregamento
- **ErrorBoundary** - Captura e exibe erros de forma elegante
- **InfoCard** - Card de informação clicável
- **SearchInput** - Campo de busca com debounce
- **DataTable** - Tabela de dados responsiva
- **StatsCard** - Exibição de estatísticas e métricas

## 🛠️ Comandos Disponíveis

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run serve

# Build com watch mode
npm run build:watch
```

## 🌐 Desenvolvimento

### Servidor de Desenvolvimento

O frontend roda na porta 4000 por padrão. Para acessar:

```
http://localhost:4000
```

### Hot Reload

O Vite oferece hot reload automático durante o desenvolvimento, atualizando a aplicação em tempo real quando arquivos são modificados.

## 🎨 Estilização

### Tailwind CSS

A aplicação utiliza Tailwind CSS v4 para estilização, oferecendo:

- Classes utilitárias para layout rápido
- Sistema de design consistente
- Responsividade mobile-first
- Customizações através de CSS customizado

### Animações

- Transições suaves em hover states
- Animações de loading
- Efeitos de entrada e saída
- Micro-interações para melhor UX

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- **Mobile** (< 768px)
- **Tablet** (768px - 1024px)
- **Desktop** (> 1024px)

## ♿ Acessibilidade

- Navegação por teclado
- Labels ARIA apropriados
- Contraste adequado
- Estrutura semântica HTML
- Suporte a leitores de tela

## 🔧 Configuração

### Variáveis de Ambiente

O frontend pode ser configurado através de variáveis de ambiente:

```bash
VITE_API_BASE_URL=http://localhost:8787
VITE_APP_TITLE=Comparador de Indicadores Municipais
```

### Build de Produção

O build de produção é otimizado para:

- Minificação de código
- Compressão de assets
- Tree shaking
- Code splitting automático

## 🚀 Deploy

### Build

```bash
npm run build
```

### Servir Build

```bash
npm run serve
```

O build é gerado na pasta `../server/view-build/` para integração com o backend.

## 📊 Performance

- **Lazy Loading** de componentes
- **Code Splitting** automático
- **Bundle Analysis** disponível
- **Optimizações** de imagem e assets

## 🧪 Testes

Para executar testes (quando implementados):

```bash
npm test
npm run test:watch
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste localmente
5. Faça commit das mudanças
6. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:

1. Verifique a documentação
2. Abra uma issue no repositório
3. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para o projeto Comparador de Indicadores Municipais**
