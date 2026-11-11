// ARE (Autonomous Restrictor Engine) - Cozy 3-Day Bento Studio Controller

let selectedFocusDuration = 45;
let allRulesCache = [];
let vaultSearchQuery = "";
let vaultCategoryFilter = "all";

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  loadBentoData();
  setupBentoForm();
  setupBentoPresets();
  setupFocusShield();
  setupStrictModeAndReset();
  setupAuditLogsClear();
  setupVaultFilters();
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

// Live Clock & Curfew Evaluator
function initClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const clockElem = document.getElementById('liveClock');
    if (clockElem) clockElem.textContent = `${h}:${m}:${s}`;

    // Curfew state indicator (default 21:00 to 07:00)
    const currentHour = now.getHours();
    const curfewState = document.getElementById('curfewActiveState');
    const systemStatusPill = document.getElementById('systemStatusPill');

    if (currentHour >= 21 || currentHour < 7) {
      if (curfewState) {
        curfewState.textContent = "Active Now • Curfew Enforcing";
        curfewState.style.color = "var(--amber-honey)";
      }
      if (systemStatusPill) {
        systemStatusPill.textContent = "CURFEW ACTIVE";
        systemStatusPill.style.color = "var(--amber-honey)";
        systemStatusPill.style.borderColor = "var(--amber-border)";
        systemStatusPill.style.background = "var(--amber-light)";
      }
    } else {
      if (curfewState) {
        curfewState.textContent = "Armed • Curfew begins at 21:00";
        curfewState.style.color = "var(--sage-green)";
      }
      if (systemStatusPill) {
        systemStatusPill.textContent = "PROTOCOL ARMED";
        systemStatusPill.style.color = "var(--sage-green)";
        systemStatusPill.style.borderColor = "var(--sage-border)";
        systemStatusPill.style.background = "var(--sage-light)";
      }
    }
  }
  tick();
  setInterval(tick, 1000);
}

