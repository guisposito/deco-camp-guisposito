# 🤝 Guia de Contribuição

Obrigado por considerar contribuir com o **Comparador de Indicadores Municipais**! Este guia irá ajudá-lo a começar.

## 📋 Índice

- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Padrões de Código](#padrões-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Funcionalidades](#sugerir-funcionalidades)

## 🚀 Como Contribuir

### 1. **Fork e Clone**
```bash
# Fork no GitHub primeiro, depois:
git clone https://github.com/SEU_USERNAME/guisposit-camp.git
cd guisposit-camp
```

### 2. **Configurar Ambiente**
```bash
# Instalar dependências
npm install

# Configurar Deco
npm run configure

# Iniciar desenvolvimento
npm run dev
```

### 3. **Criar Branch**
```bash
# Nomenclatura: tipo/descrição-curta
git checkout -b feature/nova-funcionalidade
git checkout -b fix/corrigir-bug
git checkout -b docs/melhorar-readme
```

## ⚙️ Configuração do Ambiente

### **Pré-requisitos**
- Node.js ≥ 18.0.0
- npm ≥ 8.0.0
- Deno ≥ 2.0.0
- Conta no [deco.chat](https://deco.chat)

### **Setup Completo**
```bash
# 1. Dependências
npm install

# 2. Deco CLI
deno install -Ar -g -n deco jsr:@deco/cli
deco login

# 3. Configuração
npm run configure
npm run gen

# 4. Desenvolvimento
npm run dev
```

## 📝 Padrões de Código

### **TypeScript**
- Use **TypeScript strict mode**
- Prefira `interface` sobre `type` para objetos
- Use `const assertions` quando apropriado
- Documente funções públicas com JSDoc

```typescript
/**
 * Compara indicadores entre dois municípios
 * @param municipio1Id - ID do primeiro município
 * @param municipio2Id - ID do segundo município
 * @param ano - Ano para comparação
 * @returns Dados da comparação
 */
export async function compararIndicadores(
  municipio1Id: number,
  municipio2Id: number,
  ano: number
): Promise<ComparacaoResult> {
  // implementação
}
```

### **React Components**
- Use **functional components** com hooks
- Prefira **arrow functions** para componentes
- Use **TypeScript interfaces** para props
- Mantenha componentes **pequenos e focados**

```typescript
interface Props {
  municipio: Municipio;
  onSelect: (id: number) => void;
}

export const MunicipioCard = ({ municipio, onSelect }: Props) => {
  const handleClick = () => onSelect(municipio.id);
  
  return (
    <div onClick={handleClick}>
      {municipio.nome}
    </div>
  );
};
```

### **CSS/Tailwind**
- Use **Tailwind classes** exclusivamente
- Prefira **design responsivo mobile-first**
- Use **semantic color names** (blue-600 vs #2563eb)
- Mantenha **componentes consistentes**

```typescript
// ✅ Bom
<div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">

// ❌ Evitar
<div style={{ backgroundColor: 'white', padding: '16px' }}>
```

### **Estrutura de Arquivos**
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes básicos (Button, Card, etc.)
│   ├── forms/          # Componentes de formulário
│   └── pages/          # Componentes de página
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── types/              # Definições de tipos
└── constants/          # Constantes da aplicação
```

## 🔄 Processo de Pull Request

### **1. Antes de Submeter**
```bash
# Testes
npm test

# Linting
npm run lint

# Type checking
npm run type-check

# Build
npm run build
```

### **2. Commit Messages**
Use [Conventional Commits](https://conventionalcommits.org/):

```bash
feat: adiciona comparação de múltiplos municípios
fix: corrige bug na busca de CEP
docs: atualiza documentação da API
style: melhora responsividade do header
refactor: simplifica componente MunicipioCard
test: adiciona testes para hooks de favoritos
```

### **3. Pull Request Template**
```markdown
## 📝 Descrição
Breve descrição das mudanças...

## 🔄 Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## ✅ Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Testes passando
- [ ] Lint sem erros

## 📷 Screenshots (se aplicável)
...
```

## 🐛 Reportar Bugs

### **Template de Bug Report**
```markdown
**🐛 Descrição do Bug**
Descrição clara do que aconteceu.

**🔄 Passos para Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Role para baixo até '...'
4. Veja o erro

**✅ Comportamento Esperado**
O que deveria acontecer.

**📷 Screenshots**
Se aplicável, adicione screenshots.

**🖥️ Ambiente**
- OS: [ex: Windows 10]
- Browser: [ex: Chrome 91]
- Versão: [ex: 1.0.0]

**📝 Contexto Adicional**
Qualquer outro contexto sobre o problema.
```

## 💡 Sugerir Funcionalidades

### **Template de Feature Request**
```markdown
**🚀 Funcionalidade Solicitada**
Descrição clara da funcionalidade.

**🎯 Problema que Resolve**
Qual problema esta funcionalidade resolve?

**💭 Solução Proposta**
Descrição de como você imagina que funcione.

**🔄 Alternativas Consideradas**
Outras soluções que você considerou.

**📝 Contexto Adicional**
Qualquer outro contexto, screenshots, etc.
```

## 🎯 Áreas que Precisam de Ajuda

### **🎨 Frontend/UI**
- Melhorias na experiência do usuário
- Componentes de visualização de dados
- Animações e transições
- Responsividade mobile

### **⚙️ Backend/API**
- Otimização de performance
- Cache inteligente
- Novas integrações de API
- Ferramentas MCP avançadas

### **📊 Data & Analytics**
- Gráficos interativos
- Exportação de dados
- Análises estatísticas
- Dashboards personalizados

### **🧪 Testes & Qualidade**
- Testes unitários
- Testes de integração
- Testes E2E
- Performance testing

### **📖 Documentação**
- Guias de uso
- Documentação de API
- Tutoriais em vídeo
- Exemplos práticos

## 🏷️ Labels do GitHub

- `bug` - Algo não está funcionando
- `enhancement` - Nova funcionalidade ou melhoria
- `documentation` - Melhorias na documentação
- `good first issue` - Boa primeira contribuição
- `help wanted` - Ajuda extra é bem-vinda
- `question` - Mais informações necessárias
- `wontfix` - Não será trabalhado

## 📞 Suporte

- **💬 Discord**: [Deco Community](https://discord.gg/deco)
- **📧 Email**: [Abrir Issue](https://github.com/seu-usuario/guisposit-camp/issues)
- **📖 Docs**: [Documentação Deco](https://docs.deco.page)

## 🙏 Reconhecimento

Todas as contribuições são valorizadas e reconhecidas! Contribuidores aparecerão automaticamente na seção de contributors do GitHub.

---

**Obrigado por contribuir! 🚀**
