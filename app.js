// ==========================================
// SEO to Product Management Interactive App
// Safe LocalStorage Fallback & State Management
// ==========================================

const STORAGE_KEY_PREFIX = 'seo_pm_mastery_';

// In-Memory Storage Fallback if localStorage is restricted
const memoryStorage = {};
let isLocalStorageAvailable = true;

try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  isLocalStorageAvailable = false;
  console.warn('localStorage is unavailable. Falling back to in-memory state.', e);
}

function safeGetItem(key) {
  try {
    if (isLocalStorageAvailable) {
      return window.localStorage.getItem(STORAGE_KEY_PREFIX + key);
    }
    return memoryStorage[key] || null;
  } catch (e) {
    return memoryStorage[key] || null;
  }
}

function safeSetItem(key, value) {
  try {
    if (isLocalStorageAvailable) {
      window.localStorage.setItem(STORAGE_KEY_PREFIX + key, value);
    }
    memoryStorage[key] = value;
  } catch (e) {
    memoryStorage[key] = value;
  }
}

function safeRemoveItem(key) {
  try {
    if (isLocalStorageAvailable) {
      window.localStorage.removeItem(STORAGE_KEY_PREFIX + key);
    }
    delete memoryStorage[key];
  } catch (e) {
    delete memoryStorage[key];
  }
}

// Global State
let learningLogEntries = [];
const TOTAL_WEEKS = 12;
const TASKS_PER_WEEK = 4;
const TOTAL_TASKS = TOTAL_WEEKS * TASKS_PER_WEEK; // 48
const TOTAL_ARTIFACTS = 12;

// ==========================================
// Initialization on DOM Ready
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initStorageIndicator();
  initTabs();
  initAccordions();
  initCheckboxes();
  initArtifacts();
  initNotes();
  initLearningLog();
  initActionButtons();
  updateAllMetrics();
  filterResources();
});

function initStorageIndicator() {
  const indicator = document.getElementById('storage-status-indicator');
  if (indicator) {
    if (isLocalStorageAvailable) {
      indicator.innerHTML = '<span style="color:#15803d; font-weight: bold;">[Active]</span> Browser Storage Active';
      indicator.style.color = '#15803d';
    } else {
      indicator.innerHTML = '<span style="color:#b45309; font-weight: bold;">[Session]</span> Session Mode (Storage Blocked)';
      indicator.style.color = '#b45309';
    }
  }
}

// ==========================================
// Tabs Navigation
// ==========================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const sections = document.querySelectorAll('.content-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

// ==========================================
// Accordions (Expand / Collapse)
// ==========================================
function initAccordions() {
  // Setup accordion toggle helpers
}

function toggleAccordion(id) {
  const acc = document.getElementById(id);
  if (!acc) return;
  const header = acc.querySelector('.accordion-header');
  const body = acc.querySelector('.accordion-body');
  if (header && body) {
    header.classList.toggle('open');
    body.classList.toggle('open');
  }
}

function expandAllAccordions() {
  document.querySelectorAll('.accordion-header').forEach(h => h.classList.add('open'));
  document.querySelectorAll('.accordion-body').forEach(b => b.classList.add('open'));
}

function collapseAllAccordions() {
  document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'));
  document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
}

// ==========================================
// Interactive Task Checkboxes & Progress
// ==========================================
function initCheckboxes() {
  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    for (let t = 1; t <= TASKS_PER_WEEK; t++) {
      const taskId = `w${w}-${t}`;
      const savedState = safeGetItem(`task_${taskId}`);
      const itemEl = document.getElementById(`item-${taskId}`);
      if (itemEl) {
        const checkbox = itemEl.querySelector('input[type="checkbox"]');
        if (checkbox) {
          if (savedState === 'true') {
            checkbox.checked = true;
            itemEl.classList.add('completed');
          } else {
            checkbox.checked = false;
            itemEl.classList.remove('completed');
          }
        }
      }
    }
    updateWeekBadge(`week-${w}`);
  }
}

function toggleTask(taskId, weekId) {
  const itemEl = document.getElementById(`item-${taskId}`);
  if (!itemEl) return;
  const checkbox = itemEl.querySelector('input[type="checkbox"]');
  if (!checkbox) return;

  if (checkbox.checked) {
    itemEl.classList.add('completed');
    safeSetItem(`task_${taskId}`, 'true');
  } else {
    itemEl.classList.remove('completed');
    safeSetItem(`task_${taskId}`, 'false');
  }

  updateWeekBadge(weekId);
  updateAllMetrics();
}