function formatLockRemaining(ms) {
  if (ms <= 0) return "Milestone completed • Check-in pending";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days}d ${remHours}h remaining`;
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

// Data Loader
function loadBentoData() {
  chrome.runtime.sendMessage({ action: "GET_STATE" }, (res) => {
    if (!res || !res.state) return;
    const { rules, stats, strictMode, focusLock, reflectionLogs } = res.state;

    // Metrics
    const st = stats || { totalBlocked: 0, todayBlocked: 0 };
    document.getElementById('bentoTodayBlocked').textContent = st.todayBlocked || 0;
    document.getElementById('bentoTotalBlocked').textContent = st.totalBlocked || 0;

    const rList = rules || [];
    allRulesCache = rList;
    const activeRules = rList.filter(r => r.enabled);
    document.getElementById('bentoActiveCount').textContent = activeRules.length;
    document.getElementById('vaultCount').textContent = `[${rList.length} RULES LOADED]`;

    // Strict Mode
    const strictToggle = document.getElementById('strictModeToggle');
    if (strictToggle) strictToggle.checked = !!strictMode;

    // Focus Lock View
    renderFocusShieldView(focusLock);

    // Rules Vault Bento Grid
    renderRulesBentoGrid(rList);

    // Reflection Audit Logs View
    renderAuditLogs(reflectionLogs || []);
  });
}

function setupVaultFilters() {
  const searchInput = document.getElementById('vaultSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      vaultSearchQuery = e.target.value.toLowerCase().trim();
      renderRulesBentoGrid(allRulesCache);
    });
  }

  document.querySelectorAll('#vaultCategoryFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#vaultCategoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      vaultCategoryFilter = chip.getAttribute('data-cat') || 'all';
      renderRulesBentoGrid(allRulesCache);
    });
  });
}

function renderFocusShieldView(focusLock) {
  const inactive = document.getElementById('focusInactiveState');
  const active = document.getElementById('focusActiveState');
  const countdownVal = document.getElementById('focusCountdownVal');

  const nowMs = Date.now();
  if (focusLock && focusLock.active && nowMs < focusLock.expiresAt) {
    inactive.style.display = 'none';
    active.style.display = 'block';

    function tickFocus() {
      const diff = Math.max(0, focusLock.expiresAt - Date.now());
      if (diff <= 0) {
        countdownVal.textContent = "00:00:00";
        loadBentoData();
        return;
      }
      const sec = Math.floor(diff / 1000);
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      countdownVal.textContent = `${h}:${m}:${s}`;
    }
    tickFocus();
    setInterval(tickFocus, 1000);
  } else {
    inactive.style.display = 'block';
    active.style.display = 'none';
  }
}

function renderRulesBentoGrid(rules) {
  const grid = document.getElementById('rulesBentoGrid');
  grid.innerHTML = "";

  const filtered = rules.filter(rule => {
    const cat = (rule.category || "custom").toLowerCase();
    const matchesCat = vaultCategoryFilter === "all" || cat === vaultCategoryFilter;
    const matchesSearch = !vaultSearchQuery ||
      (rule.name || "").toLowerCase().includes(vaultSearchQuery) ||
      (rule.pattern || "").toLowerCase().includes(vaultSearchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted); font-size: 13px;">NO MATCHING RESTRICTIONS FOUND.</div>`;
    return;
  }

  const now = Date.now();

  filtered.forEach(rule => {
    const card = document.createElement('div');
    card.className = 'bento-rule-card';

    // Top
    const top = document.createElement('div');
    top.className = 'rule-top';

    const info = document.createElement('div');
    const nameStr = document.createElement('div');
    nameStr.className = 'rule-name-str';
    nameStr.textContent = rule.name || rule.pattern;

    const patternPill = document.createElement('span');
    patternPill.className = 'rule-pattern-pill';
    patternPill.textContent = rule.pattern;

    const catPill = document.createElement('span');
    catPill.className = 'rule-cat-pill';
    catPill.textContent = (rule.category || 'custom').toUpperCase();

    info.appendChild(nameStr);
    info.appendChild(patternPill);
    info.appendChild(catPill);

    const isLocked = rule.lockedUntil && now < rule.lockedUntil;

    // Switch
    const switchLabel = document.createElement('label');
    switchLabel.className = 'bento-switch';
    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    switchInput.checked = rule.enabled;

    switchInput.addEventListener('change', () => {
      rule.enabled = switchInput.checked;
      chrome.runtime.sendMessage({ action: "UPDATE_RULE", rule }, (res) => {
        if (res && res.status === 'error') {
          alert(res.message);
          switchInput.checked = !switchInput.checked;
          rule.enabled = switchInput.checked;
        } else {
          showToast(`Rule updated: ${rule.name}`);
        }
        loadBentoData();
      });
    });

    const slider = document.createElement('span');
    slider.className = 'bento-slider';
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(slider);

    top.appendChild(info);
    top.appendChild(switchLabel);

    // 3-Day Commitment Status Bar
    const pledgeBar = document.createElement('div');
    pledgeBar.className = 'rule-pledge-status-bar' + (isLocked ? '' : ' milestone-ready');
    if (isLocked) {
      pledgeBar.innerHTML = `🔒 <strong>3-Day Lock:</strong> ${formatLockRemaining(rule.lockedUntil - now)}`;
    } else {
      pledgeBar.innerHTML = `🌟 <strong>Milestone Completed!</strong> Check-in prompt will appear when visiting this site.`;
    }

    // Body
    const body = document.createElement('div');
    body.className = 'rule-body';
    let scheduleInfo = "";
    if (rule.mode === 'schedule') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const activeDays = (rule.days || []).map(d => days[d]).join(', ');
      scheduleInfo = `<strong>Curfew Window:</strong> ${rule.startTime} → ${rule.endTime}<br><strong>Active Days:</strong> ${activeDays}`;
    } else if (rule.mode === 'countdown') {
      scheduleInfo = `<strong>Mode:</strong> Temporary Sprint Lock`;
    } else {
      scheduleInfo = `<strong>Mode:</strong> Permanent Cognitive Wall`;
    }

    if (rule.customMessage) {
      scheduleInfo += `<div class="rule-quote">"${escapeHtml(rule.customMessage)}"</div>`;
    }
    body.innerHTML = scheduleInfo;

    // Footer
    const footer = document.createElement('div');
    footer.className = 'rule-footer';
    const idSpan = document.createElement('span');
    idSpan.className = 'rule-id';
    idSpan.textContent = `ID: #${rule.id.slice(-6)}`;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-rule-btn';
    delBtn.textContent = isLocked ? '🔒 Locked (3 Days)' : 'Remove Restriction';
    if (isLocked) {
      delBtn.disabled = true;
      delBtn.title = 'Mandatory 3-day lock active. You cannot remove this rule until the commitment period ends.';
    } else {
      delBtn.addEventListener('click', () => {
        if (confirm(`Remove restriction for ${rule.pattern}?`)) {
          chrome.runtime.sendMessage({ action: "DELETE_RULE", ruleId: rule.id }, (res) => {
            if (res && res.status === 'error') {
              alert(res.message);
            } else {
              showToast(`Removed rule: ${rule.pattern}`);
              loadBentoData();
            }
          });
        }
      });
    }

    footer.appendChild(idSpan);
    footer.appendChild(delBtn);

    card.appendChild(top);
    card.appendChild(pledgeBar);
    card.appendChild(body);
    card.appendChild(footer);
    grid.appendChild(card);
  });
}

