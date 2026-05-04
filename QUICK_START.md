# 🚀 SCHOOLCONNECT - GUIA DE USO RÁPIDO

## ⚡ Iniciar Rapidamente

```bash
# Caminhar para o diretório
cd schoolconnect

# Instalar dependências (primeira vez)
npm install

# Iniciar servidor
npm start

# Acessar
http://localhost:3000
```

✅ O servidor está pronto quando você vir:
```
🎓 SchoolConnect rodando em http://localhost:3000

Contas de teste:
  Admin:      admin@school.com / admin123
  Professor:  carlos@school.com / prof123
  Pai/Mãe:    maria@email.com / pai123
  Aluno:      lucas@school.com / aluno123
```

---

## 👥 Testando Cada Perfil

### 👑 **Admin**
Login: `admin@school.com` / `admin123`

- ⚙️ Ir para: Administração
- 🎯 Tentar: Adicionar evento, visualizar estatísticas
- 📊 Checar: Dashboard mostra todos os usuários

### 👨‍🏫 **Professor**
Login: `carlos@school.com` / `prof123`

- ✏️ Ir para: Lançar Notas
- 🎯 Tentar: Editar nota de Lucas na Matemática
- ✅ Ir para: Fazer Chamada
- 📝 Tentar: Registrar presença dos alunos

### 👨‍👩‍👧 **Responsável**
Login: `maria@email.com` / `pai123`

- 👁️ Ver: Desempenho de Lucas (filho)
- 📊 Checar: Notas, presença, tarefas
- ⚠️ Notar: Alertas de frequência baixa

### 🎒 **Aluno**
Login: `lucas@school.com` / `aluno123`

- 📚 Ver: Tarefas pendentes
- 📊 Consultar: Suas notas
- 📅 Verificar: Calendário de provas

---

## 📋 O Que Tem Implementado

### ✅ Backend (API)
- [x] Autenticação JWT
- [x] CRUD de alunos, notas, presença
- [x] Mensagens completas
- [x] Tarefas com avaliação
- [x] Eventos e calendário
- [x] Esportes e resultados
- [x] Relatórios e estatísticas
- [x] Sistema de roles e permissões

### ✅ Frontend (Dashboard)
- [x] Login responsivo
- [x] Dashboard visual
- [x] 11+ páginas funcionais
- [x] Modais e formulários
- [x] Gráficos e cards
- [x] Notificações (toast)
- [x] Auto-save de rascunhos
- [x] Animações suaves

### ✅ Segurança
- [x] Senha com bcrypt
- [x] JWT com expiração
- [x] Verificação de roles
- [x] Validação de entrada
- [x] Proteção de acesso

---

## 🔌 Endpoints Principais

### Autenticação
```
POST /api/login              # Fazer login
POST /api/logout             # Sair
GET  /api/me                 # Dados do usuário
```

### Alunos
```
GET  /api/student/:id        # Dados de um aluno
GET  /api/students           # Todos os alunos (teacher/admin)
```

### Notas
```
GET  /api/grades/:studentId  # Notas de um aluno
PUT  /api/grades/:id         # Atualizar nota
```

### Presença
```
GET  /api/attendance/:studentId    # Histórico
POST /api/attendance               # Registrar presença
```

### Tarefas
```
GET  /api/tasks/:studentId   # Tarefas de um aluno
POST /api/tasks              # Criar tarefa
POST /api/tasks/:id/complete # Marcar como feito
```

### Mensagens
```
GET  /api/messages           # Caixa de entrada
POST /api/messages           # Enviar mensagem
```

### Relatórios
```
GET /api/reports/class/:grade          # Turma
GET /api/reports/grades/:studentId     # Desempenho
GET /api/reports/attendance/:studentId # Frequência
```

---

## 💾 Arquivo de Dados

O banco NeDB está em `data/`:
- `users.db` - Usuários (admin, professor, pai, aluno)
- `students.db` - Informações dos alunos
- `grades.db` - Notas por disciplina
- `attendance.db` - Histórico de presença
- `tasks.db` - Tarefas e entregas
- `events.db` - Eventos escolares
- `messages.db` - Mensagens entre usuários
- `sports.db` - Modalidades esportivas

**Para resetar tudo:** Delete a pasta `data/` e reinicie o servidor.

---

## 🎨 Personalização

### Mudar Cores
Edite em `public/dashboard.html` as variáveis CSS:
```css
:root {
  --navy: #08152E;      /* Cor principal */
  --blue: #1A56DB;      /* Azul */
  --teal: #0891B2;      /* Verde-azulado */
  --green: #059669;     /* Verde */
  --red: #DC2626;       /* Vermelho */
}
```

### Adicionar Novo Usuário
1. Edit `database.js` - Encontre a seção `USERS`
2. Adicione um novo objeto:
```javascript
{ _id: 'u_novo', name: 'João Silva', email: 'joao@school.com', password: hash('senha123'), role: 'teacher', avatar: 'JS' }
```
3. Reinicie o servidor

### Adicionar Nova Página
1. Em `dashboard.html`, crie a função:
```javascript
async function buildMyPage() {
  return `<div class="section-card">...</div>`;
}
```
2. Adicione ao menu:
```javascript
{ id: 'mypage', icon: '📄', label: 'Minha Página' }
```

---

## 🐛 Se Algo Não Funcionar

| Problema | Solução |
|----------|---------|
| Página branca | Abra DevTools (F12), veja console |
| Erro "localhost refused" | Certifique-se que rodou `npm start` |
| Notas não aparecem | Verifique se aluno está na turma |
| Login falha | Verifique email/senha nas contas teste |
| Banco corrupto | Delete `data/` e reinicie |

---

## 📚 Próximos Passos

### Fácil (Recomendado para começar)
1. [ ] Fazer login com cada perfil
2. [ ] Criar um evento
3. [ ] Registrar presença
4. [ ] Enviar mensagem

### Médio
1. [ ] Criar tarefa como professor
2. [ ] Editar notas
3. [ ] Visualizar relatório da turma
4. [ ] Exportar dados

### Avançado
1. [ ] Adicionar novo usuário no código
2. [ ] Criar novo endpoint
3. [ ] Customizar cores e layouts
4. [ ] Integrar com banco externo

---

## 📞 Contato & Suporte

Código bem comentado para facilitar o entendimento.
Todos os endpoints estão em `routes/api.js`.
Todas as páginas em `public/dashboard.html`.

**Bom uso! 🎓**