function updateWeekBadge(weekId) {
  const weekEl = document.getElementById(weekId);
  if (!weekEl) return;
  const checkboxes = weekEl.querySelectorAll('.check-item input[type="checkbox"]');
  let checkedCount = 0;
  checkboxes.forEach(cb => {
    if (cb.checked) checkedCount++;
  });

  const weekNum = weekId.replace('week-', '');
  const badge = document.getElementById(`badge-week-${weekNum}`);
  if (badge) {
    badge.textContent = `${checkedCount}/${checkboxes.length} Done`;
    if (checkedCount === checkboxes.length) {
      badge.className = 'badge badge-mint';
    } else {
      badge.className = 'badge badge-outline';
    }
  }
}

// ==========================================
// Capstone Artifacts Checkboxes
// ==========================================
function initArtifacts() {
  for (let a = 1; a <= TOTAL_ARTIFACTS; a++) {
    const artId = `art-${a}`;
    const savedState = safeGetItem(`artifact_${artId}`);
    const itemEl = document.getElementById(`item-${artId}`);
    if (itemEl) {
      const checkbox = itemEl.querySelector('input[type="checkbox"]');
      if (checkbox) {
        if (savedState === 'true') {
          checkbox.checked = true;
          itemEl.classList.add('completed');
        } else {
          checkbox.checked = false;
          itemEl.classList.remove('completed');
        }
      }
    }
  }
  updateArtifactMetrics();
}

function toggleArtifact(artId) {
  const itemEl = document.getElementById(`item-${artId}`);
  if (!itemEl) return;
  const checkbox = itemEl.querySelector('input[type="checkbox"]');
  if (!checkbox) return;

  if (checkbox.checked) {
    itemEl.classList.add('completed');
    safeSetItem(`artifact_${artId}`, 'true');
  } else {
    itemEl.classList.remove('completed');
    safeSetItem(`artifact_${artId}`, 'false');
  }

  updateArtifactMetrics();
}

function updateArtifactMetrics() {
  let completedCount = 0;
  for (let a = 1; a <= TOTAL_ARTIFACTS; a++) {
    const itemEl = document.getElementById(`item-art-${a}`);
    if (itemEl) {
      const cb = itemEl.querySelector('input[type="checkbox"]');
      if (cb && cb.checked) completedCount++;
    }
  }

  const countDisplay = document.getElementById('artifacts-completed-count');
  const fillBar = document.getElementById('artifacts-progress-fill');
  const statusDisplay = document.getElementById('capstone-checklist-status');

  if (countDisplay) countDisplay.textContent = `${completedCount} / ${TOTAL_ARTIFACTS}`;
  if (fillBar) {
    const pct = Math.round((completedCount / TOTAL_ARTIFACTS) * 100);
    fillBar.style.width = `${pct}%`;
  }
  if (statusDisplay) {
    statusDisplay.textContent = `${completedCount} of ${TOTAL_ARTIFACTS} Artifacts Completed`;
  }
}

// ==========================================
// Global Metrics Calculation
// ==========================================
function updateAllMetrics() {
  let totalChecked = 0;
  const allCheckboxes = document.querySelectorAll('.checklist-group .check-item input[type="checkbox"]');
  allCheckboxes.forEach(cb => {
    if (cb.checked) totalChecked++;
  });

  const percentage = Math.round((totalChecked / TOTAL_TASKS) * 100);

  // Update Global Header Cards
  const percentEl = document.getElementById('global-progress-percent');
  const fillEl = document.getElementById('global-progress-fill');
  const ratioEl = document.getElementById('global-progress-ratio');

  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (fillEl) fillEl.style.width = `${percentage}%`;
  if (ratioEl) ratioEl.textContent = `${totalChecked} of ${TOTAL_TASKS} Tasks Completed`;

  // Update Nav Mini Pill
  const navText = document.getElementById('nav-progress-text');
  const navBar = document.getElementById('nav-progress-bar');
  if (navText) navText.textContent = `${percentage}% Done`;
  if (navBar) navBar.style.width = `${percentage}%`;

  // Update Phase Indicator
  const phaseDisplay = document.getElementById('current-phase-display');
  if (phaseDisplay) {
    if (totalChecked < 12) {
      phaseDisplay.textContent = 'Phase 1: Discovery';
    } else if (totalChecked < 24) {
      phaseDisplay.textContent = 'Phase 2: Strategy';
    } else if (totalChecked < 36) {
      phaseDisplay.textContent = 'Phase 3: UX & Tests';
    } else if (totalChecked < 48) {
      phaseDisplay.textContent = 'Phase 4: Capstone';
    } else {
      phaseDisplay.textContent = '100% Certified!';
    }
  }
}

