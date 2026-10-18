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
  initDiagrams();
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
// Tabs Navigation & Hash Deep Linking
// ==========================================
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-tab');
      switchTab(targetId);
    });
  });

  // Deep linking via URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    const targetSection = document.getElementById(hash);
    if (targetSection && targetSection.classList.contains('content-section')) {
      switchTab(hash, false);
    }
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash) {
      const targetSection = document.getElementById(currentHash);
      if (targetSection && targetSection.classList.contains('content-section')) {
        switchTab(currentHash, false);
      }
    } else {
      switchTab('tab-overview', false);
    }
  });
}

function switchTab(targetId, shouldScroll = true) {
  const tabButtons = document.querySelectorAll('.nav-tab-btn');
  const sections = document.querySelectorAll('.content-section');

  let activeBtn = null;
  tabButtons.forEach(btn => {
    if (btn.getAttribute('data-tab') === targetId) {
      btn.classList.add('active');
      activeBtn = btn;
    } else {
      btn.classList.remove('active');
    }
  });

  let activeSection = null;
  sections.forEach(sec => {
    if (sec.id === targetId) {
      sec.classList.add('active');
      activeSection = sec;
    } else {
      sec.classList.remove('active');
    }
  });

  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
  }

  // Update URL hash cleanly
  if (window.location.hash.replace('#', '') !== targetId) {
    if (history.pushState) {
      history.pushState(null, null, '#' + targetId);
    } else {
      window.location.hash = targetId;
    }
  }

  if (shouldScroll && activeSection) {
    const container = document.getElementById('main-content');
    if (container) {
      const topPos = container.getBoundingClientRect().top + window.pageYOffset - 75;
      window.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
    }
  }
}
window.switchTab = switchTab;

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

// ==========================================
// SYSTEM ARCHITECTURE & INTERACTIVE DIAGRAMS
// ==========================================

