// ARE Popup Controller - Cozy 3-Day Protocol

let currentTabDomain = "";
let selectedFocusMinutes = 45;
let popupRulesCache = [];
let popupSearchQuery = "";
let popupBracketInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
  await initCurrentTab();
  await loadState();
  setupEventListeners();
});

async function initCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      const url = new URL(tab.url);
      currentTabDomain = url.hostname.replace(/^www\./, '');
      document.getElementById('currentDomain').textContent = currentTabDomain;
    } else {
      document.getElementById('currentDomain').textContent = "Internal / Browser Tab";
      disableQuickBlock();
    }
  } catch (e) {
    document.getElementById('currentDomain').textContent = "Non-Inspectable URL";
    disableQuickBlock();
  }
}

function disableQuickBlock() {
  const btn = document.getElementById('quickBlockBtn');
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }
}

async function loadState() {
  chrome.runtime.sendMessage({ action: "GET_STATE" }, (response) => {
    if (!response || !response.state) return;
    const state = response.state;

    // Render Incognito Status
    const incogBadge = document.getElementById('popupIncognitoBadge');
    if (incogBadge) {
      if (response.incognitoAllowed) {
        incogBadge.textContent = "🕵️ Incognito: ACTIVE";
        incogBadge.className = "guard-pill guard-on";
      } else {
        incogBadge.textContent = "⚠️ Incognito: OFF";
        incogBadge.className = "guard-pill guard-warn";
        incogBadge.title = "Enable 'Allow in Incognito' in chrome://extensions -> ARE -> Details";
      }
    }

    // Render Stats
    const stats = state.stats || {};
    document.getElementById('todayBlockedCount').textContent = stats.todayBlocked || 0;

    // Render Focus Lock view
    const focusLock = state.focusLock || {};
    const nowMs = Date.now();
    const isFocusActive = focusLock.active && nowMs < focusLock.expiresAt;

    const inactiveView = document.getElementById('focusInactiveView');
    const activeView = document.getElementById('focusActiveView');
    const statusBadge = document.getElementById('popupStatus');

    if (isFocusActive) {
      inactiveView.style.display = 'none';
      activeView.style.display = 'block';
      startFocusCountdown(focusLock.expiresAt);
      if (statusBadge) {
        statusBadge.textContent = "FOCUS LOCKED";
        statusBadge.style.color = "var(--terracotta)";
        statusBadge.style.background = "var(--terracotta-light)";
        statusBadge.style.borderColor = "var(--terracotta)";
      }
    } else {
      inactiveView.style.display = 'block';
      activeView.style.display = 'none';
      if (statusBadge) {
        statusBadge.textContent = "ARMED";
        statusBadge.style.color = "var(--sage-green)";
        statusBadge.style.background = "var(--sage-light)";
        statusBadge.style.borderColor = "var(--sage-border)";
      }
    }

    // Render Rules List
    popupRulesCache = state.rules || [];
    updateCurrentTabLockButton(popupRulesCache);
    renderRules(popupRulesCache);
    renderPopupBracket(response.bracketStatus, isFocusActive);
  });
}

