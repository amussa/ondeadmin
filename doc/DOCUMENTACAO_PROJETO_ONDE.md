# 📚 Documentação do Projeto ONDE

## 🎯 Visão Geral

O **ONDE** é uma plataforma digital de turismo em Moçambique, estruturada como um diretório de informação mobile-first. O sistema permite a descoberta e gestão de eventos e atividades turísticas através de um painel administrativo web.

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend - React"
        A[React App<br/>Port: 3000] --> B[React Router<br/>Navegação SPA]
        B --> C[Componentes UI<br/>Ant Design]
        C --> D[Firebase SDK]
    end
    
    subgraph "Backend - Firebase"
        D --> E[Firebase Auth<br/>Autenticação]
        D --> F[Firestore<br/>Base de Dados NoSQL]
        D --> G[Firebase Storage<br/>Armazenamento de Imagens]
    end
    
    subgraph "Backend Django - NÃO UTILIZADO"
        H[Django API<br/>Port: 8000] 
        H --> I[SQLite]
        H -.->|Sem Integração| A
    end
    
    style H fill:#ffcccc
    style I fill:#ffcccc
```

## ⚠️ Descoberta Importante

**O backend Django (`api_moz_sales`) NÃO está sendo utilizado no projeto atual.** O sistema funciona inteiramente com:
- **Frontend:** React com Ant Design
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Sem integração** entre o frontend React e o backend Django

## 📁 Estrutura do Projeto

```
ondeadmin/
├── 📂 src/                      # Frontend React
│   ├── 📂 Pages/                # Páginas da aplicação
│   │   ├── eventos/             # Gestão de eventos
│   │   ├── local/               # Gestão de locais turísticos
│   │   ├── financas/            # Módulo financeiro
│   │   ├── access/              # Gestão de acessos
│   │   └── Account/             # Autenticação
│   ├── 📂 Layouts/              # Layouts da aplicação
│   ├── 📂 Components/           # Componentes reutilizáveis
│   ├── base.js                  # Configuração Firebase
│   └── index.js                 # Ponto de entrada
│
├── 📂 trash/                    # Código não utilizado
│   └── api_moz_sales/           # Backend Django (MOVIDO - NÃO UTILIZADO)
│       ├── Authorization/       # Módulo de autenticação
│       ├── products/            # Gestão de produtos
│       └── Profile/             # Perfis de usuário
│
└── 📂 public/                   # Assets públicos
```

## 🔧 Tecnologias Utilizadas

### Frontend (Em Uso)
- **React 18.2.0** - Framework JavaScript
- **Ant Design 5.9.4** - Biblioteca de componentes UI
- **React Router 6.16.0** - Roteamento SPA
- **Firebase 10.6.0** - Backend as a Service
- **Tailwind CSS 3.3.3** - Framework CSS
- **React Query 3.39.3** - Gestão de estado assíncrono
- **Google Maps API** - Mapas e localização
- **Moment.js** - Manipulação de datas
- **Axios** - Cliente HTTP (instalado mas não usado)

### Backend Django (Não Utilizado)
- Django 4.2.4
- Django REST Framework
- Knox Authentication
- SQLite
- CORS Headers

## 🔑 Autenticação e Segurança

```mermaid
sequenceDiagram
    participant U as Usuário
    participant L as Login Page
    participant F as Firebase Auth
    participant FS as Firestore
    participant M as MainLayout
    
    U->>L: Acesso ao sistema
    L->>F: signInWithEmailAndPassword()
    F-->>L: userCredential
    L->>FS: Verifica se é admin<br/>(collection: administrador)
    alt É Administrador
        FS-->>L: Dados do admin
        L->>M: Navigate to home
        M->>U: Acesso permitido
    else Não é Administrador
        FS-->>L: Empty result
        L->>F: signOut()
        L->>U: Acesso negado!
    end
