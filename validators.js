// ────────────────────────────────────────────────────────────────
// SCHOOLCONNECT - VALIDAÇÕES E UTILITÁRIOS
// ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 4;
const TITLE_MIN_LENGTH = 3;
const TITLE_MAX_LENGTH = 100;

// ── VALIDAÇÕES DE ENTRADA ───────────────────────────────────────
function validateEmail(email) {
  if (!email) return { valid: false, message: 'Email é obrigatório' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: 'Email inválido' };
  return { valid: true };
}

function validatePassword(password) {
  if (!password) return { valid: false, message: 'Senha é obrigatória' };
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, message: `Senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres` };
  }
  return { valid: true };
}

function validateTitle(title) {
  if (!title) return { valid: false, message: 'Título é obrigatório' };
  if (title.length < TITLE_MIN_LENGTH) {
    return { valid: false, message: `Título deve ter no mínimo ${TITLE_MIN_LENGTH} caracteres` };
  }
  if (title.length > TITLE_MAX_LENGTH) {
    return { valid: false, message: `Título não pode exceder ${TITLE_MAX_LENGTH} caracteres` };
  }
  return { valid: true };
}

function validateDate(date) {
  if (!date) return { valid: false, message: 'Data é obrigatória' };
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: 'Data inválida' };
  }
  
  return { valid: true };
}

function validateGrade(grade) {
  if (grade === null || grade === undefined || grade === '') {
    return { valid: false, message: 'Nota é obrigatória' };
  }
  
  const gradeNum = parseFloat(grade);
  if (isNaN(gradeNum)) {
    return { valid: false, message: 'Nota deve ser um número' };
  }
  
  if (gradeNum < 0 || gradeNum > 10) {
    return { valid: false, message: 'Nota deve estar entre 0 e 10' };
  }
  
  return { valid: true };
}

function validateAttendanceStatus(status) {
  const validStatuses = ['presente', 'falta', 'atrasado'];
  if (!validStatuses.includes(status)) {
    return { valid: false, message: `Status deve ser um de: ${validStatuses.join(', ')}` };
  }
  return { valid: true };
}

function validateEventType(type) {
  const validTypes = ['prova', 'reunião', 'evento', 'esporte', 'feriado'];
  if (!validTypes.includes(type)) {
    return { valid: false, message: `Tipo deve ser um de: ${validTypes.join(', ')}` };
  }
  return { valid: true };
}

function validateRole(role) {
  const validRoles = ['admin', 'teacher', 'parent', 'student'];
  if (!validRoles.includes(role)) {
    return { valid: false, message: `Role deve ser um de: ${validRoles.join(', ')}` };
  }
  return { valid: true };
}

// ── SANITIZAÇÃO ─────────────────────────────────────────────────
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remover < >
    .substring(0, 1000); // Limitar tamanho
}

function sanitizeEmail(email) {
  return sanitizeString(email).toLowerCase();
}

// ── VALIDAÇÃO DE ACESSO ─────────────────────────────────────────
function canAccessStudent(user, studentId) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') return true; // Professor pode acessar todos
  if (user.role === 'parent') return user.studentIds?.includes(studentId);
  if (user.role === 'student') return user.studentId === studentId;
  return false;
}

function canManageStudent(user) {
  return ['admin', 'teacher'].includes(user.role);
}

function canSendMessage(user) {
  return ['admin', 'teacher', 'parent', 'student'].includes(user.role);
}

// ── FORMATAÇÃO ──────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatDateLong(date) {
  if (!date) return '—';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function formatTime(time) {
  if (!time) return '—';
  return time;
}

// ── CÁLCULOS ────────────────────────────────────────────────────
function calculateAverage(grades) {
  if (!grades || grades.length === 0) return 0;
  const sum = grades.reduce((a, b) => a + (b || 0), 0);
  return +(sum / grades.length).toFixed(2);
}

function calculateAttendanceRate(records) {
  if (!records || records.length === 0) return 100;
  const present = records.filter(r => r.status !== 'falta').length;
  return +((present / records.length) * 100).toFixed(2);
}

function getGradeStatus(average) {
  if (average >= 7) return 'aprovado';
  if (average >= 5) return 'recuperacao';
  return 'reprovado';
}

// ── GERAÇÃO DE IDS ──────────────────────────────────────────────
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Exportar para uso em outros arquivos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateEmail,
    validatePassword,
    validateTitle,
    validateDate,
    validateGrade,
    validateAttendanceStatus,
    validateEventType,
    validateRole,
    sanitizeString,
    sanitizeEmail,
    canAccessStudent,
    canManageStudent,
    canSendMessage,
    formatDate,
    formatDateLong,
    formatTime,
    calculateAverage,
    calculateAttendanceRate,
    getGradeStatus,
    generateId
  };
}
