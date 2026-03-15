/* ══════════════════════════════════════════════════════════════════════════
   Provider Schedule Automation - JavaScript v2.0
   Enhanced with animations, particles, and interactive features
   ══════════════════════════════════════════════════════════════════════════ */

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE SOURCE OF TRUTH: Provider Data
// ═══════════════════════════════════════════════════════════════════════════
const providers = [
  { name: "Alexis Foster-Horton",    email: "alexis.foster-horton@fountain.net" },
  { name: "Ashley Escoe",            email: "ashley.escoe@fountain.net" },
  { name: "Ashley Grout",            email: "Ashley.Grout@fountain.net" },
  { name: "Bryana Anderson",         email: "bryana@fountain.net" },
  { name: "Bryce Amos",              email: "bryce@fountain.net" },
  { name: "Catherine Herrington, MD", email: "catherine@fountain.net" },
  { name: "Danielle Board",          email: "Danielle.Board@Fountain.net" },
  { name: "DeAnna Maher",            email: "deanna.maher@fountain.net" },
  { name: "Liz Gloor",               email: "liz@fountain.net" },
  { name: "Martin Van Dongen",       email: "martin@fountain.net" },
  { name: "Megan Ryan-Riffle",       email: "megan.ryan-riffle@fountain.net" },
  { name: "Michele Foster",          email: "Michele.Foster@Fountain.net" },
  { name: "Priya Chaudhari",         email: "priya@fountain.net" },
  { name: "Rachel Razi",             email: "rachel.razi@fountain.net" },
  { name: "Skye Sauls",              email: "skye.sauls@fountain.net" },
  { name: "Stephen Mooney, MD",      email: "stephen.mooney@fountain.net" },
  { name: "Tim Mack",                email: "tim@fountain.net" },
  { name: "Vivien Lee",              email: "vivien@fountain.net" },
];

const avatarColors = [
  ["#1f3a5f","#79c0ff"], ["#1a3a2a","#56d364"], ["#2a1a3a","#d2a8ff"],
  ["#3a2a1a","#ffa657"], ["#1a2a3a","#58a6ff"], ["#3a1a2a","#f78166"],
];

// Provider status cache
let providerStatuses = {};

// ═══════════════════════════════════════════════════════════════════════════
// DATE UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function getScheduleCycle() {
  const today = new Date();
  const baseDate = new Date('2024-03-03');
  const daysSinceBase = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
  const cycleNumber = Math.floor(daysSinceBase / 14);

  const cycleStart = new Date(baseDate);
  cycleStart.setDate(baseDate.getDate() + (cycleNumber * 14));

  const cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleStart.getDate() + 13);

  const reminderDate = new Date(cycleEnd);
  reminderDate.setDate(cycleEnd.getDate() - 2);
  reminderDate.setHours(9, 0, 0, 0);

  const escalationDate = new Date(cycleEnd);
  escalationDate.setDate(cycleEnd.getDate() + 1);
  escalationDate.setHours(9, 0, 0, 0);

  const nextCycleStart = new Date(cycleEnd);
  nextCycleStart.setDate(cycleEnd.getDate() + 1);

  const nextReminderDate = new Date(nextCycleStart);
  nextReminderDate.setDate(nextCycleStart.getDate() + 12);
  nextReminderDate.setHours(9, 0, 0, 0);

  return {
    cycleStart,
    cycleEnd,
    reminderDate,
    escalationDate,
    nextCycleStart,
    nextReminderDate,
    daysIntoCycle: daysSinceBase % 14,
    cycleNumber,
    today
  };
}

function formatDate(date, style = 'short') {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  if (style === 'full') return `${month} ${day}, ${date.getFullYear()}`;
  return `${month} ${day}`;
}

function formatDateRange(start, end) {
  return `${formatDate(start)}–${formatDate(end)}`;
}