// Reflection Audit Logs View
function renderAuditLogs(logs) {
  const container = document.getElementById('auditLogsContainer');
  container.innerHTML = "";

  if (logs.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 28px; color: var(--text-muted); font-size: 13px; background: var(--bg-card-subtle); border-radius: var(--radius-inner);">No reflection audits submitted yet. Whenever a 3-day milestone ends and the user goes through the 7-step check-in, actual data will appear here.</div>`;
    return;
  }

  logs.forEach(log => {
    const card = document.createElement('div');
    card.className = 'audit-card';

    const header = document.createElement('div');
    header.className = 'audit-header';

    const domSpan = document.createElement('span');
    domSpan.className = 'audit-domain';
    domSpan.textContent = log.domain;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'audit-time';
    timeSpan.textContent = new Date(log.timestamp).toLocaleString();

    header.appendChild(domSpan);
    header.appendChild(timeSpan);

    const grid = document.createElement('div');
    grid.className = 'audit-grid';

    const ans = log.answers || {};

    const items = [
      { label: "1. Removal Intent", val: ans.q1_remove_intent || "Not recorded" },
      { label: "2. Trigger / Task", val: ans.q2_task_trigger || "Not recorded" },
      { label: "3. Emotional State", val: ans.q3_emotional_state || "Not recorded" },
      { label: "4. Intended Time", val: ans.q4_time_budget || "Not recorded" },
      { label: "5. Distraction Risk", val: ans.q5_scroll_risk || "Not recorded" },
      { label: "6. Offline Alternative", val: ans.q6_offline_alternative || "Not recorded" }
    ];

    items.forEach(item => {
      const block = document.createElement('div');
      block.className = 'audit-item';
      block.innerHTML = `<strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.val.replace(/_/g, ' '))}</span>`;
      grid.appendChild(block);
    });

    const actionTag = document.createElement('div');
    actionTag.className = 'audit-action-tag';
    if (log.finalAction === 'relock_3d') {
      actionTag.className += ' action-relock';
      actionTag.textContent = 'Action: Re-Armed 3-Day Lock (Pledge Renewed)';
    } else if (log.finalAction === 'grace_1h') {
      actionTag.className += ' action-grace';
      actionTag.textContent = 'Action: 1-Hour Focus Grace Pass';
    } else {
      actionTag.className += ' action-remove';
      actionTag.textContent = 'Action: Restriction Removed';
    }

    card.appendChild(header);
    card.appendChild(grid);
    card.appendChild(actionTag);
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

// Form Handlers
function setupBentoForm() {
  const form = document.getElementById('bentoRuleForm');
  const modeCards = document.querySelectorAll('.bento-mode-card');
  const timesBox = document.getElementById('scheduleTimesBox');
  const countdownBox = document.getElementById('countdownDurationBox');

  modeCards.forEach(card => {
    card.addEventListener('click', () => {
      modeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      radio.checked = true;

      if (radio.value === 'schedule') {
        timesBox.style.display = 'block';
        countdownBox.style.display = 'none';
      } else if (radio.value === 'countdown') {
        timesBox.style.display = 'none';
        countdownBox.style.display = 'block';
      } else {
        timesBox.style.display = 'none';
        countdownBox.style.display = 'none';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawPattern = document.getElementById('rulePattern').value.trim();
    if (!rawPattern) return;

    const pattern = rawPattern.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
    const name = document.getElementById('ruleName').value.trim() || pattern;
    const mode = document.querySelector('input[name="ruleMode"]:checked').value;
    const customMessage = document.getElementById('customMessage').value.trim();

    const newRule = {
      id: "rule_" + Date.now(),
      name,
      pattern,
      enabled: true,
      mode,
      customMessage: customMessage || "ARE Protocol Active. Honor your 3-day commitment."
    };

    if (mode === 'schedule') {
      newRule.startTime = document.getElementById('startTime').value || "21:00";
      newRule.endTime = document.getElementById('endTime').value || "07:00";
      const checkedDays = Array.from(document.querySelectorAll('input[name="days"]:checked')).map(cb => parseInt(cb.value, 10));
      newRule.days = checkedDays.length > 0 ? checkedDays : [0, 1, 2, 3, 4, 5, 6];
    } else if (mode === 'countdown') {
      const hours = parseFloat(document.getElementById('countdownHours').value) || 2;
      newRule.expiresAt = Date.now() + hours * 3600 * 1000;
    }

    chrome.runtime.sendMessage({ action: "ADD_RULE", rule: newRule }, (res) => {
      showToast(`Rule locked for 3 days: ${pattern}`);
      form.reset();
      loadBentoData();
    });
  });
}

// Focus Shield
function setupFocusShield() {
  document.querySelectorAll('.bento-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.bento-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedFocusDuration = parseInt(chip.getAttribute('data-time'), 10);
    });
  });

  document.getElementById('activateFocusBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: "START_FOCUS_LOCK",
      durationMinutes: selectedFocusDuration
    }, () => {
      showToast(`Engaged ${selectedFocusDuration}m Focus Shield!`);
      loadBentoData();
    });
  });
}

