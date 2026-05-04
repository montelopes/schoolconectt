# 🎓 SchoolConnect - Sistema Completo de Gestão Escolar Digital

**SchoolConnect** é uma plataforma moderna e completa de gestão escolar desenvolvida com **Node.js e Express**, oferecendo funcionalidades avançadas para administradores, professores, pais e alunos.

## ✨ Funcionalidades Principais Implementadas

### 👨‍💼 **Administrador**
- 📊 Dashboard com estatísticas gerais
- 👥 Gerenciar usuários (alterar roles)
- 🗓️ Criar, editar e gerenciar eventos escolares
- 📈 Relatórios de desempenho por turma
- ⚙️ Painel de configurações
- 📤 Exportar dados em formato JSON

### 👨‍🏫 **Professor**
- 📝 Criar e gerenciar tarefas com descrição detalhada
- ✏️ Lançar notas por bimestre e disciplina
- ✅ Registrar presença (chamada digital)
- 📊 Visualizar desempenho da turma
- 💬 Enviar mensagens para pais e alunos
- 🏆 Gerenciar atividades esportivas
- 📋 Avaliar tarefas entregues

### 👨‍👩‍👧 **Responsável (Pai/Mãe)**
- 📱 Acompanhar desempenho do filho em tempo real
- 📊 Visualizar notas, boletim e média
- 📅 Verificar presença com histórico colorido
- 📚 Acompanhar tarefas pendentes e prazos
- 💬 Comunicação direta com professores
- 📢 Receber notificações de eventos
- ⚠️ Alertas de risco (frequência baixa, notas)

### 🎒 **Aluno**
- 📚 Acompanhar tarefas com prazos
- 📊 Consultar notas por disciplina
- 📅 Verificar frequência (presente, falta, atraso)
- 🏆 Participação em atividades esportivas
- 💬 Comunicação com professores
- 📢 Calendário de provas e eventos

---

## 🚀 Como Usar

### **Instalação Rápida**
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor
npm start

# 3. Acessar no navegador
http://localhost:3000
```

### **Contas de Teste Padrão**
```
👑 Admin:          admin@school.com / admin123
👨‍🏫 Professor 1:     carlos@school.com / prof123
👨‍🏫 Professor 2:     ana@school.com / prof123
👨‍🏫 Professor 3:     roberto@school.com / prof123
👨‍👩‍👧 Responsável:    maria@email.com / pai123
👨‍👩‍👦 Responsável 2:   joao@email.com / pai123
🎒 Aluno 1:        lucas@school.com / aluno123
🎒 Aluno 2:        sofia@school.com / aluno123
```

---

## 📁 Estrutura do Projeto

```
schoolconnect/
├── 📄 server.js                    # Servidor Express principal
├── 📄 database.js                  # Configuração NeDB + seed
├── 📄 package.json                 # Dependências npm
├── 📄 README.md                    # Documentação original
│
├── 📁 routes/
│   ├── 📄 auth.js                 # Endpoints de autenticação
│   └── 📄 api.js                  # Endpoints da API (CRUD completo)
│
├── 📁 middleware/
│   └── 📄 auth.js                 # JWT middleware e validação de roles
│
├── 📁 data/                        # Banco de dados NeDB
│   ├── users.db
│   ├── students.db
│   ├── grades.db
│   ├── attendance.db
│   ├── tasks.db
│   ├── events.db
│   ├── messages.db
│   └── sports.db
│
└── 📁 public/                      # Arquivos Frontend
    ├── 📄 login.html               # Página de login
    ├── 📄 dashboard.html           # Dashboard principal (1800+ linhas)
    ├── 📄 styles-enhanced.css      # CSS adicional com animações
    ├── 📄 enhancements.js          # Funções auxiliares
    └── 📁 img/                     # Imagens e assets