const ARCH_SPECS = {
  'gsc-inputs': {
    badge: 'Encoder Input Layer',
    title: 'GSC Multi-Dimensional Data Ingestion',
    content: 'Ingests daily time-series from Google Search Console API (searchanalytics.query). Captures up to 16 months of historical data segmented across Dimensions: <code>page</code>, <code>query</code>, <code>device</code>, and <code>country</code>. Extracts core Metrics: <code>clicks</code>, <code>impressions</code>, <code>ctr</code>, and <code>position</code>. Formats raw telemetry into normalized temporal matrix representations for anomaly scanning.'
  },
  'temporal-norm': {
    badge: 'Encoder Normalization',
    title: 'Temporal & Positional Encoding',
    content: 'Eliminates day-of-week seasonality (e.g. B2B weekend traffic troughs) using 7-day and 28-day rolling medians. Cleans noisy anonymized search queries (where impressions fall below privacy thresholds) to avoid false CTR skew. Computes normalized variance windows (&Delta;WoW and &Delta;YoY) to establish baseline volatility bounds.'
  },
  'multihead-anomaly': {
    badge: 'Nx Encoder Attention Stack',
    title: 'Multi-Head Anomaly Attention',
    content: 'Three parallel analytical attention heads process the time series simultaneously:<br><br>' +
      '<strong>Head 1 (Drop Geometry Attention):</strong> Classifies drop geometry (Cliff, Step, Slope, or Wave).<br>' +
      '<strong>Head 2 (URL Cluster Attention):</strong> Computes anomaly blast radius across URL paths (/category/ vs /blog/ vs site-wide).<br>' +
      '<strong>Head 3 (SERP Feature Attention):</strong> Detects CTR collapses occurring while average position remains stable (indicating AI Overview or rich snippet intrusion).'
  },
  'triangulation-layer': {
    badge: 'Nx Encoder Add & Norm',
    title: 'Cross-Data Triangulation Layer',
    content: 'Cross-references Search Console anomalies against orthogonal data systems: GA4 session duration and bounce rates (to eliminate internal tracking bugs), server access logs (HTTP 5xx spikes and Googlebot crawl frequency drops), and the Google Search Status Dashboard API. Falsifies single-source anomalies before root-cause determination.'
  },
  'feedforward-causal': {
    badge: 'Encoder Classification',
    title: 'Root-Cause Decision Heuristic (5-Whys)',
    content: 'Executes deterministic causal logic trees. Synthesizes inputs into mutually exclusive categories: Technical Outage (robots/noindex/5xx), Algorithmic Devaluation (Core Update/Helpful Content), Competitive Deprecation (decayed content/superior rival landing pages), or External Demand Shift (macro seasonality).'
  },
  'latent-diagnosis': {
    badge: 'Encoder Latent Vector Output',
    title: 'Latent Diagnostic Vector',
    content: 'The unified, structured state passed across the bridge to the Solution Decoder. Contains: (1) Confirmed causal classification, (2) Blast radius scope (affected URL clusters and query intents), (3) Diagnostic confidence percentage, and (4) Excluded negative hypotheses with supporting falsification evidence.'
  },
  'prompt-grounding': {
    badge: 'Decoder Prompt Grounding',
    title: 'System Instructions & Technical Guardrails',
    content: 'Constitutional prompt constraints binding LLM reasoning to strict SEO engineering principles: (1) Never recommend disavowing links without confirmed manual action evidence, (2) Never suggest content rewrites when the root cause is a technical crawl failure, (3) Enforce agile product acceptance criteria formatting (Given/When/Then).'
  },
  'masked-solution': {
    badge: 'Nx Decoder Stack',
    title: 'Feasibility & Risk Masking Filter',
    content: 'Masks out unviable, disproportionately expensive, or technically hazardous recommendations. For example, if a drop is isolated to three low-traffic informational pages, high-risk site-wide architecture redesigns are filtered out. Protects engineering backlogs from noisy low-ROI tickets.'
  },
  'cross-attention': {
    badge: 'Nx Decoder Cross-Attention',
    title: 'Diagnostic Context Integration',
    content: 'Connects proposed product solutions directly back to the Latent Diagnostic Vector. Verifies that every generated user story has a verified causal link to an observed Search Console anomaly. Ensures every remediation is evidence-based rather than generic SEO boilerplate.'
  },
  'rice-scoring-layer': {
    badge: 'Nx Decoder Prioritization Stack',
    title: 'RICE Mathematical Optimization',
    content: 'Applies rigorous prioritization: <code>Score = (Reach &times; Impact &times; Confidence) &divide; Effort</code>. Automatically calculates Reach from affected GSC impressions and estimates Effort from engineering sprint benchmarks, sorting output into Quick Wins, Strategic Bets, Fill-Ins, and Time Sinks.'
  },
  'linear-output': {
    badge: 'Decoder Delivery Layer',
    title: 'Structured Output Serializer',
    content: 'Serializes prioritized initiatives into engineering-ready schemas: Jira Epics, User Stories, and PRDs with clear Given/When/Then acceptance criteria, Definition of Done, analytics instrumentation requirements, and regression monitoring telemetry.'
  },
  'final-deliverable': {
    badge: 'Decoder Execution Output',
    title: 'Validated Action Plan & Backtest Verification',
    content: 'Generates the final executive summary, developer tickets, and backtesting verification protocol. Compares recommended fixes against historical model baselines to verify expected traffic recovery trajectories.'
  }
};

