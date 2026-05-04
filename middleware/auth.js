const jwt = require('jsonwebtoken');
const SECRET = 'schoolconnect_secret_2025';

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;
  const isApiRequest = req.path.startsWith('/api/');

  if (!token) {
    if (isApiRequest) return res.status(401).json({ error: 'Token não fornecido' });
    return res.redirect('/login');
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (error) {
    res.clearCookie('token');
    if (isApiRequest) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
      }
      return res.status(403).json({ error: 'Token inválido' });
    }
    return res.redirect('/login');
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acesso negado. Roles permitidos: ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = { authMiddleware, requireRole, SECRET };