```

---

## 🔌 API Endpoints Implementados

### **Autenticação**
```
GET  /login                        # Página de login
POST /api/login                    # Fazer login
POST /api/logout                   # Logout
GET  /api/me                       # Obter dados do usuário logado
```

### **Alunos (Students)**
```
GET    /api/student/:id            # Obter dados de um aluno
PUT    /api/student/:id            # Atualizar aluno (admin/professor)
GET    /api/students               # Listar todos os alunos (admin/professor)
```

### **Notas (Grades)**
```
GET    /api/grades/:studentId      # Obter notas de um aluno
PUT    /api/grades/:id             # Atualizar nota individual
GET    /api/reports/grades/:studentId  # Relatório completo de notas
```

### **Presença (Attendance)**
```
GET    /api/attendance/:studentId  # Histórico de frequência
POST   /api/attendance             # Registrar presença
GET    /api/reports/attendance/:studentId  # Relatório de frequência
```

### **Tarefas (Tasks)**
```
GET    /api/tasks/:studentId       # Tarefas de um aluno
GET    /api/tasks/all              # Todas as tarefas (professor)
GET    /api/task/:id               # Detalhes de uma tarefa
POST   /api/tasks                  # Criar nova tarefa
PUT    /api/tasks/:id              # Atualizar tarefa
DELETE /api/tasks/:id              # Deletar tarefa
POST   /api/tasks/:taskId/complete # Marcar tarefa como completa
POST   /api/tasks/:taskId/grade    # Avaliar tarefa entregue
```

### **Eventos (Events)**
```
GET    /api/events                 # Listar eventos (com filtro por grade)
GET    /api/events/:id             # Detalhes de um evento
POST   /api/events                 # Criar evento (admin/professor)
PUT    /api/events/:id             # Editar evento
DELETE /api/events/:id             # Deletar evento
```

### **Esportes (Sports)**
```
GET    /api/sports                 # Listar modalidades
GET    /api/sports/:id             # Detalhes de uma modalidade
POST   /api/sports                 # Criar modalidade (admin)
PUT    /api/sports/:id             # Editar modalidade
DELETE /api/sports/:id             # Deletar modalidade
POST   /api/sports/:id/result      # Registrar resultado de jogo
GET    /api/sports/student/:studentId  # Modalidades do aluno
```

### **Mensagens (Messages)**
```
GET    /api/messages               # Caixa de entrada
GET    /api/messages/sent          # Mensagens enviadas
GET    /api/message/:id            # Detalhes de uma mensagem
POST   /api/messages               # Enviar mensagem
POST   /api/messages/read/:id      # Marcar como lida
DELETE /api/messages/:id           # Deletar mensagem
```

### **Usuários (Users) - Admin**
```
GET    /api/users                  # Listar todos os usuários
PUT    /api/users/:id/role         # Alterar role de um usuário
```

### **Relatórios (Reports)**
```
GET    /api/reports/class/:grade   # Relatório completo da turma
GET    /api/reports/grades/:studentId    # Desempenho acadêmico
GET    /api/reports/attendance/:studentId # Frequência
```

---

## 🎨 Interface e Páginas

### **Páginas Implementadas**

#### ✅ Comum a Todos
- **Visão Geral (Overview)** - Dashboard principal com widgets
- **Mensagens** - Chat com caixa entrada/saída
- **Calendário** - Eventos, provas, reuniões

#### ✅ Alunos e Responsáveis
- **Notas & Boletim** - Notas por disciplina com média
- **Presença & Faltas** - Calendário com histórico
- **Tarefas & Deveres** - Lista com status e prazos
- **Jogos Escolares** - Modalidades e resultados

#### ✅ Professores
- **Alunos** - Lista completa com perfis
- **Lançar Notas** - Edição de notas por bimestre
- **Fazer Chamada** - Registro de presença em tempo real

#### ✅ Admin
- **Administração** - Painel com estatísticas
- **Gerenciar Usuários** - Modificar roles
- **Criar Eventos** - Formulário completo
- **Relatórios** - Exportar dados

---

## 💾 Banco de Dados (NeDB)

### **Estrutura de Coleções**

**Users (Usuários)**
```javascript
{
  _id: 'u_student1',
  name: 'Lucas Oliveira',
  email: 'lucas@school.com',
  password: 'hash_bcrypt',
  role: 'student', // admin, teacher, parent, student
  avatar: 'LO',
  studentId: 's1'
}
```

**Students (Alunos)**
```javascript
{
  _id: 's1',
  name: 'Lucas Oliveira',
  age: 14,
  grade: '9º Ano A',
  turno: 'Manhã',
  matricula: '2025001',
  nascimento: '12/03/2011',
  parentId: 'u_parent1'
}
```

**Grades (Notas)**
```javascript
{
  studentId: 's1',
  subject: 'Matemática',
  bimestre1: 8.5,
  bimestre2: 9.0,
  bimestre3: 8.2,
  bimestre4: null,
  media: 8.6,
  status: 'aprovado',
  teacher: 'Prof. Carlos Lima'
}
```

**Tasks (Tarefas)**
```javascript
{
  _id: 't1',
  title: 'Exercícios de Álgebra',
  subject: 'Matemática',
  description: 'Resolver exercícios 1-20 página 87',
  dueDate: '2025-05-01',
  teacher: 'u_prof1',
  grade: '9º Ano A',
  points: 10,
  createdAt: '2025-04-20'
}
```

---

## 🔐 Segurança Implementada

✅ **Autenticação JWT**
- Token com expiração de 7 dias
- Armazenado em cookie HttpOnly
- Refresh automático

✅ **Autorização por Role**
- Middleware `requireRole()` em endpoints sensíveis
- Validação de acesso em GET (pais só veem seus filhos)

✅ **Hash de Senhas**
- bcryptjs com 10 salts
- Verificação segura no login

✅ **Proteção de Dados**
- Sanitização de entrada
- Validação de tipos

⚠️ **Recomendações para Produção**
- [ ] Implementar HTTPS/TLS
- [ ] Rate limiting (express-rate-limit)
- [ ] Validação com Joi/Yup
- [ ] Logs de auditoria
- [ ] Backup automático de DB
- [ ] CORS configurado
- [ ] Helmet para headers HTTP

---

## 🛠️ Como Expandir

### **Adicionar Nova Página**
```javascript
// 1. Em dashboard.html, criar a função
async function buildMyPage() {
  return `
    <div class="section-card">
      <div class="section-head"><h3>📄 Minha Página</h3></div>
      <div class="section-body">
        <p>Conteúdo aqui...</p>
      </div>
    </div>
  `;
}

