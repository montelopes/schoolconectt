const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { SECRET } = require('../middleware/auth');

// Validação de email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

router.get('/', (req, res) => {
  if (req.cookies?.token) {
    try {
      jwt.verify(req.cookies.token, SECRET);
      return res.redirect('/dashboard');
    } catch {}
  }
  res.sendFile('login.html', { root: './public' });
});

router.get('/login', (req, res) => {
  if (req.cookies?.token) {
    try {
      jwt.verify(req.cookies.token, SECRET);
      return res.redirect('/dashboard');
    } catch {}
  }
  res.sendFile('login.html', { root: './public' });
});

router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const user = await db.users.findOne({ email });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Criar token
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        studentId: user.studentId,
        studentIds: user.studentIds
      },
      SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({ ok: true, role: user.role, name: user.name });
  } catch (e) {
    res.status(500).json({ error: 'Erro no servidor: ' + e.message });
  }
});

router.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