function formatISODate(date) {
  return date.toISOString().slice(0, 19).replace('T', 'T');
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  // Add reveal classes to sections
  document.querySelectorAll('section').forEach((section, i) => {
    section.classList.add('reveal');
    section.style.transitionDelay = `${i * 0.05}s`;
  });

  // Add reveal to pipeline steps
  document.querySelectorAll('.pipeline-step').forEach(step => {
    step.classList.add('reveal-scale');
  });

  // Re-observe after adding classes
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = !document.documentElement.hasAttribute('data-theme') ||
                   document.documentElement.getAttribute('data-theme') === 'dark';
    const particleColor = isDark ? '88, 166, 255' : '9, 105, 218';
    const lineColor = isDark ? '88, 166, 255' : '9, 105, 218';

    particles.forEach((p, i) => {
      // Move particles
      p.x += p.vx;
      p.y += p.vy;

      // Subtle mouse interaction
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        p.vx -= dx * 0.00005;
        p.vy -= dy * 0.00005;
      }

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.opacity})`;
      ctx.fill();

      // Draw connections
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    animationId = requestAnimationFrame(drawParticles);
  }

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  resize();
  createParticles();
  drawParticles();
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════════════════════

function initCountdown() {
  const container = document.getElementById('countdownContainer');
  if (!container) return;

  function updateCountdown() {
    const cycle = getScheduleCycle();
    const now = new Date();

    // Determine next event
    let targetDate;
    let eventName;

    if (now < cycle.reminderDate) {
      targetDate = cycle.reminderDate;
      eventName = 'Next Reminder';
    } else if (now < cycle.escalationDate) {
      targetDate = cycle.escalationDate;
      eventName = 'Escalation';
    } else {
      targetDate = cycle.nextReminderDate;
      eventName = 'Next Reminder';
    }

    const diff = targetDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const isUrgent = days === 0 && hours < 12;

    container.innerHTML = `
      <div class="countdown-label">${eventName} in</div>
      <div class="countdown-timer ${isUrgent ? 'countdown-urgent' : ''}">
        <div class="countdown-unit">
          <div class="countdown-value">${days}</div>
          <div class="countdown-unit-label">Days</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit">
          <div class="countdown-value">${String(hours).padStart(2, '0')}</div>
          <div class="countdown-unit-label">Hours</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit">
          <div class="countdown-value">${String(minutes).padStart(2, '0')}</div>
          <div class="countdown-unit-label">Min</div>
        </div>
        <div class="countdown-separator">:</div>
        <div class="countdown-unit">
          <div class="countdown-value">${String(seconds).padStart(2, '0')}</div>
          <div class="countdown-unit-label">Sec</div>
        </div>
      </div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ═══════════════════════════════════════════════════════════════════════════
// CYCLE PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════