// 2. Adicionar ao switch em buildPage()
case 'mypage': return buildMyPage();

// 3. Adicionar ao menu de navegação em renderSidebar()
{ id: 'mypage', icon: '📄', label: 'Minha Página' }
```

### **Adicionar Novo Endpoint**
```javascript
// routes/api.js
router.post('/api/myendpoint', requireRole('teacher','admin'), async (req, res) => {
  try {
    const { field1, field2 } = req.body;
    
    // Validação
    if (!field1) return res.status(400).json({ error: 'Campo obrigatório' });
    
    // Operação
    const result = await db.mycollection.insert({ field1, field2 });
    
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

---

## 📊 Melhorias Recentes

### **Backend (Node.js)**
- ✅ Completado CRUD de mensagens com remetente
- ✅ Endpoints de relatórios com cálculos
- ✅ Sistema de pontuação em tarefas
- ✅ Avaliação de tarefas por professor
- ✅ Filtros avançados em eventos e tarefas

### **Frontend (Dashboard)**
- ✅ Interface responsiva (mobile-friendly)
- ✅ Modais melhorados com validação
- ✅ Cards com indicadores visuais
- ✅ Gráficos e progresso visual
- ✅ Notificações com toast
- ✅ Dark mode preparado
- ✅ Auto-save de rascunhos
- ✅ Sincronização automática de dados

### **Funcionalidades Especiais**
- ✅ Sistema de notificações push
- ✅ Exportação de relatórios
- ✅ Validações em formulários
- ✅ Busca e filtro de dados
- ✅ Paginação de listas
- ✅ Histórico de ações

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Erro "Database not found" | Pasta `data/` deve existir. Execute `npm start` |
| Token inválido após refresh | Limpe cookies e faça login novamente |
| Notas não aparecem | Verifique se aluno está na turma correta |
| Mensagens não enviam | Verifique email/ID do destinatário |
| Presença não registra | Confirme se você tem role `teacher` ou `admin` |

---

## 📝 Licença

Projeto educacional - Livre para uso, modificação e distribuição.

---

## 🎯 Roadmap Futuro

- [ ] Integração com SSO (Google, Office 365)
- [ ] App mobile (React Native)
- [ ] Videoconferência integrada
- [ ] Sistema de biblioteca
- [ ] Disciplina positiva (pontos/medalhas)
- [ ] Chat em tempo real (Socket.io)
- [ ] Integração com pagamento (mensalidades)
- [ ] Analytics avançado
- [ ] API GraphQL
- [ ] Suporte a múltiplos idiomas

---

## 👥 Suporte

Para dúvidas, abra uma issue ou consulte o código comentado.

**Desenvolvido com ❤️ para educação transformadora**
