const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { authMiddleware, requireRole } = require('../middleware/auth');

// ─── STUDENT DATA ─────────────────────────────────────────────────
router.get('/api/student/:id', authMiddleware, async (req, res) => {
  try {
    const student = await db.students.findOne({ _id: req.params.id });
    if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });
    // Permission check
    const u = req.user;
    if (u.role === 'parent' && !u.studentIds?.includes(req.params.id)) return res.status(403).json({ error: 'Acesso negado' });
    if (u.role === 'student' && u.studentId !== req.params.id) return res.status(403).json({ error: 'Acesso negado' });
    res.json(student);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── UPDATE STUDENT ────────────────────────────────────────────────
router.put('/api/student/:id', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { grade, turno, matricula, nascimento, photo } = req.body;
    const update = {};
    if (grade) update.grade = grade;
    if (turno) update.turno = turno;
    if (matricula) update.matricula = matricula;
    if (nascimento) update.nascimento = nascimento;
    if (photo) update.photo = photo;
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    await db.students.update({ _id: req.params.id }, { $set: update });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── GRADES ───────────────────────────────────────────────────────
router.get('/api/grades/:studentId', authMiddleware, async (req, res) => {
  try {
    const grades = await db.grades.find({ studentId: req.params.studentId });
    // Calculate media
    const result = grades.map(g => {
      const scores = [g.bimestre1, g.bimestre2, g.bimestre3, g.bimestre4].filter(v => v !== null);
      const media = scores.length ? +(scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1) : null;
      return { ...g, media, status: media >= 6 ? 'aprovado' : media < 5 ? 'reprovado' : 'recuperação' };
    });
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/api/grades/:id', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    await db.grades.update({ _id: req.params.id }, { $set: req.body });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ATTENDANCE ───────────────────────────────────────────────────
router.get('/api/attendance/:studentId', authMiddleware, async (req, res) => {
  try {
    const records = await db.attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    const total = records.length;
    const presentes = records.filter(r => r.status === 'presente').length;
    const faltas = records.filter(r => r.status === 'falta').length;
    const atrasos = records.filter(r => r.status === 'atrasado').length;
    const percentual = total ? +((presentes + atrasos) / total * 100).toFixed(1) : 100;
    res.json({ records, stats: { total, presentes, faltas, atrasos, percentual } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/attendance', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { studentId, date, status, horarioEntrada, horarioSaida } = req.body;
    const existing = await db.attendance.findOne({ studentId, date });
    if (existing) {
      await db.attendance.update({ _id: existing._id }, { $set: { status, horarioEntrada, horarioSaida } });
    } else {
      await db.attendance.insert({ studentId, date, status, horarioEntrada, horarioSaida });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── TASKS ────────────────────────────────────────────────────────
router.get('/api/tasks/:studentId', authMiddleware, async (req, res) => {
  try {
    const student = await db.students.findOne({ _id: req.params.studentId });
    if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });
    const tasks = await db.tasks.find({ grade: student.grade, _type: { $exists: false } });
    const completions = await db.tasks.find({ studentId: req.params.studentId, _type: 'completion' });
    const compMap = {};
    completions.forEach(c => compMap[c.taskId] = c);
    const today = new Date().toISOString().split('T')[0];
    const result = tasks.map(t => ({
      ...t,
      completion: compMap[t._id] || null,
      overdue: !compMap[t._id]?.done && t.dueDate < today,
      daysLeft: Math.ceil((new Date(t.dueDate) - new Date()) / 86400000),
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/tasks/all', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    const tasks = await db.tasks.find({ _type: { $exists: false } });
    res.json(tasks);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/task/:id', authMiddleware, async (req, res) => {
  try {
    const task = await db.tasks.findOne({ _id: req.params.id, _type: { $exists: false } });
    if (!task) return res.status(404).json({ error: 'Tarefa não encontrada' });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tasks', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { title, subject, description, dueDate, teacher, grade, points } = req.body;
    if (!title || !subject || !dueDate || !grade) return res.status(400).json({ error: 'Campos obrigatórios' });
    const task = await db.tasks.insert({
      title,
      subject,
      description: description || '',
      dueDate,
      teacher: teacher || req.user.id,
      grade,
      points: points || 10,
      createdAt: new Date().toISOString()
    });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/api/tasks/:id', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { title, subject, description, dueDate, grade, points } = req.body;
    const update = {};
    if (title) update.title = title;
    if (subject) update.subject = subject;
    if (description) update.description = description;
    if (dueDate) update.dueDate = dueDate;
    if (grade) update.grade = grade;
    if (points) update.points = points;
    await db.tasks.update({ _id: req.params.id }, { $set: update });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/api/tasks/:id', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    await db.tasks.remove({ _id: req.params.id });
    await db.tasks.remove({ taskId: req.params.id, _type: 'completion' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tasks/:taskId/complete', authMiddleware, requireRole('student','parent'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const existing = await db.tasks.findOne({ taskId: req.params.taskId, studentId, _type: 'completion' });
    if (existing) {
      await db.tasks.update({ _id: existing._id }, { $set: { done: true, submittedAt: new Date().toISOString() } });
    } else {
      await db.tasks.insert({ _type: 'completion', taskId: req.params.taskId, studentId, done: true, submittedAt: new Date().toISOString(), grade: null });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/tasks/:taskId/grade', authMiddleware, requireRole('teacher','admin'), async (req, res) => {
  try {
    const { studentId, grade } = req.body;
    if (!grade || isNaN(grade)) return res.status(400).json({ error: 'Nota inválida' });
    const completion = await db.tasks.findOne({ taskId: req.params.taskId, studentId, _type: 'completion' });
    if (!completion) return res.status(404).json({ error: 'Entrega não encontrada' });
    await db.tasks.update({ _id: completion._id }, { $set: { grade: parseFloat(grade) } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── EVENTS ───────────────────────────────────────────────────────
router.get('/api/events', authMiddleware, async (req, res) => {
  try {
    const { grade } = req.query;
    const query = grade ? { $or: [{ grade }, { grade: 'Todas' }] } : {};
    const events = await db.events.find(query).sort({ date: 1 });
    res.json(events);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/events/:id', authMiddleware, async (req, res) => {
  try {
    const event = await db.events.findOne({ _id: req.params.id });
    if (!event) return res.status(404).json({ error: 'Evento não encontrado' });
    res.json(event);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/events', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { title, date, type, grade, subject, description } = req.body;
    if (!title || !date || !type || !grade) return res.status(400).json({ error: 'Campos obrigatórios: title, date, type, grade' });
    const event = await db.events.insert({ title, date, type, grade, subject: subject || '', description: description || '' });
    res.json(event);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/api/events/:id', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { title, date, type, grade, subject, description } = req.body;
    const update = {};
    if (title) update.title = title;
    if (date) update.date = date;
    if (type) update.type = type;
    if (grade) update.grade = grade;
    if (subject) update.subject = subject;
    if (description) update.description = description;
    await db.events.update({ _id: req.params.id }, { $set: update });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/api/events/:id', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    await db.events.remove({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── SPORTS ───────────────────────────────────────────────────────
router.get('/api/sports', authMiddleware, async (req, res) => {
  try {
    const sports = await db.sports.find({});
    res.json(sports);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/sports/:id', authMiddleware, async (req, res) => {
  try {
    const sport = await db.sports.findOne({ _id: req.params.id });
    if (!sport) return res.status(404).json({ error: 'Esporte não encontrado' });
    res.json(sport);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/sports', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { name, modality, nextGame, opponent, location, time, players } = req.body;
    if (!name || !modality) return res.status(400).json({ error: 'Campos obrigatórios' });
    const sport = await db.sports.insert({
      name,
      modality,
      nextGame: nextGame || '',
      opponent: opponent || '',
      location: location || '',
      time: time || '',
      players: players || [],
      results: []
    });
    res.json(sport);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/api/sports/:id', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { name, modality, nextGame, opponent, location, time, players } = req.body;
    const update = {};
    if (name) update.name = name;
    if (modality) update.modality = modality;
    if (nextGame) update.nextGame = nextGame;
    if (opponent) update.opponent = opponent;
    if (location) update.location = location;
    if (time) update.time = time;
    if (players) update.players = players;
    await db.sports.update({ _id: req.params.id }, { $set: update });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/sports/:id/result', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const { date, score, won } = req.body;
    if (!date || !score) return res.status(400).json({ error: 'Campos obrigatórios' });
    const sport = await db.sports.findOne({ _id: req.params.id });
    const results = sport.results || [];
    results.push({ date, score, won: won !== undefined ? won : null });
    await db.sports.update({ _id: req.params.id }, { $set: { results } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/api/sports/:id', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    await db.sports.remove({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/sports/student/:studentId', authMiddleware, async (req, res) => {
  try {
    const sports = await db.sports.find({ players: { $elemMatch: req.params.studentId } });
    res.json(sports);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── MESSAGES ─────────────────────────────────────────────────────
router.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const msgs = await db.messages.find({ to: req.user.id }).sort({ date: -1 });
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/messages/sent', authMiddleware, async (req, res) => {
  try {
    const msgs = await db.messages.find({ from: req.user.id }).sort({ date: -1 });
    res.json(msgs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/message/:id', authMiddleware, async (req, res) => {
  try {
    const msg = await db.messages.findOne({ _id: req.params.id });
    if (!msg) return res.status(404).json({ error: 'Mensagem não encontrada' });
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/messages/read/:id', authMiddleware, async (req, res) => {
  try {
    await db.messages.update({ _id: req.params.id }, { $set: { read: true } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: 'Campos obrigatórios: to, subject, body' });
    
    // Find the recipient by email
    const toUser = await db.users.findOne({ email: to });
    if (!toUser) {
      return res.status(404).json({ error: 'Usuário destinatário não encontrado' });
    }
    
    const fromUser = await db.users.findOne({ _id: req.user.id });
    const msg = await db.messages.insert({
      from: req.user.id,
      fromName: fromUser.name,
      to: toUser._id,
      toEmail: toUser.email,
      toName: toUser.name,
      subject,
      body,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      read: false
    });
    res.json(msg);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    await db.messages.remove({ _id: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN: all students ──────────────────────────────────────────
router.get('/api/students', authMiddleware, requireRole('admin','teacher'), async (req, res) => {
  try {
    const students = await db.students.find({});
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ADMIN: USERS ─────────────────────────────────────────────────
router.get('/api/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await db.users.find({});
    const sanitized = users.map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, avatar: u.avatar }));
    res.json(sanitized);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/api/users/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'teacher', 'parent', 'student'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Função inválida' });
    await db.users.update({ _id: req.params.id }, { $set: { role } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── REPORTS & STATISTICS ─────────────────────────────────────────
router.get('/api/reports/grades/:studentId', authMiddleware, async (req, res) => {
  try {
    const grades = await db.grades.find({ studentId: req.params.studentId });
    const report = {
      totalSubjects: grades.length,
      approved: grades.filter(g => g.status === 'aprovado').length,
      needsRecovery: grades.filter(g => g.status === 'recuperação').length,
      failed: grades.filter(g => g.status === 'reprovado').length,
      average: grades.length ? +(grades.filter(g => g.media).reduce((a, g) => a + (g.media || 0), 0) / grades.filter(g => g.media).length).toFixed(2) : 0,
      subjects: grades
    };
    res.json(report);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/reports/attendance/:studentId', authMiddleware, async (req, res) => {
  try {
    const records = await db.attendance.find({ studentId: req.params.studentId });
    const report = {
      total: records.length,
      present: records.filter(r => r.status === 'presente').length,
      absent: records.filter(r => r.status === 'falta').length,
      late: records.filter(r => r.status === 'atrasado').length,
      attendanceRate: records.length ? +((records.filter(r => r.status !== 'falta').length / records.length) * 100).toFixed(2) : 100
    };
    res.json(report);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/api/reports/class/:grade', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const students = await db.students.find({ grade: req.params.grade });
    const report = [];
    for (const student of students) {
      const grades = await db.grades.find({ studentId: student._id });
      const attendance = await db.attendance.find({ studentId: student._id });
      const avg = grades.length ? +(grades.filter(g => g.media).reduce((a, g) => a + (g.media || 0), 0) / grades.filter(g => g.media).length).toFixed(2) : 0;
      const attRate = attendance.length ? +((attendance.filter(r => r.status !== 'falta').length / attendance.length) * 100).toFixed(2) : 100;
      report.push({
        studentId: student._id,
        name: student.name,
        average: avg,
        attendance: attRate,
        status: avg >= 6 && attRate >= 75 ? 'regular' : avg < 5 || attRate < 75 ? 'risk' : 'warning'
      });
    }
    res.json(report);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── USER INFO ────────────────────────────────────────────────────
router.get('/api/me', authMiddleware, (req, res) => res.json(req.user));

module.exports = router;