function formatHms(ms) {
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(sec / 3600)).padStart(2, '0');
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function renderPopupBracket(bracketStatus, isFocusActive) {
  const pill = document.getElementById('popupBracketPill');
  const clock = document.getElementById('popupBracketClock');
  const sub = document.getElementById('popupBracketSub');
  const btn = document.getElementById('popupStartBracketBtn');
  if (!pill || !bracketStatus) return;

  if (popupBracketInterval) {
    clearInterval(popupBracketInterval);
    popupBracketInterval = null;
  }

  if (bracketStatus.state === 'active') {
    pill.textContent = isFocusActive ? 'PAUSED' : 'ACTIVE NOW';
    pill.className = 'bracket-pill';
    btn.style.display = 'none';
    sub.textContent = isFocusActive
      ? 'Focus Sprint active — pauses streaming until focus finishes'
      : 'Anime & streaming open • Auto-locks when 2h expires';
    const expiresAt = bracketStatus.expiresAt || (Date.now() + bracketStatus.remainingMs);
    const tickActive = () => {
      const left = Math.max(0, expiresAt - Date.now());
      clock.textContent = formatHms(left);
      clock.style.color = 'var(--sage-green)';
      if (left <= 0) loadState();
    };
    tickActive();
    popupBracketInterval = setInterval(tickActive, 1000);
  } else if (bracketStatus.state === 'exhausted') {
    pill.textContent = 'ENDED TODAY';
    pill.className = 'bracket-pill used';
    btn.style.display = 'none';
    sub.textContent = 'Daily 2h window used • Refreshes tomorrow';
    const resetAt = Date.now() + bracketStatus.resetInMs;
    const tickReset = () => {
      const left = Math.max(0, resetAt - Date.now());
      clock.textContent = `Reset ${formatHms(left)}`;
      clock.style.color = 'var(--terracotta)';
      if (left <= 0) loadState();
    };
    tickReset();
    popupBracketInterval = setInterval(tickReset, 1000);
  } else {
    pill.textContent = '2H READY';
    pill.className = 'bracket-pill';
    clock.textContent = '02:00:00';
    clock.style.color = 'var(--sage-green)';
    sub.textContent = '1 continuous 2h window today • Ends automatically';
    btn.style.display = 'inline-flex';
    btn.disabled = !!isFocusActive;
    btn.textContent = isFocusActive ? 'Focus Active' : '▶ Start 2h';
  }
}

function isDomainMatchedByRule(hostname, rawPattern) {
  const pattern = (rawPattern || "").toLowerCase().replace(/^www\./, '').trim();
  if (!pattern || !hostname) return false;
  if (pattern.endsWith('.*')) {
    const base = pattern.slice(0, -2);
    return hostname === base || hostname.startsWith(base + '.') || hostname.includes('.' + base + '.');
  }
  return hostname === pattern || hostname.endsWith('.' + pattern);
}

function updateCurrentTabLockButton(rules) {
  if (!currentTabDomain) return;
  const btn = document.getElementById('quickBlockBtn');
  if (!btn) return;
  const matched = rules.some(r => r.enabled && isDomainMatchedByRule(currentTabDomain, r.pattern));
  if (matched) {
    btn.textContent = "🔒 PLEDGED";
    btn.disabled = true;
    btn.style.opacity = '0.75';
  }
}