function inspectArchBlock(blockId) {
  const spec = ARCH_SPECS[blockId];
  const drawer = document.getElementById('arch-inspector-drawer');
  const badge = document.getElementById('drawer-badge');
  const title = document.getElementById('drawer-title');
  const content = document.getElementById('drawer-content');

  if (!spec || !drawer || !badge || !title || !content) return;

  badge.textContent = spec.badge;
  title.textContent = spec.title;
  content.innerHTML = spec.content;
  drawer.style.display = 'block';

  // Highlight active block
  document.querySelectorAll('.arch-block-item').forEach(el => el.classList.remove('active-node'));
  const clicked = event ? event.currentTarget : null;
  if (clicked && clicked.classList) {
    clicked.classList.add('active-node');
  }

  drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeArchInspector() {
  const drawer = document.getElementById('arch-inspector-drawer');
  if (drawer) drawer.style.display = 'none';
  document.querySelectorAll('.arch-block-item').forEach(el => el.classList.remove('active-node'));
}

// Curve Simulator Data & Logic
const CURVE_CONFIGS = {
  cliff: {
    path: 'M 50 40 L 310 40 L 325 160 L 570 160',
    color: '#dc2626',
    markerX: 310,
    markerText: 'Technical Outage (Day 14)',
    severity: 'Severity: Critical (>50% Collapse in 24-48 Hours)',
    severityColor: '#dc2626',
    title: 'The Cliff: Sudden Precipitous Drop',
    summary: 'Traffic falls vertically within 24 to 48 hours. This shape almost never represents content staleness or gradual competitor improvements. It represents a binary technical failure or severe manual penalty.',
    checklist: [
      '<strong>Primary Hypotheses:</strong> Accidental site-wide <code>noindex</code> tag injection, robots.txt disallow rule blocking Googlebot, DNS/Hosting resolution failure, or server 5xx outage.',
      '<strong>Search Console Action:</strong> Immediately inspect URL Inspection tool for live URL response. Check Security & Manual Actions tab. Check Crawl Stats report for server connectivity drops.',
      '<strong>PM Triage Protocol:</strong> File a P0 critical incident ticket. Alert DevOps and Engineering immediately. Do NOT touch content or keywords until technical crawlability is confirmed.'
    ]
  },
  step: {
    path: 'M 50 50 L 310 50 L 330 115 L 570 115',
    color: '#ea580c',
    markerX: 310,
    markerText: 'Core Update / AI Overview (Day 14)',
    severity: 'Severity: High (20% - 40% Step-Function Drop)',
    severityColor: '#ea580c',
    title: 'The Step: Algorithmic Shift or SERP Feature Displacement',
    summary: 'Traffic drops sharply over 3 to 7 days, then stabilizes at a new, lower plateau. This classic step pattern indicates either an organic ranking devaluation (Core Algorithm Update) or a SERP layout change (e.g. AI Overviews capturing informational clicks).',
    checklist: [
      '<strong>Primary Hypotheses:</strong> Google Core Algorithm Update devaluation, Helpful Content System adjustment, or AI Overviews pushing organic #1 down below the fold.',
      '<strong>Search Console Action:</strong> Segment GSC by Query: Did impressions stay flat while CTR dropped? (SERP feature displacement). Or did average position drop from 2.1 to 8.4? (Algorithmic devaluation).',
      '<strong>PM Triage Protocol:</strong> Do not panic-revert code. Conduct competitor gap analysis. Size the revenue impact before prioritizing content restructuring in the next sprint cycle.'
    ]
  },
  slope: {
    path: 'M 50 45 L 200 55 L 350 100 L 570 155',
    color: '#d97706',
    markerX: 200,
    markerText: 'Content Decay & Competitor Growth',
    severity: 'Severity: Medium (Gradual Erosion over 3-6 Months)',
    severityColor: '#d97706',
    title: 'The Slope: Gradual Long-Term Decay',
    summary: 'A steady, continuous downward drift over weeks or months. This is never an accidental robots.txt block. It reflects content freshness decay, technical debt accumulation (slower Core Web Vitals), or aggressive competitor content investment.',
    checklist: [
      '<strong>Primary Hypotheses:</strong> Competitors publishing superior, comprehensive resources; search intent evolving past current content; obsolete statistics and broken outbound references.',
      '<strong>Search Console Action:</strong> Compare 6-month period vs. previous 6 months. Identify queries that drifted from positions 1-3 into positions 5-9. Identify declining CTR across informational queries.',
      '<strong>PM Triage Protocol:</strong> Run RICE prioritization on content refreshes vs. new feature development. Schedule systematic content optimization sprints.'
    ]
  },
  wave: {
    path: 'M 50 140 Q 115 40 180 140 T 310 140 T 440 140 T 570 140',
    color: '#2563eb',
    markerX: 180,
    markerText: 'Predictable Cyclical Seasonality',
    severity: 'Severity: Low / Expected (Seasonal Variance)',
    severityColor: '#2563eb',
    title: 'The Wave: Predictable Cyclical Fluctuation',
    summary: 'Regular, repeating peaks and troughs matching calendar cycles: weekends vs. weekdays (B2B vs B2C), holiday shutdowns, school semesters, or summer vacations.',
    checklist: [
      '<strong>Primary Hypotheses:</strong> Demand fluctuations in external human search behavior; holiday seasonality (e.g. Black Friday spikes or Q4 enterprise budget freezes).',
      '<strong>Search Console Action:</strong> Compare Year-over-Year (YoY: 28 days vs. same 28 days last year). If YoY growth is flat or positive, the WoW decline is purely seasonal and represents zero product failure.',
      '<strong>PM Triage Protocol:</strong> No engineering intervention required. Document seasonality baseline in product analytics so executive stakeholders avoid false alarms.'
    ]
  }
};

function selectCurve(curveType) {
  const cfg = CURVE_CONFIGS[curveType];
  if (!cfg) return;

  ['cliff', 'step', 'slope', 'wave'].forEach(t => {
    const btn = document.getElementById(`btn-curve-${t}`);
    if (btn) btn.classList.toggle('active', t === curveType);
  });

  const pathEl = document.getElementById('curve-path');
  if (pathEl) {
    pathEl.setAttribute('d', cfg.path);
    pathEl.setAttribute('stroke', cfg.color);
  }

  const eventLine = document.getElementById('curve-event-line');
  const eventText = document.getElementById('curve-event-text');
  if (eventLine) {
    eventLine.setAttribute('x1', cfg.markerX);
    eventLine.setAttribute('x2', cfg.markerX);
  }
  if (eventText) {
    eventText.setAttribute('x', cfg.markerX + 5);
    eventText.textContent = cfg.markerText;
  }

  const sevEl = document.getElementById('curve-severity');
  if (sevEl) {
    sevEl.textContent = cfg.severity;
    sevEl.style.color = cfg.severityColor;
  }

  const titleEl = document.getElementById('curve-title');
  if (titleEl) titleEl.textContent = cfg.title;

  const sumEl = document.getElementById('curve-summary');
  if (sumEl) sumEl.textContent = cfg.summary;

  const clEl = document.getElementById('curve-checklist');
  if (clEl) {
    clEl.innerHTML = cfg.checklist.map(item => `<div>${item}</div>`).join('');
  }
}

// Live RICE Calculator & 2x2 Matrix
function calculateRice() {
  const reachEl = document.getElementById('rice-reach');
  const impactEl = document.getElementById('rice-impact');
  const confEl = document.getElementById('rice-confidence');
  const effortEl = document.getElementById('rice-effort');

  if (!reachEl || !impactEl || !confEl || !effortEl) return;

  const reach = parseFloat(reachEl.value) || 0;
  const impact = parseFloat(impactEl.value) || 1;
  const conf = parseFloat(confEl.value) || 50;
  const effort = parseFloat(effortEl.value) || 1;

  const score = Math.round((reach * impact * (conf / 100)) / effort);

  const dispReach = document.getElementById('disp-reach');
  if (dispReach) dispReach.textContent = reach.toLocaleString();

  const dispImpact = document.getElementById('disp-impact');
  if (dispImpact) {
    let label = 'Medium';
    if (impact <= 0.25) label = 'Minimal';
    else if (impact <= 0.5) label = 'Low';
    else if (impact <= 1.0) label = 'Medium';
    else if (impact <= 2.0) label = 'High';
    else label = 'Massive';
    dispImpact.textContent = `${impact.toFixed(2)} (${label})`;
  }

  const dispConf = document.getElementById('disp-confidence');
  if (dispConf) dispConf.textContent = `${conf}%`;

  const dispEffort = document.getElementById('disp-effort');
  if (dispEffort) dispEffort.textContent = `${effort.toFixed(1)} weeks`;

  const dispScore = document.getElementById('disp-rice-score');
  if (dispScore) dispScore.textContent = score.toLocaleString();

  // Position on 2x2 matrix
  // Effort: 0.5 to 12 person-weeks -> X axis (10% to 90%)
  const xNorm = Math.min(Math.max((effort - 0.5) / (12 - 0.5), 0), 1);
  const leftPct = (xNorm * 76 + 12).toFixed(1);

  // Impact: 0.25 to 3.0 -> Y axis (invert: high impact at top, 12% to 88%)
  const yNorm = Math.min(Math.max((impact - 0.25) / (3.0 - 0.25), 0), 1);
  const topPct = ((1 - yNorm) * 74 + 13).toFixed(1);

  const pin = document.getElementById('matrix-pin');
  if (pin) {
    pin.style.left = `${leftPct}%`;
    pin.style.top = `${topPct}%`;
  }

  // Quadrant classification
  const badge = document.getElementById('disp-quadrant-badge');
  const action = document.getElementById('disp-priority-action');

  if (impact >= 1.5 && effort <= 4.0) {
    if (badge) { badge.textContent = 'Quick Win'; badge.className = 'badge badge-mint'; }
    if (action) action.textContent = 'Highest Priority - Immediate Sprint Candidate';
  } else if (impact >= 1.5 && effort > 4.0) {
    if (badge) { badge.textContent = 'Strategic Bet'; badge.className = 'badge badge-outline'; }
    if (action) action.textContent = 'Core Roadmap - Requires Phased Spike & Discovery';
  } else if (impact < 1.5 && effort <= 4.0) {
    if (badge) { badge.textContent = 'Fill-In'; badge.className = 'badge badge-outline'; }
    if (action) action.textContent = 'Low Leverage - Address during cooldown sprints';
  } else {
    if (badge) { badge.textContent = 'Time Sink'; badge.className = 'badge badge-alert'; }
    if (action) action.textContent = 'Deprioritize / Reject - High effort with low ROI';
  }
}

function loadRicePreset(type) {
  const reachEl = document.getElementById('rice-reach');
  const impactEl = document.getElementById('rice-impact');
  const confEl = document.getElementById('rice-confidence');
  const effortEl = document.getElementById('rice-effort');
  const pinLabel = document.getElementById('pin-label');

  if (!reachEl || !impactEl || !confEl || !effortEl) return;

  if (type === 'canonical') {
    reachEl.value = 45000;
    impactEl.value = 2.0;
    confEl.value = 90;
    effortEl.value = 1.0;
    if (pinLabel) pinLabel.textContent = 'Fix Canonical Loops';
  } else if (type === 'ai-assistant') {
    reachEl.value = 85000;
    impactEl.value = 3.0;
    confEl.value = 80;
    effortEl.value = 5.0;
    if (pinLabel) pinLabel.textContent = 'AI Diagnostic MVP';
  } else if (type === 'dark-mode') {
    reachEl.value = 12000;
    impactEl.value = 0.5;
    confEl.value = 80;
    effortEl.value = 1.5;
    if (pinLabel) pinLabel.textContent = 'Dark Mode Theme';
  } else if (type === 'full-crawler') {
    reachEl.value = 25000;
    impactEl.value = 0.5;
    confEl.value = 40;
    effortEl.value = 11.0;
    if (pinLabel) pinLabel.textContent = 'Custom Crawler';
  }

  calculateRice();
}

// Root-Cause Decision Tree Logic
const treeState = {
  scope: 'site',
  signal: 'impr-drop'
};

function advanceTree(stepNum, choice) {
  if (stepNum === 1) {
    treeState.scope = choice;
    const btnA = document.getElementById('tree-s1-a');
    const btnB = document.getElementById('tree-s1-b');
    if (btnA) btnA.classList.toggle('active', choice === 'site');
    if (btnB) btnB.classList.toggle('active', choice === 'folder');

    const desc = document.getElementById('tree-step2-desc');
    if (desc) {
      if (choice === 'site') {
        desc.textContent = 'Scope: Site-wide. Did impressions drop globally across all URLs, or did impressions stay flat while CTR collapsed?';
      } else {
        desc.textContent = 'Scope: Directory-Isolated. Did impressions collapse specifically within this URL path, or is CTR underperforming competitor snippets?';
      }
    }
  } else if (stepNum === 2) {
    treeState.signal = choice;
    const btnA = document.getElementById('tree-s2-a');
    const btnB = document.getElementById('tree-s2-b');
    if (btnA) btnA.classList.toggle('active', choice === 'impr-drop');
    if (btnB) btnB.classList.toggle('active', choice === 'ctr-drop');
  }

  renderTreeDiagnosis();
}

function renderTreeDiagnosis() {
  const title = document.getElementById('tree-diagnosis-title');
  const body = document.getElementById('tree-diagnosis-body');
  const action = document.getElementById('tree-action-plan');

  if (!title || !body || !action) return;

  const key = `${treeState.scope}_${treeState.signal}`;

  const treeOutcomes = {
    'site_impr-drop': {
      title: 'Algorithmic Relevance Devaluation or Global Crawl Block',
      body: '<strong>Synthesized Root Cause:</strong> A site-wide drop in impressions accompanied by average position degradation indicates a Google Core Algorithm Update or a global indexing disruption.',
      action: '<strong>Recommended Action:</strong> Cross-reference with the Google Search Status Dashboard. Audit thin content quality, E-E-A-T signals, and review recent site-wide template changes.'
    },
    'site_ctr-drop': {
      title: 'Universal SERP Layout Shift (AI Overviews / Rich Feature Intrusion)',
      body: '<strong>Synthesized Root Cause:</strong> Impressions and positions remained stable across the entire site, but CTR collapsed. This proves users are still seeing your site, but SERP features (such as AI Overviews or expanded ad blocks) are siphoning off clicks.',
      action: '<strong>Recommended Action:</strong> Conduct SERP feature intent analysis. Optimize for inclusion in AI Overview citations, structured markup, and re-engineer page titles to answer secondary queries.'
    },
    'folder_impr-drop': {
      title: 'Directory-Isolated Technical Issue or Canonical Regression',
      body: '<strong>Synthesized Root Cause:</strong> The anomaly is strictly contained within a specific subfolder (e.g., /products/ or /blog/). Impressions dropped while the rest of the domain is thriving. This points to a directory-level template error, faceted navigation loop, or mistaken canonical/robots tag.',
      action: '<strong>Recommended Action:</strong> Run a Screaming Frog crawl restricted to that subfolder. Inspect the last release diff in GitHub for directory routing or layout template changes.'
    },
    'folder_ctr-drop': {
      title: 'Local Competitor Outranking or Snippet Degradation in Directory',
      body: '<strong>Synthesized Root Cause:</strong> Directory impressions are healthy, but clicks fell. Competitors have likely optimized title tags, gained rich review snippets, or targeted key category keywords with higher-intent landing pages.',
      action: '<strong>Recommended Action:</strong> Run an A/B title tag test on the top 20 traffic-driving URLs in this directory using SEO split-testing methodologies.'
    }
  };

  const outcome = treeOutcomes[key];
  if (outcome) {
    title.textContent = outcome.title;
    body.innerHTML = outcome.body;
    action.innerHTML = outcome.action;
  }
}

function initDiagrams() {
  selectCurve('cliff');
  calculateRice();
  advanceTree(1, 'site');
}

// Expose functions globally for inline HTML event handlers
window.inspectArchBlock = inspectArchBlock;
window.closeArchInspector = closeArchInspector;
window.selectCurve = selectCurve;
window.calculateRice = calculateRice;
window.loadRicePreset = loadRicePreset;
window.advanceTree = advanceTree;

