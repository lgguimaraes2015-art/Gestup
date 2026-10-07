# GestUp — Plataforma de Gestão de Tarefas, Obrigações Fiscais & CRM
> Desenvolvido com exclusividade para **fin.up — Consultoria Financeira e Tributária**

---

## 🎯 Visão Geral
O **GestUp v2** é a evolução sob medida da aplicação originária do Base44, agora reconstruída em arquitetura profissional com **Next.js 14, TypeScript e Tailwind CSS**.

O sistema elimina todas as limitações de plataformas no-code, agregando:
1. **Central Ativa de WhatsApp:** Envio automatizado de resumos diários para colaboradores às 08:30, cobrança de prazos e solicitações de documentos fiscais para clientes.
2. **Duplo Prazo Fiscal:** Diferenciação nítida entre **Prazo Meta (Interno)** e **Prazo Legal (Multa)** com alertas de risco.
3. **Onboarding Automatizado de CRM:** Ao fechar um Lead no funil comercial, o sistema cria o cliente, gera o procedimento com etapas padronizadas, distribui as tarefas na fila da equipe e dispara mensagem de boas-vindas no WhatsApp.
4. **Visualização 3 em 1:** Alternância instantânea entre Lista Detalhada, Quadro Kanban e Calendário.
5. **Portal do Cliente:** Ambiente externo para consulta de certidões negativas (CND) e envio de extratos bancários.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js v18 ou superior instalado.

### Passo a Passo

```bash
# 1. Acesse o diretório do projeto
cd C:\Users\luizv\.gemini\antigravity\scratch\gestup

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse a aplicação no navegador em:
**`http://localhost:3000`**

---

## 📱 Estrutura de Pastas
```
gestup/
├── public/
│   └── logo.png              # Logotipo oficial da fin.up
├── src/
│   ├── app/                  # Rotas do Next.js App Router
│   ├── components/           # Componentes visuais
│   │   ├── Header.tsx        # Topbar com ações e gatilho de WhatsApp
│   │   ├── Sidebar.tsx       # Navegação com módulos Operacional e CRM
│   │   └── views/            # Visões das telas do sistema
│   │       ├── TarefasView.tsx
│   │       ├── ClientesView.tsx
│   │       ├── ColaboradoresView.tsx
│   │       ├── DeclaracoesView.tsx
│   │       ├── CRMLeadsView.tsx
│   │       ├── ProcedimentosView.tsx
│   │       ├── WhatsAppCentralView.tsx
│   │       └── PortalClienteView.tsx
│   ├── context/
│   │   └── AppContext.tsx    # Estado global e automações
│   ├── lib/
│   │   └── mockData.ts       # Dados iniciais brasileiros realistas
│   └── types/
│       └── index.ts          # Tipagem TypeScript de todas as entidades
```

---

## 📦 Produção e Deploy
Para gerar o build de produção:
```bash
npm run build
npm start
```
Pode ser hospedado gratuitamente na **Vercel** ou em servidores próprios (Docker / Node.js).
