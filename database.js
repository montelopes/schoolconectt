const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = {
  users:      Datastore.create({ filename: path.join(__dirname, 'data/users.db'),      autoload: true }),
  students:   Datastore.create({ filename: path.join(__dirname, 'data/students.db'),   autoload: true }),
  grades:     Datastore.create({ filename: path.join(__dirname, 'data/grades.db'),     autoload: true }),
  attendance: Datastore.create({ filename: path.join(__dirname, 'data/attendance.db'), autoload: true }),
  tasks:      Datastore.create({ filename: path.join(__dirname, 'data/tasks.db'),      autoload: true }),
  events:     Datastore.create({ filename: path.join(__dirname, 'data/events.db'),     autoload: true }),
  messages:   Datastore.create({ filename: path.join(__dirname, 'data/messages.db'),   autoload: true }),
  sports:     Datastore.create({ filename: path.join(__dirname, 'data/sports.db'),     autoload: true }),
};

async function seedDatabase() {
  const existing = await db.users.find({});
  if (existing.length > 0) return;

  console.log('Seeding database...');

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // ─── USERS ─────────────────────────────────────────────────────
  const users = [
    { _id: 'u_admin',    name: 'Direção Escolar',     email: 'admin@school.com',      password: hash('admin123'),    role: 'admin',   avatar: 'AD' },
    { _id: 'u_prof1',    name: 'Prof. Carlos Lima',   email: 'carlos@school.com',     password: hash('prof123'),     role: 'teacher', avatar: 'CL', subjects: ['Matemática', 'Física'] },
    { _id: 'u_prof2',    name: 'Prof. Ana Souza',     email: 'ana@school.com',        password: hash('prof123'),     role: 'teacher', avatar: 'AS', subjects: ['Português', 'Literatura'] },
    { _id: 'u_prof3',    name: 'Prof. Roberto Silva', email: 'roberto@school.com',    password: hash('prof123'),     role: 'teacher', avatar: 'RS', subjects: ['História', 'Geografia'] },
    { _id: 'u_parent1',  name: 'Maria Oliveira',      email: 'maria@email.com',       password: hash('pai123'),      role: 'parent',  avatar: 'MO', studentIds: ['s1'] },
    { _id: 'u_parent2',  name: 'João Costa',          email: 'joao@email.com',        password: hash('pai123'),      role: 'parent',  avatar: 'JC', studentIds: ['s2'] },
    { _id: 'u_student1', name: 'Lucas Oliveira',      email: 'lucas@school.com',      password: hash('aluno123'),    role: 'student', avatar: 'LO', studentId: 's1' },
    { _id: 'u_student2', name: 'Sofia Costa',         email: 'sofia@school.com',      password: hash('aluno123'),    role: 'student', avatar: 'SC', studentId: 's2' },
  ];
  for (const u of users) await db.users.insert(u);

  // ─── STUDENTS ──────────────────────────────────────────────────
  const students = [
    { _id: 's1', name: 'Lucas Oliveira',  age: 14, grade: '9º Ano A', photo: 'LO', parentId: 'u_parent1', userId: 'u_student1', turno: 'Manhã',  matricula: '2025001', nascimento: '12/03/2011' },
    { _id: 's2', name: 'Sofia Costa',     age: 13, grade: '8º Ano B', photo: 'SC', parentId: 'u_parent2', userId: 'u_student2', turno: 'Tarde',  matricula: '2025002', nascimento: '05/07/2012' },
    { _id: 's3', name: 'Pedro Mendes',    age: 15, grade: '9º Ano A', photo: 'PM', parentId: null,        userId: null,         turno: 'Manhã',  matricula: '2025003', nascimento: '22/11/2010' },
    { _id: 's4', name: 'Julia Ferreira',  age: 13, grade: '8º Ano B', photo: 'JF', parentId: null,        userId: null,         turno: 'Tarde',  matricula: '2025004', nascimento: '18/04/2012' },
  ];
  for (const s of students) await db.students.insert(s);

  // ─── GRADES ────────────────────────────────────────────────────
  const subjects = ['Matemática','Português','História','Geografia','Ciências','Física','Química','Inglês','Educação Física','Artes'];
  const gradeData = [];
  for (const sid of ['s1','s2','s3','s4']) {
    for (const sub of subjects) {
      gradeData.push({
        studentId: sid, subject: sub,
        bimestre1: +(Math.random()*4+6).toFixed(1),
        bimestre2: +(Math.random()*4+5.5).toFixed(1),
        bimestre3: +(Math.random()*4+6).toFixed(1),
        bimestre4: null,
        teacher: sub === 'Matemática' || sub === 'Física' ? 'Prof. Carlos Lima' : sub === 'Português' || sub === 'Literatura' ? 'Prof. Ana Souza' : 'Prof. Roberto Silva'
      });
    }
  }
  for (const g of gradeData) await db.grades.insert(g);

  // ─── ATTENDANCE (last 30 days) ──────────────────────────────────
  const today = new Date();
  for (const sid of ['s1','s2','s3','s4']) {
    for (let i = 30; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const rand = Math.random();
      const status = rand > 0.88 ? 'falta' : rand > 0.82 ? 'atrasado' : 'presente';
      await db.attendance.insert({
        studentId: sid,
        date: d.toISOString().split('T')[0],
        status,
        horarioEntrada: status === 'presente' ? '07:30' : status === 'atrasado' ? '08:' + String(Math.floor(Math.random()*50+10)).padStart(2,'0') : null,
        horarioSaida: status !== 'falta' ? '12:30' : null,
      });
    }
  }

  // ─── TASKS ─────────────────────────────────────────────────────
  const tasks = [
    { _id: 't1', title: 'Exercícios de Álgebra', subject: 'Matemática', description: 'Resolver os exercícios 1 ao 20 da página 87 do livro.', dueDate: futureDate(3),  teacher: 'u_prof1', grade: '9º Ano A', points: 10 },
    { _id: 't2', title: 'Redação: Meio Ambiente', subject: 'Português',  description: 'Produção textual dissertativa-argumentativa com mínimo 30 linhas.', dueDate: futureDate(7), teacher: 'u_prof2', grade: '9º Ano A', points: 10 },
    { _id: 't3', title: 'Mapa da América do Sul', subject: 'Geografia',  description: 'Montar e identificar todos os países com capitais no mapa mudo.', dueDate: futureDate(5), teacher: 'u_prof3', grade: '9º Ano A', points: 8 },
    { _id: 't4', title: 'Equações do 2º Grau',   subject: 'Matemática', description: 'Lista de equações do caderno de exercícios, pág 45-47.', dueDate: futureDate(2), teacher: 'u_prof1', grade: '8º Ano B', points: 10 },
    { _id: 't5', title: 'Análise Sintática',      subject: 'Português',  description: 'Identificar sujeito e predicado nos textos fornecidos.', dueDate: futureDate(4), teacher: 'u_prof2', grade: '8º Ano B', points: 8  },
    { _id: 't6', title: 'Pesquisa: Segunda Guerra', subject: 'História', description: 'Pesquisar causas e consequências com no mínimo 3 fontes.', dueDate: pastDate(2), teacher: 'u_prof3', grade: '9º Ano A', points: 10 },
    { _id: 't7', title: 'Lei de Newton',          subject: 'Física',    description: 'Resolver 15 problemas aplicando as 3 leis de Newton.', dueDate: pastDate(5),  teacher: 'u_prof1', grade: '9º Ano A', points: 10 },
  ];
  for (const t of tasks) await db.tasks.insert(t);

  // Task completions
  const completions = [
    { taskId: 't6', studentId: 's1', done: true,  grade: 9.0, submittedAt: pastDate(1) },
    { taskId: 't7', studentId: 's1', done: true,  grade: 8.5, submittedAt: pastDate(3) },
    { taskId: 't6', studentId: 's2', done: false, grade: null, submittedAt: null },
    { taskId: 't7', studentId: 's2', done: true,  grade: 7.5, submittedAt: pastDate(4) },
    { taskId: 't4', studentId: 's2', done: true,  grade: null, submittedAt: new Date().toISOString() },
    { taskId: 't5', studentId: 's2', done: false, grade: null, submittedAt: null },
  ];
  for (const c of completions) await db.tasks.insert({ _type: 'completion', ...c });

  // ─── EVENTS ────────────────────────────────────────────────────
  const events = [
    { title: 'Prova de Matemática',   date: futureDate(5),  type: 'prova',    grade: '9º Ano A', subject: 'Matemática', description: 'Capítulos 5, 6 e 7 — Álgebra e Funções' },
    { title: 'Prova de Português',    date: futureDate(8),  type: 'prova',    grade: '9º Ano A', subject: 'Português',  description: 'Interpretação e Gramática' },
    { title: 'Reunião de Pais',       date: futureDate(12), type: 'reunião',  grade: 'Todas',    subject: '',           description: 'Entrega de boletins do 3º bimestre' },
    { title: 'Feira de Ciências',     date: futureDate(20), type: 'evento',   grade: 'Todas',    subject: 'Ciências',   description: 'Apresentação de projetos científicos' },
    { title: 'Jogos Escolares',       date: futureDate(15), type: 'esporte',  grade: 'Todas',    subject: '',           description: 'Fase municipal de futsal e vôlei' },
    { title: 'Conselho de Classe',    date: futureDate(25), type: 'reunião',  grade: 'Todas',    subject: '',           description: 'Avaliação do desempenho dos alunos' },
    { title: 'Prova de História',     date: futureDate(10), type: 'prova',    grade: '8º Ano B', subject: 'História',   description: 'Era das Grandes Navegações' },
    { title: 'Recesso Escolar',       date: futureDate(30), type: 'feriado',  grade: 'Todas',    subject: '',           description: '3 dias de recesso de outubro' },
  ];
  for (const e of events) await db.events.insert(e);

  // ─── SPORTS ────────────────────────────────────────────────────
  const sports = [
    { name: 'Futsal Masculino',  modality: 'Futsal',    nextGame: futureDate(15), opponent: 'Escola Estadual Dom Pedro', location: 'Ginásio Municipal', time: '14h00', players: ['s1','s3'], results: [{ date: pastDate(20), score: '3x1', won: true }, { date: pastDate(35), score: '2x2', won: null }] },
    { name: 'Vôlei Feminino',    modality: 'Vôlei',     nextGame: futureDate(15), opponent: 'Colégio Santa Luzia',      location: 'Ginásio da Escola',  time: '10h00', players: ['s2','s4'], results: [{ date: pastDate(18), score: '2x0', won: true }, { date: pastDate(30), score: '1x2', won: false }] },
    { name: 'Xadrez',            modality: 'Xadrez',    nextGame: futureDate(22), opponent: 'Torneio Municipal',        location: 'Biblioteca Central', time: '09h00', players: ['s1','s2','s4'], results: [{ date: pastDate(10), score: '3 vitórias', won: true }] },
    { name: 'Atletismo',         modality: 'Atletismo', nextGame: futureDate(28), opponent: 'Olimpíadas Escolares',     location: 'Pista Municipal',    time: '08h00', players: ['s3'], results: [] },
  ];
  for (const s of sports) await db.sports.insert(s);

  // ─── MESSAGES ──────────────────────────────────────────────────
  const messages = [
    { from: 'u_prof1', to: 'u_parent1', studentId: 's1', subject: 'Ótimo desempenho em Matemática', body: 'Olá, Maria! Lucas tem se destacado muito nas aulas. Continue incentivando!', date: pastDate(3), read: false },
    { from: 'u_prof2', to: 'u_parent1', studentId: 's1', subject: 'Redação pendente', body: 'A redação do Lucas ainda não foi entregue. Prazo termina amanhã.', date: pastDate(1), read: false },
    { from: 'u_admin', to: 'u_parent1', studentId: 's1', subject: 'Reunião de pais', body: 'Lembramos que a reunião de entrega de boletins será no dia ' + futureDate(12) + '. Confirme presença.', date: pastDate(5), read: true },
    { from: 'u_prof1', to: 'u_parent2', studentId: 's2', subject: 'Recuperação em Matemática', body: 'Sofia precisa de reforço. Há aulas de recuperação às quartas-feiras às 14h.', date: pastDate(2), read: false },
  ];
  for (const m of messages) await db.messages.insert(m);

  console.log('✅ Database seeded!');
}

function futureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
function pastDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

module.exports = { db, seedDatabase };