// Presets
function setupBentoPresets() {
  function armFullSocialShield(mode, title) {
    chrome.runtime.sendMessage({
      action: "ARM_FULL_SOCIAL_SHIELD",
      mode,
      startTime: "21:00",
      endTime: "07:00"
    }, (res) => {
      if (res && res.status === "success") {
        showToast(`${title} (${res.count} sites locked for 3 days)!`);
        loadBentoData();
      }
    });
  }

  document.getElementById('quickApplyCurfewBtn')?.addEventListener('click', () => {
    armFullSocialShield("schedule", "Complete Social & Escapism Shield Armed");
  });

  document.getElementById('presetNightCurfewBtn')?.addEventListener('click', () => {
    armFullSocialShield("schedule", "Night Curfew (21:00–07:00) Armed");
  });

  document.getElementById('presetTotalBlackoutBtn')?.addEventListener('click', () => {
    if (confirm("🔒 Activate 24/7 Total Dopamine Blackout?\n\nThis locks ALL 45 social media, messaging, video, meme, forum, and streaming platforms 24/7 for 3 full days (72 hours). You will NOT be able to unlock or delete them early.")) {
      armFullSocialShield("always", "24/7 Total Dopamine Blackout Armed");
    }
  });

  document.getElementById('presetStudyBtn')?.addEventListener('click', () => {
    const studyTargets = [
      { name: "Netflix", pattern: "netflix.com", category: "streaming", mode: "always" },
      { name: "Prime Video", pattern: "primevideo.com", category: "streaming", mode: "always" },
      { name: "Disney+ Hotstar", pattern: "hotstar.com", category: "streaming", mode: "always" },
      { name: "Twitch", pattern: "twitch.tv", category: "streaming", mode: "always" },
      { name: "TikTok", pattern: "tiktok.com", category: "video", mode: "always" },
      { name: "Instagram", pattern: "instagram.com", category: "social", mode: "schedule", start: "09:00", end: "18:00" },
      { name: "YouTube & Shorts", pattern: "youtube.com", category: "video", mode: "schedule", start: "09:00", end: "18:00" },
      { name: "Pinterest (All Regions)", pattern: "pinterest.*", category: "video", mode: "schedule", start: "09:00", end: "18:00" },
      { name: "Reddit", pattern: "reddit.com", category: "forums", mode: "schedule", start: "09:00", end: "18:00" },
      { name: "Discord Web", pattern: "discord.com", category: "messaging", mode: "schedule", start: "09:00", end: "18:00" },
      { name: "Telegram Web", pattern: "telegram.org", category: "messaging", mode: "schedule", start: "09:00", end: "18:00" }
    ];

    const rulesBatch = studyTargets.map((target, i) => ({
      id: "study_" + i + "_" + Date.now(),
      name: target.name,
      pattern: target.pattern,
      category: target.category,
      enabled: true,
      mode: target.mode,
      startTime: target.start || "09:00",
      endTime: target.end || "18:00",
      days: [1, 2, 3, 4, 5],
      customMessage: "Exam & Deep Study Blockade in effect."
    }));

    chrome.runtime.sendMessage({ action: "ADD_RULES_BATCH", rules: rulesBatch }, () => {
      showToast("Deep Study Shield Armed under 3-day lock!");
      loadBentoData();
    });
  });
}

// Strict Mode & Reset
function setupStrictModeAndReset() {
  const strictToggle = document.getElementById('strictModeToggle');
  if (strictToggle) {
    strictToggle.addEventListener('change', () => {
      chrome.storage.local.set({ strictMode: strictToggle.checked }, () => {
        showToast(`Strict Mode ${strictToggle.checked ? "Enabled" : "Disabled"}`);
      });
    });
  }

  document.getElementById('resetStatsBtn').addEventListener('click', () => {
    if (confirm("Reset interception statistics back to 0?")) {
      const stats = {
        totalBlocked: 0,
        todayBlocked: 0,
        commitmentsHonored: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      chrome.storage.local.set({ stats }, () => {
        showToast("Stats reset.");
        loadBentoData();
      });
    }
  });
}

function setupAuditLogsClear() {
  document.getElementById('clearAuditLogsBtn')?.addEventListener('click', () => {
    if (confirm("Clear all reflection audit history?")) {
      chrome.runtime.sendMessage({ action: "CLEAR_REFLECTION_LOGS" }, () => {
        showToast("Reflection audit logs cleared.");
        loadBentoData();
      });
    }
  });
}
