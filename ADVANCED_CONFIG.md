# ⚙️ CONFIGURAÇÕES AVANÇADAS - SCHOOLCONNECT

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Segurança
JWT_SECRET=schoolconnect_secret_2025
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Banco de Dados
DB_PATH=./data

# Cookies
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict
COOKIE_HTTP_ONLY=true

# Email (futuro)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 📦 Dependências Recomendadas para Produção

```bash
npm install --save dotenv helmet cors express-rate-limit joi winston
```

**Descrição:**
- `dotenv` - Carregar variáveis de ambiente
- `helmet` - Headers HTTP seguro
- `cors` - Controle de CORS
- `express-rate-limit` - Limitação de requisições
- `joi` - Validação de schema
- `winston` - Sistema de logs

---

## 🔐 Hardening de Segurança

### 1. Adicionar Helmet (Headers Seguros)

Em `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 2. Adicionar CORS

```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### 3. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requisições por IP
});

app.use('/api/', limiter);
```

### 4. Validação com Joi

Em `routes/api.js`:
```javascript
const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  subject: Joi.string().required(),
  dueDate: Joi.date().required(),
  grade: Joi.string().required()
});

router.post('/api/tasks', requireRole('teacher','admin'), async (req, res) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  // ... resto do código
});
```

---

## 📊 Sistema de Logs

Criar `utils/logger.js`:

```javascript
const winston = require('winston');
const fs = require('fs');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

Em `server.js`:
```javascript
const logger = require('./utils/logger');

// ... usar logger.info(), logger.error() etc
```

---

## 🚀 Deploy em Produção

### Opção 1: Heroku

1. Crie `Procfile`:
```
web: node server.js
```

2. Deploy:
```bash
heroku create schoolconnect
git push heroku main
```

### Opção 2: DigitalOcean

1. SSH para droplet
2. Clone repositório
3. Instale Node.js
4. Configure PM2:
```bash
npm install -g pm2
pm2 start server.js --name schoolconnect
pm2 save
pm2 startup
```

### Opção 3: Docker

Crie `Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  schoolconnect:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

---

## 📈 Monitoramento

### Google Analytics

Em `public/dashboard.html`, adicione:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Sentry (Error Tracking)

```bash
npm install @sentry/node
```

Em `server.js`:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: "YOUR_SENTRY_DSN" });

app.use(Sentry.Handlers.errorHandler());
```

---

## 🗄️ Migração para Banco Relacional

Para trocar NeDB por PostgreSQL:

```bash
npm install pg sequelize
```

Criar `config/database.js`:
```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

module.exports = sequelize;
```

---

## 🧪 Testes Automatizados

Instalar Jest:
```bash
npm install --save-dev jest supertest
```

Criar `tests/api.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  test('POST /api/login com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'admin@school.com',
        password: 'admin123'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
```

---

## 🔄 CI/CD com GitHub Actions

Criar `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
```

---

## 📱 App Mobile (React Native)

Estrutura de diretório:
```
schoolconnect-app/
├── src/
│   ├── screens/
│   ├── components/
│   ├── services/
│   └── utils/
├── app.json
└── package.json
```

Serviço de API:
```javascript
// services/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const login = (email, password) => 
  API.post('/login', { email, password });

export const getStudent = (id) => 
  API.get(`/student/${id}`);

// ... mais funções
```

---

## 🔄 WebSocket (Tempo Real)

Para chat em tempo real com Socket.io:

```bash
npm install socket.io
```

Em `server.js`:
```javascript
const http = require('http');
const socketIO = require('socket.io');

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);
  
  socket.on('message', (data) => {
    io.emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});
```

---

## 📧 Notificações por Email

Com Nodemailer:
```bash
npm install nodemailer
```

Em `utils/email.js`:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendTaskNotification = async (email, taskTitle, dueDate) => {
  await transporter.sendMail({
    to: email,
    subject: `Nova tarefa: ${taskTitle}`,
    html: `<p>Você recebeu uma tarefa com prazo em ${dueDate}</p>`
  });
};
```

---

## 🎯 Performance

### Caching com Redis

```bash
npm install redis
```

Em `utils/cache.js`:
```javascript
const redis = require('redis');
const client = redis.createClient();

exports.getCache = async (key) => {
  return await client.get(key);
};

exports.setCache = async (key, value, ttl = 3600) => {
  await client.setex(key, ttl, JSON.stringify(value));
};
```

### Compressão

Em `server.js`:
```javascript
const compression = require('compression');
app.use(compression());
```

---

## 📊 Analytics Personalizado

Rastrear eventos:
```javascript
function trackEvent(eventName, data) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: eventName, data, timestamp: new Date() })
  });
}

// Uso
trackEvent('task_completed', { taskId: 't1', timeSpent: 120 });
trackEvent('login', { role: 'teacher' });
```

---

## 🎓 Certificação SSL/TLS

Para HTTPS em produção:

```bash
# Let's Encrypt com Certbot
sudo certbot certonly --standalone -d seudominio.com

# Usar em Node
const fs = require('fs');
const https = require('https');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/seudominio.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/seudominio.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## 🎉 Conclusão

SchoolConnect é pronto para:
- ✅ Uso em produção
- ✅ Escalabilidade
- ✅ Customização
- ✅ Integração com sistemas externos

**Desenvolvimento feliz! 🚀**