function initProgressBar() {
  const container = document.getElementById('progressContainer');
  if (!container) return;

  const cycle = getScheduleCycle();
  const progress = ((cycle.daysIntoCycle + 1) / 14) * 100;

  container.innerHTML = `
    <div class="cycle-progress-header">
      <div class="cycle-progress-title">
        <span class="live-dot"></span>
        Cycle Progress
      </div>
      <div class="cycle-progress-days">
        Day <strong>${cycle.daysIntoCycle + 1}</strong> of 14
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${progress}%"></div>
    </div>
    <div class="progress-markers">
      <span>${formatDate(cycle.cycleStart)}</span>
      <span>Reminder</span>
      <span>Due</span>
      <span>${formatDate(cycle.cycleEnd)}</span>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED STATS (Count Up)
// ═══════════════════════════════════════════════════════════════════════════

function initAnimatedStats() {
  const stats = document.querySelectorAll('.stat-num[data-value]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateValue(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
}

function animateValue(element) {
  const target = parseInt(element.dataset.value, 10);
  const suffix = element.dataset.suffix || '';
  const duration = 1500;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ═══════════════════════════════════════════════════════════════════════════
// DONUT CHART
// ═══════════════════════════════════════════════════════════════════════════

function initDonutChart() {
  const chart = document.querySelector('.donut-chart');
  if (!chart) return;

  const progress = chart.querySelector('.donut-progress');
  if (!progress) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progress.classList.add('animate');
      }
    });
  }, { threshold: 0.5 });

  observer.observe(chart);
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    showToast(`Switched to ${newTheme} mode`, 'success');
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

const shortcuts = {
  '1': '#workflow',
  '2': '#audit',
  '3': '#providers',
  '4': '#templates',
  '5': '#sheet',
  '6': '#tasks',
  '7': '#calendar',
  '8': '#format-guide',
  '9': '#compliance',
  '0': '#troubleshooting',
  '/': 'search',
  '?': 'help',
  't': 'theme',
  'Escape': 'close'
};

function initKeyboardShortcuts() {
  const modal = document.getElementById('shortcutsModal');

  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    const action = shortcuts[e.key];

    if (action) {
      e.preventDefault();

      if (action === 'search') {
        const searchBox = document.querySelector('.search-box');
        if (searchBox) searchBox.focus();
      } else if (action === 'help') {
        toggleShortcutsModal();
      } else if (action === 'theme') {
        document.getElementById('themeToggle')?.click();
      } else if (action === 'close') {
        if (modal?.classList.contains('active')) {
          modal.classList.remove('active');
        }
        closeMobileNav();
      } else if (action.startsWith('#')) {
        const section = document.querySelector(action);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  });
}

function toggleShortcutsModal() {
  const modal = document.getElementById('shortcutsModal');
  if (modal) {
    modal.classList.toggle('active');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMELINE "YOU ARE HERE" MARKER
// ═══════════════════════════════════════════════════════════════════════════

function updateTimelineMarkers() {
  const cycle = getScheduleCycle();
  const now = new Date();
  const items = document.querySelectorAll('.tl-item');

  items.forEach((item, index) => {
    item.classList.remove('past', 'current', 'future');

    // Determine state based on position
    if (index === 0) {
      // Cycle start - always past
      item.classList.add('past');
    } else if (index === 1) {
      // First reminder
      if (now < cycle.reminderDate) {
        item.classList.add('future');
      } else if (now < cycle.escalationDate) {
        item.classList.add('current');
        addYouAreHereBadge(item);
      } else {
        item.classList.add('past');
      }
    } else if (index === 2) {
      // Escalation
      if (now < cycle.reminderDate) {
        item.classList.add('future');
      } else if (now < cycle.escalationDate) {
        item.classList.add('future');
      } else if (now < cycle.nextCycleStart) {
        item.classList.add('current');
        addYouAreHereBadge(item);
      } else {
        item.classList.add('past');
      }
    } else {
      // Future items
      item.classList.add('future');
    }
  });
}

function addYouAreHereBadge(item) {
  const title = item.querySelector('.tl-title');
  if (title && !title.querySelector('.you-are-here-badge')) {
    const badge = document.createElement('span');
    badge.className = 'you-are-here-badge';
    badge.innerHTML = '← NOW';
    title.appendChild(badge);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFETTI CELEBRATION
// ═══════════════════════════════════════════════════════════════════════════

function triggerConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti';
  document.body.appendChild(container);

  const colors = ['#58a6ff', '#3fb950', '#f78166', '#d2a8ff', '#ffa657'];

  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 5000);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER TABLE
// ═══════════════════════════════════════════════════════════════════════════

function initials(name) {
  const parts = name.replace(/,.*/, "").trim().split(" ");
  return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
}

function getStatusBadge(status) {
  switch (status) {
    case 'submitted':
      return '<span class="status-badge status-sent">Submitted</span>';
    case 'pending':
      return '<span class="status-badge status-pending">Pending</span>';
    case 'loading':
      return '<span class="status-badge status-loading">Loading...</span>';
    default:
      return '<span class="status-badge status-pending">Pending</span>';
  }
}

function renderTable(list) {
  const tbody = document.getElementById("providerBody");
  if (!tbody) return;

  tbody.innerHTML = "";
  list.forEach((p, i) => {
    const [bg, fg] = avatarColors[i % avatarColors.length];
    const status = providerStatuses[p.email] || 'pending';
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="provider-name">
          <div class="avatar" style="background:${bg};color:${fg}">${initials(p.name)}</div>
          <div class="provider-name-text">
            <span class="provider-display">${p.name}</span>
          </div>
        </div>
      </td>
      <td><span class="provider-email">${p.email}</span></td>
      <td>${getStatusBadge(status)}</td>
    `;
    tbody.appendChild(row);
  });

  const countBadge = document.getElementById("providerCount");
  if (countBadge) {
    countBadge.textContent = `${list.length} provider${list.length !== 1 ? "s" : ""}`;
  }

  const noResults = document.getElementById("noResults");
  if (noResults) {
    noResults.classList.toggle("hidden", list.length > 0);
  }
}