function startFocusCountdown(expiresAt) {
  const timerElem = document.getElementById('focusRemainingText');
  function tick() {
    const diff = Math.max(0, expiresAt - Date.now());
    if (diff <= 0) {
      timerElem.textContent = "00:00";
      loadState();
      return;
    }
    const sec = Math.floor(diff / 1000);
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    timerElem.textContent = `${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

function formatLockRemaining(ms) {
  if (ms <= 0) return "Ready for check-in";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days}d ${remHours}h left`;
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m left`;
}

function renderRules(rules) {
  const list = document.getElementById('ruleList');
  list.innerHTML = "";
  document.getElementById('ruleCount').textContent = `${rules.length} links`;

  const filtered = rules.filter(rule => {
    if (!popupSearchQuery) return true;
    return (rule.name || "").toLowerCase().includes(popupSearchQuery) ||
      (rule.pattern || "").toLowerCase().includes(popupSearchQuery);
  });

  if (filtered.length === 0) {
    list.innerHTML = `<li style="text-align: center; padding: 12px; font-size: 11px; color: var(--text-muted);">${rules.length === 0 ? "No rules active. Add a link above to begin." : "No matching links found."}</li>`;
    return;
  }

  const now = Date.now();

  filtered.forEach(rule => {
    const li = document.createElement('li');
    li.className = 'rule-item';

    const info = document.createElement('div');
    info.className = 'rule-info';

    const name = document.createElement('span');
    name.className = 'rule-name';
    name.textContent = rule.name || rule.pattern;

    const badge = document.createElement('span');
    badge.className = 'rule-pledge-badge';

    const isLocked = rule.lockedUntil && now < rule.lockedUntil;
    if (isLocked) {
      const remainingStr = formatLockRemaining(rule.lockedUntil - now);
      badge.textContent = `🔒 3-Day Lock: ${remainingStr}`;
    } else {
      badge.className += ' review-due';
      badge.textContent = `⏳ 3-Day Review Due`;
    }

    info.appendChild(name);
    info.appendChild(badge);

    // Lock indicator pill (strictly non-toggleable during 3 days)
    const lockPill = document.createElement('button');
    lockPill.className = 'lock-indicator-badge';
    if (isLocked) {
      lockPill.textContent = '🔒 PLEDGED';
      lockPill.title = 'Strict 3-Day Commitment active. Cannot be toggled or removed.';
      lockPill.addEventListener('click', () => {
        const remainingStr = formatLockRemaining(rule.lockedUntil - now);
        alert(`🔒 3-Day Commitment Pledge Active!\n\nThis restriction on "${rule.pattern}" is sealed for another ${remainingStr}.\n\nYou cannot remove or disable this link until the 72-hour period completes. Stay strong!`);
      });
    } else {
      lockPill.textContent = '⏳ REVIEW';
      lockPill.style.background = 'var(--sage-light)';
      lockPill.style.borderColor = 'var(--sage-border)';
      lockPill.style.color = 'var(--sage-green)';
      lockPill.addEventListener('click', () => {
        alert(`🌟 3-Day Period Complete!\n\nVisiting "${rule.pattern}" in your browser will present your 3-day check-in decision prompt.`);
      });
    }

    li.appendChild(info);
    li.appendChild(lockPill);
    list.appendChild(li);
  });
}

function setupEventListeners() {
  // Search filter
  document.getElementById('popupSearchInput')?.addEventListener('input', (e) => {
    popupSearchQuery = e.target.value.toLowerCase().trim();
    renderRules(popupRulesCache);
  });

  // Focus timer chips
  document.querySelectorAll('.cozy-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cozy-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedFocusMinutes = parseInt(chip.getAttribute('data-time'), 10);
    });
  });

  // Start Focus Lock
  document.getElementById('startFocusBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      action: "START_FOCUS_LOCK",
      durationMinutes: selectedFocusMinutes
    }, () => {
      loadState();
    });
  });

  // Quick Block Current Site with Mandatory 3-Day Lock
  document.getElementById('quickBlockBtn').addEventListener('click', () => {
    if (!currentTabDomain) return;

    const newRule = {
      id: "rule_" + Date.now(),
      name: currentTabDomain,
      pattern: currentTabDomain,
      enabled: true,
      mode: "schedule",
      startTime: "21:00",
      endTime: "07:00",
      days: [0, 1, 2, 3, 4, 5, 6],
      customMessage: "Night Curfew Active. Time to disconnect and rest peacefully."
    };

    chrome.runtime.sendMessage({ action: "ADD_RULE", rule: newRule }, () => {
      const btn = document.getElementById('quickBlockBtn');
      btn.textContent = "LOCKED (3 DAYS) ✓";
      btn.disabled = true;
      loadState();
    });
  });

  // Start Daily 2-Hour Streaming & Anime Bracket
  document.getElementById('popupStartBracketBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: "START_STREAMING_BRACKET" }, (res) => {
      if (res && res.status === "error") {
        alert(res.message);
      }
      loadState();
    });
  });

  // Open Analytics Dashboard
  document.getElementById('openAnalyticsBtn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('analytics/analytics.html') });
  });

  // Open Options Studio
  document.getElementById('openSettingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}