// ==========================================
// Phase Notes Management
// ==========================================
function initNotes() {
  for (let p = 1; p <= 4; p++) {
    const textarea = document.getElementById(`notes-phase-${p}`);
    if (textarea) {
      const savedNote = safeGetItem(`notes_phase_${p}`);
      if (savedNote) {
        textarea.value = savedNote;
      }
    }
  }
}

function savePhaseNotes(phaseNum) {
  const textarea = document.getElementById(`notes-phase-${phaseNum}`);
  const status = document.getElementById(`save-status-${phaseNum}`);
  if (textarea) {
    safeSetItem(`notes_phase_${phaseNum}`, textarea.value);
    if (status) {
      status.textContent = 'Saved just now ✓';
      status.style.color = '#15803d';
      setTimeout(() => {
        status.textContent = 'Auto-saved locally';
        status.style.color = 'var(--text-light)';
      }, 2500);
    }
  }
}

// ==========================================
// Learning Log Management
// ==========================================
function initLearningLog() {
  // Set default date to today
  const dateInput = document.getElementById('log-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  const savedLog = safeGetItem('learning_log');
  if (savedLog) {
    try {
      learningLogEntries = JSON.parse(savedLog);
    } catch (e) {
      learningLogEntries = [];
    }
  }
  renderLearningLog();
}

function addLearningLogEntry() {
  const dateEl = document.getElementById('log-date');
  const skillEl = document.getElementById('log-skill');
  const hoursEl = document.getElementById('log-hours');
  const insightEl = document.getElementById('log-insight');

  if (!dateEl || !skillEl || !hoursEl || !insightEl) return;

  const hours = parseFloat(hoursEl.value);
  if (isNaN(hours) || hours <= 0) {
    alert('Please enter a valid study duration in hours (e.g. 1.5).');
    hoursEl.focus();
    return;
  }

  const insight = insightEl.value.trim();
  if (!insight) {
    alert('Please enter a brief practical takeaway or key insight from your session.');
    insightEl.focus();
    return;
  }

  const newEntry = {
    id: Date.now(),
    date: dateEl.value || new Date().toISOString().split('T')[0],
    skill: skillEl.value,
    hours: hours,
    insight: insight
  };

  learningLogEntries.unshift(newEntry);
  safeSetItem('learning_log', JSON.stringify(learningLogEntries));

  // Reset inputs
  hoursEl.value = '';
  insightEl.value = '';

  renderLearningLog();
}

function deleteLearningLogEntry(id) {
  learningLogEntries = learningLogEntries.filter(entry => entry.id !== id);
  safeSetItem('learning_log', JSON.stringify(learningLogEntries));
  renderLearningLog();
}

function renderLearningLog() {
  const tbody = document.getElementById('log-table-body');
  const summaryEl = document.getElementById('log-total-summary');
  const globalHoursEl = document.getElementById('hours-logged-display');
  const hoursFillEl = document.getElementById('hours-progress-fill');

  if (!tbody) return;

  let totalHours = 0;
  learningLogEntries.forEach(entry => {
    totalHours += entry.hours;
  });

  if (summaryEl) {
    summaryEl.textContent = `${learningLogEntries.length} Sessions Logged (${totalHours.toFixed(1)} Hours)`;
  }
  if (globalHoursEl) {
    globalHoursEl.textContent = `${totalHours.toFixed(1)} hrs`;
  }
  if (hoursFillEl) {
    const targetHours = 72; // ~6 hrs x 12 weeks
    const pct = Math.min(100, Math.round((totalHours / targetHours) * 100));
    hoursFillEl.style.width = `${pct}%`;
  }

  if (learningLogEntries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-light); padding: 24px;">No study sessions logged yet. Record your first lab above!</td></tr>`;
    return;
  }

  tbody.innerHTML = learningLogEntries.map(entry => `
    <tr>
      <td style="font-weight: 600; white-space: nowrap;">${entry.date}</td>
      <td style="color: var(--primary-deep); font-weight: 600;">${entry.skill}</td>
      <td><strong>${entry.hours.toFixed(2)}h</strong></td>
      <td style="font-size: 0.84rem; line-height: 1.45;">${escapeHtml(entry.insight)}</td>
      <td style="text-align: center;">
        <button class="btn btn-danger-outline btn-sm" onclick="deleteLearningLogEntry(${entry.id})" title="Delete entry">Delete</button>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}

// ==========================================
// Resource Library Filtering & Search
// ==========================================
function filterResources() {
  const searchInput = document.getElementById('res-search');
  const skillSelect = document.getElementById('filter-skill');
  const typeSelect = document.getElementById('filter-type');
  const diffSelect = document.getElementById('filter-difficulty');
  const counterEl = document.getElementById('res-counter-display');

  if (!searchInput || !skillSelect || !typeSelect || !diffSelect) return;

  const query = searchInput.value.toLowerCase().trim();
  const selectedSkill = skillSelect.value;
  const selectedType = typeSelect.value;
  const selectedDiff = diffSelect.value;

  const cards = document.querySelectorAll('#resource-container .res-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardSkill = card.getAttribute('data-skill') || '';
    const cardType = card.getAttribute('data-type') || '';
    const cardDiff = card.getAttribute('data-diff') || '';
    const cardSearch = (card.getAttribute('data-search') || '') + ' ' + card.innerText.toLowerCase();

    const matchesSkill = (selectedSkill === 'all' || cardSkill === selectedSkill);
    const matchesType = (selectedType === 'all' || cardType === selectedType);
    const matchesDiff = (selectedDiff === 'all' || cardDiff === selectedDiff);
    const matchesQuery = (!query || cardSearch.includes(query));

    if (matchesSkill && matchesType && matchesDiff && matchesQuery) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  if (counterEl) {
    counterEl.textContent = `Showing ${visibleCount} of ${cards.length} Verified Resources`;
  }
}

// ==========================================
// Glossary Real-Time Search
// ==========================================
function filterGlossary() {
  const searchInput = document.getElementById('glossary-search');
  if (!searchInput) return;

  const query = searchInput.value.toLowerCase().trim();
  const items = document.querySelectorAll('#glossary-list .glossary-item');

  items.forEach(item => {
    const text = (item.getAttribute('data-term') || '') + ' ' + item.innerText.toLowerCase();
    if (!query || text.includes(query)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// ==========================================
// Action Buttons & Reset Modal
// ==========================================
function initActionButtons() {
  const expandBtn = document.getElementById('btn-expand-all');
  if (expandBtn) expandBtn.addEventListener('click', expandAllAccordions);

  const collapseBtn = document.getElementById('btn-collapse-all');
  if (collapseBtn) collapseBtn.addEventListener('click', collapseAllAccordions);

  const printBtn = document.getElementById('btn-print-view');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) exportBtn.addEventListener('click', exportDataBackup);

  const resetBtn = document.getElementById('btn-reset-modal');
  if (resetBtn) resetBtn.addEventListener('click', openResetModal);
}

function openResetModal() {
  const modal = document.getElementById('reset-modal');
  if (modal) modal.classList.add('open');
}

function closeResetModal() {
  const modal = document.getElementById('reset-modal');
  if (modal) modal.classList.remove('open');
}

function confirmResetProgress() {
  // Clear all localStorage keys with our prefix
  try {
    if (isLocalStorageAvailable) {
      Object.keys(window.localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          window.localStorage.removeItem(key);
        }
      });
    }
  } catch (e) {
    console.error(e);
  }

  // Clear memory storage
  Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
  learningLogEntries = [];

  // Reset checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
  });
  document.querySelectorAll('.check-item').forEach(item => {
    item.classList.remove('completed');
  });

  // Reset textareas
  for (let p = 1; p <= 4; p++) {
    const ta = document.getElementById(`notes-phase-${p}`);
    if (ta) ta.value = '';
  }

  // Re-render
  closeResetModal();
  initCheckboxes();
  initArtifacts();
  renderLearningLog();
  updateAllMetrics();
  alert('All roadmap progress, notes, and study logs have been safely reset.');
}

function exportDataBackup() {
  const backup = {
    exportedAt: new Date().toISOString(),
    learningLog: learningLogEntries,
    phaseNotes: {
      phase1: safeGetItem('notes_phase_1') || '',
      phase2: safeGetItem('notes_phase_2') || '',
      phase3: safeGetItem('notes_phase_3') || '',
      phase4: safeGetItem('notes_phase_4') || ''
    },
    tasks: {},
    artifacts: {}
  };

  for (let w = 1; w <= TOTAL_WEEKS; w++) {
    for (let t = 1; t <= TASKS_PER_WEEK; t++) {
      const taskId = `w${w}-${t}`;
      backup.tasks[taskId] = safeGetItem(`task_${taskId}`) === 'true';
    }
  }

  for (let a = 1; a <= TOTAL_ARTIFACTS; a++) {
    const artId = `art-${a}`;
    backup.artifacts[artId] = safeGetItem(`artifact_${artId}`) === 'true';
  }

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `seo_pm_roadmap_progress_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
