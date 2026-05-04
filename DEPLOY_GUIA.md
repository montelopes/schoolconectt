# 📱 SchoolConnect - Guia de Deploy

## 🚀 Opção 1: Deploy na **Render.com** (RECOMENDADO)

### Passo 1: Preparar o GitHub
1. Se não tiver Git instalado, [baixe aqui](https://git-scm.com)
2. Abra o terminal na pasta do projeto:
   ```bash
   cd C:\Users\Cliente\Downloads\SchoolConnect_corrigido\schoolconnect_fixed
   ```
3. Inicialize o repositório Git:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - SchoolConnect"
   ```
4. Crie um repositório no [GitHub.com](https://github.com)
5. Conecte e envie o código:
   ```bash
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/schoolconnect.git
   git push -u origin main
   ```

### Passo 2: Deploy no Render
1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Selecione seu repositório `schoolconnect`
4. Preencha:
   - **Name**: `schoolconnect`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (grátis)
5. Clique em **"Create Web Service"**
6. Aguarde ~5 minutos para fazer o build
7. Seu URL será algo como: `https://schoolconnect.onrender.com`

---

## 🚀 Opção 2: Deploy na **Railway.app** (Também Fácil)

1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Conecte sua conta GitHub e selecione `schoolconnect`
5. Configure as variáveis de ambiente se necessário
6. Deploy automático!

---

## 🚀 Opção 3: Netlify (Apenas Frontend - Não Recomendado)

Se quiser usar Netlify apenas para o **frontend estático**, seria necessário:
- Separar o código frontend em uma pasta diferente
- Fazer builds da UI de forma independente

**Não recomendamos esta opção** porque você perderia toda a funcionalidade do backend.

---

## 📝 Variáveis de Ambiente (se necessário)

Se precisar adicionar variáveis de ambiente (como chaves de API), crie um arquivo `.env`:

```
PORT=3000
NODE_ENV=production
```

Depois, adicione as mesmas variáveis no painel do Render/Railway.

---

## 🧪 Testar Localmente Antes de Deploy

```bash
npm install
npm start
```

Acesse: `http://localhost:3000`

Use as contas de teste:
- **Admin**: admin@school.com / admin123
- **Professor**: carlos@school.com / prof123
- **Pai**: maria@email.com / pai123
- **Aluno**: lucas@school.com / aluno123

---

## ❓ Dúvidas?

- **Render tem limite de tempo?** Sim, 750 horas/mês (gratuito), suficiente para uso pessoal
- **Dados persistem?** Os dados estão em NeDB (arquivo local), perdidos ao reiniciar. Considere migrar para MongoDB
- **Como atualizar?** Faça `git push` no GitHub, o Render faz deploy automático

---

## 🔄 Para Migrar Banco de Dados para MongoDB (Futuro)

Se quiser dados persistentes, altere `database.js` para usar MongoDB em vez de NeDB.

