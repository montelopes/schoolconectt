// ────────────────────────────────────────────────────────────────
// SCHOOLCONNECT - MELHORIAS E FUNCIONALIDADES ADICIONAIS
// ────────────────────────────────────────────────────────────────

// ── VALIDAÇÃO E FORMATAÇÃO ──────────────────────────────────────
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateLong(date) {
  if (!date) return '—';
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getDaysUntil(date) {
  if (!date) return 0;
  const daysLeft = Math.ceil((new Date(date) - new Date()) / 86400000);
  return daysLeft;
}

// ── NOTIFICAÇÕES ────────────────────────────────────────────────
function showNotification(title, options = {}) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/img/logo.png',
      ...options
    });
  }
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── ARMAZENAMENTO LOCAL ─────────────────────────────────────────
function saveDraft(key, data) {
  localStorage.setItem(`draft_${key}`, JSON.stringify(data));
  showToast('💾 Rascunho salvo automaticamente');
}

function loadDraft(key) {
  const data = localStorage.getItem(`draft_${key}`);
  return data ? JSON.parse(data) : null;
}

function clearDraft(key) {
  localStorage.removeItem(`draft_${key}`);
}

// ── RELATÓRIOS E EXPORTAÇÃO ─────────────────────────────────────
async function generateStudentReport(studentId) {
  try {
    const [grades, attendance, tasks] = await Promise.all([
      api(`/api/reports/grades/${studentId}`),
      api(`/api/reports/attendance/${studentId}`),
      api(`/api/tasks/${studentId}`)
    ]);

    const report = {
      generatedAt: new Date().toLocaleString('pt-BR'),
      studentId,
      grades: grades.report,
      attendance: attendance,
      tasks: tasks.filter(t => t.completion?.done).length + ' concluídas de ' + tasks.length
    };

    return report;
  } catch (e) {
    console.error('Erro ao gerar relatório:', e);
    return null;
  }
}

function exportToPDF(title, content) {
  // Implementação básica - pode ser expandida com uma lib como jsPDF
  const win = window.open('', '', 'width=900,height=600');
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial; margin: 20px; color: #333; }
        h1 { color: #08152E; border-bottom: 2px solid #0891B2; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #E2E8F0; padding: 10px; text-align: left; }
        th { background: #F8FAFC; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
      <script>window.print();</script>
    </body>
    </html>
  `);
  win.document.close();
}

// ── GRÁFICOS SIMPLES ────────────────────────────────────────────
function createSimpleChart(labels, values, colors = []) {
  const maxVal = Math.max(...values);
  const chartHTML = `
    <div style="display:flex;align-items:flex-end;gap:10px;height:200px;background:var(--off);border-radius:10px;padding:20px">
      ${labels.map((label, i) => {
        const height = (values[i] / maxVal) * 150;
        const color = colors[i] || 'var(--teal)';
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px">
            <div style="width:100%;height:${height}px;background:${color};border-radius:6px;transition:all 0.3s" title="${values[i]}"></div>
            <small style="font-size:11px;text-align:center;color:var(--slate)">${label}</small>
            <strong style="font-size:12px">${values[i]}</strong>
          </div>
        `;
      }).join('')}
    </div>
  `;
  return chartHTML;
}

// ── BUSCA E FILTRO ─────────────────────────────────────────────
function searchInArray(arr, query, fields) {
  if (!query) return arr;
  const lowerQuery = query.toLowerCase();
  return arr.filter(item => 
    fields.some(field => 
      String(item[field]).toLowerCase().includes(lowerQuery)
    )
  );
}

function filterByDate(items, startDate, endDate) {
  return items.filter(item => {
    const itemDate = new Date(item.date || item.dueDate);
    return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
  });
}

// ── UTILITÁRIOS PARA PERFORMANCE ────────────────────────────────
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ── AUTOSAVE DE FORMULÁRIOS ─────────────────────────────────────
function setupAutoSave(formId, saveFn, interval = 30000) {
  const form = document.getElementById(formId);
  if (!form) return;

  const autoSave = debounce(() => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    saveDraft(formId, data);
    saveFn?.(data);
  }, 1000);

  form.addEventListener('input', autoSave);
  form.addEventListener('change', autoSave);
}

// ── COMPARAÇÃO DE DATAS ─────────────────────────────────────────
function isOverdue(date) {
  return new Date(date) < new Date();
}

function isSoon(date, days = 3) {
  const futureDate = new Date(date);
  const now = new Date();
  const diff = futureDate - now;
  return diff > 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function isToday(date) {
  const today = new Date().toISOString().split('T')[0];
  return date === today;
}

// ── CÁLCULOS EDUCACIONAIS ───────────────────────────────────────
function calculateAverage(grades) {
  const validGrades = grades.filter(g => g !== null && !isNaN(g));
  if (validGrades.length === 0) return null;
  return +(validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2);
}

function getGradeStatus(average) {
  if (average === null) return 'pendente';
  if (average >= 7) return 'aprovado';
  if (average >= 5) return 'recuperacao';
  return 'reprovado';
}

function calculateAttendanceRate(records) {
  if (records.length === 0) return 100;
  const present = records.filter(r => r.status !== 'falta').length;
  return +(present / records.length * 100).toFixed(2);
}

// ── NOTIFICAÇÕES DE EVENTOS ─────────────────────────────────────
async function checkUpcomingEvents() {
  try {
    const student = STUDENT || await api(`/api/student/${USER.studentId || USER.studentIds?.[0]}`);
    const events = await api(`/api/events?grade=${encodeURIComponent(student?.grade || 'Todas')}`);
    
    const upcoming = events.filter(e => isSoon(e.date, 7));
    if (upcoming.length > 0) {
      showToast(`📅 ${upcoming.length} evento(s) próximo(s) em 7 dias`);
    }
  } catch (e) {
    console.log('Erro ao verificar eventos:', e);
  }
}

// ── TEMAS E PREFERÊNCIAS ────────────────────────────────────────
function savePreference(key, value) {
  localStorage.setItem(`pref_${key}`, JSON.stringify(value));
}

function getPreference(key, defaultValue = null) {
  const value = localStorage.getItem(`pref_${key}`);
  return value ? JSON.parse(value) : defaultValue;
}

function toggleDarkMode() {
  const isDark = getPreference('darkMode', false);
  savePreference('darkMode', !isDark);
  // Implementar lógica de dark mode
  showToast(isDark ? '☀️ Modo claro ativado' : '🌙 Modo escuro ativado');
}

// ── SINCRONIZAÇÃO COM SERVIDOR ──────────────────────────────────
async function syncData() {
  try {
    const user = await api('/api/me');
    if (STUDENT) {
      STUDENT = await api(`/api/student/${STUDENT._id}`);
    }
    await checkMessages();
    showToast('✅ Dados sincronizados');
  } catch (e) {
    console.error('Erro na sincronização:', e);
  }
}

// Sincronizar a cada 5 minutos
setInterval(syncData, 5 * 60 * 1000);

// ── INICIALIZAÇÃO ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  requestNotificationPermission();
});
