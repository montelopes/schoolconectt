const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { seedDatabase } = require('./database');
const { authMiddleware } = require('./middleware/auth');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/api'));

// Dashboard (protegido)
app.get('/dashboard', authMiddleware, (req, res) => res.sendFile('dashboard.html', { root: './public' }));

const PORT = process.env.PORT || 3000;
seedDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🎓 SchoolConnect rodando em http://localhost:${PORT}\n`);
    console.log('Contas de teste:');
    console.log('  Admin:      admin@school.com / admin123');
    console.log('  Professor:  carlos@school.com / prof123');
    console.log('  Pai/Mãe:    maria@email.com / pai123');
    console.log('  Aluno:      lucas@school.com / aluno123\n');
  });
});