```

### Regras de Segurança
- **Apenas administradores** têm acesso ao painel
- Verificação dupla: autenticação Firebase + verificação na coleção `administrador`
- Logout automático se não for administrador

## 📊 Modelo de Dados (Firestore)

```mermaid
erDiagram
    EVENTO {
        string id PK
        string name
        array category
        object organizer
        timestamp data
        string time
        string location
        string description
        string description_en
        string hashtags
        float lat
        float lng
        string locationName
        string coverImage
        int views
        boolean destaque
        boolean deleted
    }
    
    LOCAL {
        string id PK
        string name
        array category
        string location
        string phone
        string description
        string description_en
        string hashtags
        float lat
        float lng
        string coverImage
        int views
        boolean destaque
        boolean deleted
    }
    
    ORGANIZADOR {
        string id PK
        string name
        string phone
        string email
        string address
        string description
        string description_en
    }
    
    CATEGORIA {
        string id PK
        string name
        string name_en
        int members
    }
    
    CATEGORIA_LOCAL {
        string id PK
        string name
        string name_en
    }
    
    ADMINISTRADOR {
        string id PK
        string uid
        string Nome
        string email
    }
    
    EVENTO ||--o{ CATEGORIA : "tem"
    EVENTO ||--|| ORGANIZADOR : "organizado por"
    LOCAL ||--o{ CATEGORIA_LOCAL : "pertence a"
```

## 🎨 Interface do Usuário

### Estrutura de Navegação

```mermaid
graph LR
    A[Login] --> B{Autenticado?}
    B -->|Sim & Admin| C[MainLayout]
    B -->|Não| A
    
    C --> D[Home]
    C --> E[Eventos]
    C --> F[Locais]
    C --> G[Bilhetes]
    C --> H[Finanças]
    C --> I[Configurações]
    
    E --> E1[Gestão Eventos]
    E --> E2[Organizadores]
    E --> E3[Categorias]
    E --> E4[Patrocinadores]
    
    F --> F1[Gestão Locais]
    F --> F2[Categorias]
    F --> F3[Serviços]
```

### Componentes Principais

1. **MainLayout** (`/src/Layouts/MainLayout.js`)
   - Layout principal com navegação lateral
   - Verifica autenticação e permissões
   - Menu com ícones para cada seção

2. **Gestão de Eventos** (`/src/Pages/eventos/Gestao.js`)
   - CRUD completo de eventos
   - Upload de imagens com compressão
   - Integração com Google Maps
   - Eventos recorrentes
   - Sistema de destaques

3. **Gestão de Locais** (`/src/Pages/local/Gestao.js`)
   - CRUD de locais turísticos
   - Categorização múltipla
   - Geolocalização
   - Exportação para Excel

## 🗄️ Coleções Firebase

### 1. Coleção `evento`
Armazena todos os eventos turísticos com informações detalhadas, localização e categorias.

### 2. Coleção `local`
Locais turísticos com descrições bilíngues (PT/EN), coordenadas GPS e categorias.

### 3. Coleção `organizador`
Informações dos organizadores de eventos.

### 4. Coleção `categoria` e `categoriaLocal`
Categorias para eventos e locais respectivamente.

### 5. Coleção `administrador`
Usuários com permissão de administrador do sistema.

## 🚀 Funcionalidades Principais

### Gestão de Eventos
- ✅ Criar, editar e deletar eventos
- ✅ Eventos recorrentes (repetição semanal)
- ✅ Upload e compressão de imagens
- ✅ Localização no mapa
- ✅ Categorias múltiplas
- ✅ Sistema de destaques
- ✅ Descrições bilíngues (PT/EN)
- ✅ Hashtags para SEO
- ✅ Contador de visualizações

### Gestão de Locais
- ✅ CRUD completo de locais turísticos
- ✅ Categorização
- ✅ Informações de contato
- ✅ Geolocalização
- ✅ Exportação de dados

### Sistema de Administração
- ✅ Autenticação segura
- ✅ Verificação de permissões
- ✅ Interface responsiva
- ✅ Filtros e pesquisa
- ✅ Paginação de dados

## 🔄 Fluxo de Dados

```mermaid
graph LR
    A[Usuário Admin] --> B[React Frontend]
    B --> C{Ação}
    
    C -->|Login| D[Firebase Auth]
    C -->|CRUD Dados| E[Firestore]
    C -->|Upload Imagem| F[Firebase Storage]
    
    E --> G[Coleções]
    G --> G1[evento]
    G --> G2[local]
    G --> G3[organizador]
    G --> G4[categoria]
    
    F --> H[Imagens Comprimidas]
    
    D --> I[Token de Sessão]
    I --> B
```

## 📱 Responsividade

O sistema utiliza:
- **Tailwind CSS** para estilos responsivos
- **Ant Design** com componentes adaptáveis
- Grid system com breakpoints para diferentes telas

## 🌍 Internacionalização

- Suporte para **Português** e **Inglês**
- Campos separados para descrições em ambos idiomas
- Interface em Português (PT)

## 🔐 Configuração Firebase

Arquivo: `/src/base.js`

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAf2ss3j8KzxOokqKVtKD1pCrMsIISjJ50",
  authDomain: "onde-it-com.firebaseapp.com",
  projectId: "onde-it-com",
  storageBucket: "onde-it-com.appspot.com",
  messagingSenderId: "58024286019",
  appId: "1:58024286019:web:e21ed462578247fa1941f6",
  measurementId: "G-SMD30RGFWS"
};
```

## 🚨 Problemas Identificados

1. **Backend Django não utilizado**
   - ✅ Código movido para `/trash/api_moz_sales/`
   - Projeto agora mais limpo e focado na stack React + Firebase

2. **Credenciais expostas**
   - Configuração Firebase hardcoded
   - Secret key Django visível

3. **Validação de formulários**
   - Mensagens de erro em inglês em alguns locais
   - Inconsistência na validação

## 💡 Recomendações

1. **Código não utilizado movido**
   - ✅ Pasta `api_moz_sales` movida para `/trash/`
   - Pode ser eliminada permanentemente se não for necessária
   - Limpar dependências não utilizadas do package.json

2. **Segurança**
   - Mover configurações para variáveis de ambiente
   - Implementar regras de segurança no Firestore

3. **Performance**
   - Implementar lazy loading de componentes
   - Otimizar queries do Firestore com índices

4. **Manutenibilidade**
   - Adicionar testes unitários
   - Documentar APIs e componentes
   - Padronizar convenções de código

## 📈 Estatísticas do Projeto

- **Total de Páginas:** ~15 componentes principais
- **Coleções Firestore:** 6 coleções ativas
- **Dependências NPM:** 31 pacotes
- **Linhas de Código React:** ~5000+ linhas
- **Linhas de Código Django:** ~500 linhas (não utilizado)

## 🎯 Conclusão

O projeto ONDE é um sistema de gestão de conteúdo turístico funcional, construído com tecnologias modernas. Após investigação detalhada, confirmamos que o **backend Django não está sendo utilizado** e foi movido para `/trash/api_moz_sales/`. O sistema funciona inteiramente com React + Firebase, está mais limpo agora e pode beneficiar de melhorias em segurança, performance e manutenibilidade.

---

*Documentação gerada em: Novembro 2024*
*Versão do Sistema: 0.1.0*