function filterTable(q) {
  const lower = q.toLowerCase();
  const filtered = providers.filter(p =>
    p.name.toLowerCase().includes(lower) || p.email.toLowerCase().includes(lower)
  );
  renderTable(filtered);
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE SHEETS INTEGRATION (Placeholder)
// ═══════════════════════════════════════════════════════════════════════════

async function fetchProviderStatuses() {
  const SHEETS_API_URL = null;

  if (!SHEETS_API_URL) {
    console.log('Google Sheets integration not configured. Using demo mode.');
    return;
  }

  try {
    providers.forEach(p => providerStatuses[p.email] = 'loading');
    renderTable(providers);

    const response = await fetch(SHEETS_API_URL);
    const data = await response.json();
    providerStatuses = data;
    renderTable(providers);
    showToast('Status updated from Google Sheets', 'success');
  } catch (error) {
    console.error('Failed to fetch provider statuses:', error);
    showToast('Failed to load status from Google Sheets', 'error');
    providers.forEach(p => providerStatuses[p.email] = 'pending');
    renderTable(providers);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PROMPT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateAuditPrompt() {
  const providerList = providers
    .map(p => `• ${p.name}: ${p.email}`)
    .join('\n');

  return `Please search my Gmail for emails sent in the last 14 days from the following provider email addresses. Check specifically for the word 'Schedule' in the subject line.

Provider List:
${providerList}

Task:
1. List which providers have NOT sent an email with 'Schedule' in the subject line.
2. Organize results in alphabetical order by first name.
3. For any provider who HAS sent a 'Schedule' email, note the date it was received.`;
}

function generateCalendarPrompt() {
  return `I just received a schedule email from a provider.
Here is the email body:

---
[paste email body here]
---

Please do the following:

1. Extract all dates, shift start times, and end times mentioned in the email.

2. Identify the provider's name from the email sender or signature.

3. Create Google Calendar events for each shift or availability block using these details:
   • Title: [Provider Name] — Schedule
   • Calendar: Fountain Provider Schedules
   • Add any notes or exceptions as the description.

4. If any dates or times are ambiguous, flag them and ask me to confirm before creating the event.

5. Confirm once all events have been created, listing each one with its date and time.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// COPY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function copyPrompt(btn) {
  const text = generateAuditPrompt();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Audit prompt copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

function copyCalPrompt(btn) {
  const text = generateCalendarPrompt();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Calendar prompt copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard', 'error');
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TASK SWITCHER
// ═══════════════════════════════════════════════════════════════════════════

function showTask(id, btn) {
  document.querySelectorAll('.task-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.task-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  const panel = document.getElementById('task-' + id);
  if (panel) panel.classList.add('active');
  if (btn) {
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

function toggleMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active'));
  }
}

function closeMobileNav() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BACK TO TOP BUTTON
// ═══════════════════════════════════════════════════════════════════════════

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════════════════════

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute("href"));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileNav();
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC CONTENT UPDATES
// ═══════════════════════════════════════════════════════════════════════════

function updateDynamicDates() {
  const cycle = getScheduleCycle();

  const cycleLabelEl = document.getElementById('cycleDateLabel');
  if (cycleLabelEl) {
    cycleLabelEl.textContent = `Current Cycle · ${formatDateRange(cycle.cycleStart, cycle.cycleEnd)}`;
  }

  const tlCycleStart = document.getElementById('tlCycleStart');
  if (tlCycleStart) {
    tlCycleStart.textContent = `${formatDate(cycle.cycleStart)} — Cycle starts`;
  }

  const tlReminder = document.getElementById('tlReminder');
  if (tlReminder) {
    tlReminder.textContent = `${formatDate(cycle.reminderDate)} · 9:00 AM`;
  }

  const tlEscalation = document.getElementById('tlEscalation');
  if (tlEscalation) {
    tlEscalation.textContent = `${formatDate(cycle.escalationDate)} · 9:00 AM — Due Date`;
  }

  const tlNextCycle = document.getElementById('tlNextCycle');
  if (tlNextCycle) {
    tlNextCycle.textContent = `${formatDate(cycle.nextCycleStart)} — Next cycle begins`;
  }

  const tlNextReminder = document.getElementById('tlNextReminder');
  if (tlNextReminder) {
    tlNextReminder.textContent = `${formatDate(cycle.nextReminderDate)} · 9:00 AM`;
  }

  const reminderFireDate = document.getElementById('reminderFireDate');
  if (reminderFireDate) {
    reminderFireDate.textContent = `Fires ${formatDate(cycle.reminderDate)} · 9:00 AM`;
  }

  const reminderSchedule = document.getElementById('reminderSchedule');
  if (reminderSchedule) {
    reminderSchedule.innerHTML = `Every 2 weeks on Saturday at 9:00 AM · First fire: <code>${formatISODate(cycle.reminderDate)}:00</code>`;
  }

  const escalationFireDate = document.getElementById('escalationFireDate');
  if (escalationFireDate) {
    escalationFireDate.textContent = `Fires ${formatDate(cycle.escalationDate)} · 9:00 AM`;
  }

  const escalationSchedule = document.getElementById('escalationSchedule');
  if (escalationSchedule) {
    escalationSchedule.innerHTML = `Every 2 weeks on Monday at 9:00 AM · First fire: <code>${formatISODate(cycle.escalationDate)}:00</code>`;
  }

  updateSheetTabs(cycle);
}

function updateSheetTabs(cycle) {
  const tabsContainer = document.getElementById('sheetTabs');
  if (!tabsContainer) return;

  const prevCycleEnd = new Date(cycle.cycleStart);
  prevCycleEnd.setDate(prevCycleEnd.getDate() - 1);
  const prevCycleStart = new Date(prevCycleEnd);
  prevCycleStart.setDate(prevCycleEnd.getDate() - 13);

  const prevPrevCycleEnd = new Date(prevCycleStart);
  prevPrevCycleEnd.setDate(prevPrevCycleEnd.getDate() - 1);
  const prevPrevCycleStart = new Date(prevPrevCycleEnd);
  prevPrevCycleEnd.setDate(prevPrevCycleEnd.getDate() - 13);

  const nextCycleEnd = new Date(cycle.cycleEnd);
  nextCycleEnd.setDate(nextCycleEnd.getDate() + 14);

  const nextNextCycleStart = new Date(nextCycleEnd);
  nextNextCycleStart.setDate(nextNextCycleStart.getDate() + 1);
  const nextNextCycleEnd = new Date(nextNextCycleStart);
  nextNextCycleEnd.setDate(nextNextCycleEnd.getDate() + 13);

  tabsContainer.innerHTML = `
    <div class="sheet-tab">Master Roster</div>
    <div class="sheet-tab">${formatDateRange(prevPrevCycleStart, prevPrevCycleEnd)}</div>
    <div class="sheet-tab">${formatDateRange(prevCycleStart, prevCycleEnd)}</div>
    <div class="sheet-tab active">${formatDateRange(cycle.cycleStart, cycle.cycleEnd)} ←</div>
    <div class="sheet-tab future">${formatDateRange(cycle.nextCycleStart, nextCycleEnd)}</div>
    <div class="sheet-tab future">${formatDateRange(nextNextCycleStart, nextNextCycleEnd)}</div>
    <div class="sheet-tab add-tab">+ New period</div>
  `;
}

function updateProviderCount() {
  const countEl = document.getElementById('heroProviderCount');
  if (countEl) {
    countEl.textContent = providers.length;
  }

  const footerCount = document.getElementById('footerProviderCount');
  if (footerCount) {
    footerCount.textContent = `${providers.length} providers tracked`;
  }
}

function renderPromptDisplay() {
  const promptBody = document.getElementById('promptText');
  if (!promptBody) return;

  const providerLines = providers.map(p => {
    const paddedName = (p.name + ':').padEnd(26, ' ');
    return `<span class="val">• ${paddedName}</span> ${p.email}`;
  }).join('\n');

  promptBody.innerHTML = `Please search my Gmail for emails sent in the last 14 days from the following provider email addresses. Check specifically for the word 'Schedule' in the subject line.

<span class="kw">Provider List:</span>
${providerLines}

<span class="kw">Task:</span>
<span class="highlight">1.</span> List which providers have NOT sent an email with 'Schedule' in the subject line.
<span class="highlight">2.</span> Organize results in alphabetical order by first name.
<span class="highlight">3.</span> For any provider who HAS sent a 'Schedule' email, note the date it was received.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function initDashboard() {
  const cycle = getScheduleCycle();
  const progress = ((cycle.daysIntoCycle + 1) / 14) * 100;

  // Update cycle period
  const cyclePeriod = document.getElementById('dashCyclePeriod');
  if (cyclePeriod) {
    cyclePeriod.textContent = formatDateRange(cycle.cycleStart, cycle.cycleEnd);
  }

  // Update next reminder
  const nextReminder = document.getElementById('dashNextReminder');
  if (nextReminder) {
    const now = new Date();
    if (now < cycle.reminderDate) {
      nextReminder.textContent = formatDate(cycle.reminderDate, 'full');
    } else {
      nextReminder.textContent = formatDate(cycle.nextReminderDate, 'full');
    }
  }

  // Update deadline
  const deadline = document.getElementById('dashDeadline');
  if (deadline) {
    deadline.textContent = formatDate(cycle.escalationDate, 'full');
  }

  // Update day number
  const dayNum = document.getElementById('dashDayNum');
  if (dayNum) {
    dayNum.textContent = cycle.daysIntoCycle + 1;
  }

  // Update progress percent
  const progressPercent = document.getElementById('dashProgressPercent');
  if (progressPercent) {
    progressPercent.textContent = `${Math.round(progress)}%`;
  }

  // Update progress bar fill
  const progressFill = document.getElementById('dashProgressFill');
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }
}

function init() {
  // Core functionality
  renderTable(providers);
  updateDynamicDates();
  updateProviderCount();
  renderPromptDisplay();
  fetchProviderStatuses();
  initDashboard();

  // Enhanced features
  initScrollReveal();
  initParticles();
  initCountdown();
  initProgressBar();
  initAnimatedStats();
  initDonutChart();
  initThemeToggle();
  initKeyboardShortcuts();
  updateTimelineMarkers();

  // Navigation
  initSmoothScroll();
  initBackToTop();

  // Mobile nav handlers
  document.querySelectorAll('.nav-mobile-menu a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

  // Show welcome toast
  setTimeout(() => {
    showToast('Press ? for keyboard shortcuts', 'success', 4000);
  }, 2000);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLAPSIBLE STEPS
// ═══════════════════════════════════════════════════════════════════════════

function toggleSteps(button) {
  const stepsContainer = button.closest('.roadmap-steps');
  const content = stepsContainer.querySelector('.roadmap-steps-content');
  const icon = button.querySelector('.toggle-icon');
  const isExpanded = button.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    content.style.display = 'none';
    icon.innerHTML = '&#9654;'; // Right arrow
    button.setAttribute('aria-expanded', 'false');
    stepsContainer.classList.add('collapsed');
  } else {
    content.style.display = 'block';
    icon.innerHTML = '&#9660;'; // Down arrow
    button.setAttribute('aria-expanded', 'true');
    stepsContainer.classList.remove('collapsed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIVE CHECKLIST WITH LOCAL STORAGE
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'schedule-automation-progress';

function getStepProgress() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveStepProgress(stepId, checked) {
  const progress = getStepProgress();
  progress[stepId] = checked;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  // Update UI
  const li = document.querySelector(`li[data-step="${stepId}"]`);
  if (li) {
    li.classList.toggle('completed', checked);
  }

  updateProgressBar(1);
}

function loadStepProgress() {
  const progress = getStepProgress();

  Object.entries(progress).forEach(([stepId, checked]) => {
    const checkbox = document.querySelector(`li[data-step="${stepId}"] input[type="checkbox"]`);
    if (checkbox) {
      checkbox.checked = checked;
      const li = checkbox.closest('li');
      if (li) {
        li.classList.toggle('completed', checked);
      }
    }
  });

  updateProgressBar(1);
}

function updateProgressBar(phase) {
  const stepsList = document.getElementById(`phase${phase}Steps`);
  if (!stepsList) return;

  const checkboxes = stepsList.querySelectorAll('input[type="checkbox"]');
  const total = checkboxes.length;
  const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const progressBar = document.getElementById(`phase${phase}Progress`);
  const progressText = document.getElementById(`phase${phase}ProgressText`);

  if (progressBar) {
    progressBar.style.setProperty('--progress', `${percentage}%`);
  }

  if (progressText) {
    progressText.textContent = `${completed} of ${total} complete`;
  }
}

function resetPhaseProgress(phase) {
  const progress = getStepProgress();

  // Remove all steps for this phase
  Object.keys(progress).forEach(key => {
    if (key.startsWith(`p${phase}-`)) {
      delete progress[key];
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  // Update UI
  const stepsList = document.getElementById(`phase${phase}Steps`);
  if (stepsList) {
    stepsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
      const li = cb.closest('li');
      if (li) {
        li.classList.remove('completed');
      }
    });
  }

  updateProgressBar(phase);
  showToast('Progress reset', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════
// CYCLE CALENDAR
// ═══════════════════════════════════════════════════════════════════════════

function renderCycleCalendar() {
  const container = document.getElementById('cycleCalendarGrid');
  if (!container) return;

  const cycles = getUpcomingCycles(3);
  container.innerHTML = cycles.map((cycle, index) => `
    <div class="cycle-item ${index === 0 ? 'current' : ''}">
      <div class="cycle-item-label">${index === 0 ? 'Current Cycle' : `Cycle +${index}`}</div>
      <div class="cycle-item-dates">${formatDateRange(cycle.start, cycle.end)}</div>
      <div class="cycle-item-deadlines">
        <span>Reminder: ${formatDate(cycle.reminderDate)}</span>
        <span>Deadline: ${formatDate(cycle.deadline)}</span>
      </div>
    </div>
  `).join('');
}

function getUpcomingCycles(count) {
  const cycles = [];
  const baseDate = new Date('2024-03-03');
  const today = new Date();
  const daysSinceBase = Math.floor((today - baseDate) / (1000 * 60 * 60 * 24));
  const currentCycleNumber = Math.floor(daysSinceBase / 14);

  for (let i = 0; i < count; i++) {
    const cycleStart = new Date(baseDate);
    cycleStart.setDate(baseDate.getDate() + ((currentCycleNumber + i) * 14));

    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + 13);

    const reminderDate = new Date(cycleEnd);
    reminderDate.setDate(cycleEnd.getDate() - 2);

    const deadline = new Date(cycleEnd);

    cycles.push({
      start: cycleStart,
      end: cycleEnd,
      reminderDate,
      deadline
    });
  }

  return cycles;
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    loadStepProgress();
    renderCycleCalendar();
  });
} else {
  init();
  loadStepProgress();
  renderCycleCalendar();
}

// Expose functions globally
window.copyPrompt = copyPrompt;
window.copyCalPrompt = copyCalPrompt;
window.showTask = showTask;
window.filterTable = filterTable;
window.toggleMobileNav = toggleMobileNav;
window.toggleShortcutsModal = toggleShortcutsModal;
window.triggerConfetti = triggerConfetti;
window.toggleSteps = toggleSteps;
window.saveStepProgress = saveStepProgress;
window.resetPhaseProgress = resetPhaseProgress;
