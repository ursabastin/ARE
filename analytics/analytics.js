// ARE Analytics Controller — Cozy Behavioral Telemetry & SaaS Showcase

let currentMode = "live"; // 'live' | 'demo'
let livePayload = null;

document.addEventListener('DOMContentLoaded', () => {
  setupModeToggle();
  setupExportButton();
  fetchLiveState();
});

function setupModeToggle() {
  const btnLive = document.getElementById('btnModeLive');
  const btnDemo = document.getElementById('btnModeDemo');
  const demoBanner = document.getElementById('demoBanner');

  btnLive?.addEventListener('click', () => {
    currentMode = "live";
    btnLive.classList.add('active');
    btnDemo.classList.remove('active');
    if (demoBanner) demoBanner.style.display = 'none';
    renderDashboard();
  });

  btnDemo?.addEventListener('click', () => {
    currentMode = "demo";
    btnDemo.classList.add('active');
    btnLive.classList.remove('active');
    if (demoBanner) demoBanner.style.display = 'block';
    renderDashboard();
  });
}

function fetchLiveState() {
  chrome.runtime.sendMessage({ action: "GET_STATE" }, (res) => {
    if (!res || !res.state) return;
    livePayload = {
      state: res.state,
      incognitoAllowed: !!res.incognitoAllowed,
      catalogCount: res.catalogCount || 119
    };
    renderDashboard();
  });
}

function getLocalDateKey(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generates a realistic 14-day illustrative dataset strictly for Product Demo Preview
function buildDemoPayload() {
  const dailyHistory = {};
  const counts = [28, 24, 21, 19, 16, 15, 13, 12, 11, 9, 8, 7, 6, 4];
  const now = new Date();
  let totalBlocked = 0;
  let incognitoBlocked = 0;
  let savedMins = 0;

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getLocalDateKey(d);
    const b = counts[13 - i];
    const inc = Math.max(0, Math.round(b * 0.28));
    const sm = b * 22;
    dailyHistory[key] = {
      blocked: b,
      incognito: inc,
      savedMinutes: sm,
      focusMinutes: (i % 2 === 0 ? 90 : 45)
    };
    totalBlocked += b;
    incognitoBlocked += inc;
    savedMins += sm;
  }

  return {
    incognitoAllowed: true,
    state: {
      rules: new Array(119).fill({ enabled: true }),
      stats: {
        totalBlocked,
        todayBlocked: 4,
        normalBlocked: totalBlocked - incognitoBlocked,
        incognitoBlocked,
        estimatedSavedMinutes: savedMins,
        focusMinutesCompleted: 945,
        focusSessionsCount: 16,
        commitmentsHonored: 8,
        dailyHistory,
        hourlyDistribution: [
          22, 18, 12, 5, 2, 1, 2, 4,
          5, 6, 7, 6, 8, 9, 7, 6,
          8, 9, 10, 12, 14, 19, 25, 29
        ],
        categoryCounts: {
          social: 54,
          video: 42,
          adult: 29,
          streaming: 24,
          forums: 18,
          messaging: 14,
          gaming: 8,
          comics: 4
        },
        domainCounts: {
          "instagram.com": 38,
          "youtube.com/shorts": 27,
          "reddit.com": 18,
          "pinterest.*": 15,
          "netflix.com": 14,
          "telegram.org": 11
        }
      },
      reflectionLogs: [
        { finalAction: "relock_3d", answers: { q2_task_trigger: "habitual_reflex", q3_emotional_state: "fatigued_tired" } },
        { finalAction: "relock_3d", answers: { q2_task_trigger: "boredom_stimulation", q3_emotional_state: "restless_distracted" } },
        { finalAction: "relock_3d", answers: { q2_task_trigger: "procrastination", q3_emotional_state: "stressed_anxious" } },
        { finalAction: "grace_1h", answers: { q2_task_trigger: "important_message", q3_emotional_state: "calm_grounded" } },
        { finalAction: "relock_3d", answers: { q2_task_trigger: "habitual_reflex", q3_emotional_state: "fatigued_tired" } },
        { finalAction: "remove", answers: { q2_task_trigger: "urgent_work", q3_emotional_state: "calm_grounded" } }
      ]
    }
  };
}

function renderDashboard() {
  const payload = currentMode === "demo" ? buildDemoPayload() : (livePayload || { state: {}, incognitoAllowed: false });
  const state = payload.state || {};
  const stats = state.stats || {};
  const rules = state.rules || [];
  const logs = state.reflectionLogs || [];

  renderKPIs(stats, rules, logs, payload.incognitoAllowed);
  renderHourlyHeatmap(stats.hourlyDistribution || new Array(24).fill(0));
  renderCategoryBreakdown(stats.categoryCounts || {});
  renderDailyTrend(stats.dailyHistory || {});
  renderTopDomains(stats.domainCounts || {});
  renderPsychologicalInsights(logs);
}

function renderKPIs(stats, rules, logs, incognitoAllowed) {
  const totalBlocked = stats.totalBlocked || 0;
  const normalBlocked = stats.normalBlocked || Math.max(0, totalBlocked - (stats.incognitoBlocked || 0));
  const incognitoBlocked = stats.incognitoBlocked || 0;
  const savedMins = (stats.estimatedSavedMinutes || 0) + (stats.focusMinutesCompleted || 0);
  const hoursSaved = (savedMins / 60).toFixed(1);

  const historyDays = Math.max(1, Object.keys(stats.dailyHistory || {}).length);
  const dailySavedHrs = (savedMins / 60) / historyDays;
  const projectedYearHrs = Math.round(dailySavedHrs * 365);

  document.getElementById('kpiHoursSaved').textContent = `${hoursSaved} hrs`;
  document.getElementById('kpiYearProjection').textContent =
    projectedYearHrs > 0 ? `Annualized pace: ~${projectedYearHrs.toLocaleString()} hrs / year` : `Build daily streak to project yearly ROI`;

  document.getElementById('kpiTotalBlocks').textContent = totalBlocked.toLocaleString();
  document.getElementById('kpiIncognitoSplit').textContent = `Normal: ${normalBlocked} • Incognito: ${incognitoBlocked}`;

  const honored = stats.commitmentsHonored || 0;
  const removed = logs.filter(l => l.finalAction === 'remove').length;
  const totalDecisions = honored + logs.length;
  const defeatRate = totalDecisions === 0 ? 100 : Math.round(((totalDecisions - removed) / totalDecisions) * 100);

  document.getElementById('kpiDefeatRate').textContent = `${defeatRate}%`;
  document.getElementById('kpiCommitmentsHonored').textContent = `${honored} 3-Day Pledges Renewed`;

  const enabledRules = rules.filter(r => r.enabled).length;
  document.getElementById('kpiActiveRules').textContent = `${enabledRules} Sites`;
  document.getElementById('kpiIncognitoHealth').textContent = incognitoAllowed
    ? `🕵️ Incognito & 24/7 NSFW Guard: ON`
    : `⚠️ Enable "Allow in Incognito" in Extensions`;
}

function renderHourlyHeatmap(hourly) {
  const container = document.getElementById('hourlyHeatmap');
  container.innerHTML = "";

  const arr = Array.isArray(hourly) && hourly.length === 24 ? hourly : new Array(24).fill(0);
  const maxVal = Math.max(...arr, 1);
  let peakHour = -1;
  let peakCount = 0;

  arr.forEach((count, hour) => {
    if (count > peakCount) {
      peakCount = count;
      peakHour = hour;
    }

    const col = document.createElement('div');
    col.className = 'hour-col';

    const bar = document.createElement('div');
    const isCurfew = (hour >= 21 || hour < 7);
    bar.className = `hour-bar ${count === 0 ? 'empty' : (isCurfew ? 'curfew' : 'day')}`;

    const heightPct = count === 0 ? 3 : Math.max(8, Math.round((count / maxVal) * 100));
    bar.style.height = `${heightPct}%`;
    bar.title = `${String(hour).padStart(2, '0')}:00 — ${count} interception(s)`;

    const label = document.createElement('span');
    label.className = 'hour-label';
    label.textContent = (hour % 3 === 0) ? String(hour).padStart(2, '0') : '';

    col.appendChild(bar);
    col.appendChild(label);
    container.appendChild(col);
  });

  const peakPill = document.getElementById('peakHourInsight');
  if (peakPill) {
    if (peakHour >= 0 && peakCount > 0) {
      const ampm = peakHour === 0 ? '12 AM' : (peakHour < 12 ? `${peakHour} AM` : (peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`));
      peakPill.textContent = `Peak Risk: ${ampm} (${peakCount} hits)`;
    } else {
      peakPill.textContent = `Peak Risk: No hits yet`;
    }
  }
}

function renderCategoryBreakdown(catCounts) {
  const list = document.getElementById('categoryBreakdownList');
  list.innerHTML = "";

  const entries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    list.innerHTML = `<div class="empty-state">No intercepted categories recorded yet. When ARE stops a distraction tab, category analytics appear here.</div>`;
    return;
  }

  const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;
  const labels = {
    adult: "Adult / NSFW",
    streaming: "Movies, TV & Streams",
    gaming: "Browser & Web Games",
    comics: "Manga, Comics & Fun",
    video: "Short Video & Pinterest",
    social: "Social Media Feeds",
    messaging: "Messaging & Chat",
    forums: "Forums & Memes",
    dating: "Dating / Swiping",
    custom: "Custom Domains"
  };

  entries.slice(0, 7).forEach(([cat, count]) => {
    const pct = Math.round((count / total) * 100);
    const row = document.createElement('div');
    row.className = 'cat-row';

    row.innerHTML = `
      <div class="cat-meta">
        <span class="cat-name">${labels[cat] || cat.toUpperCase()}</span>
        <span class="cat-count">${count} (${pct}%)</span>
      </div>
      <div class="cat-track">
        <div class="cat-fill ${cat}" style="width: ${pct}%;"></div>
      </div>
    `;
    list.appendChild(row);
  });
}

function renderDailyTrend(dailyHistory) {
  const container = document.getElementById('dailyTrendChart');
  container.innerHTML = "";

  const days = [];
  const now = new Date();
  let total14 = 0;

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = getLocalDateKey(d);
    const entry = dailyHistory[key] || { blocked: 0, savedMinutes: 0 };
    total14 += entry.blocked || 0;
    days.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      blocked: entry.blocked || 0,
      savedMinutes: entry.savedMinutes || 0
    });
  }

  const maxBlocked = Math.max(...days.map(d => d.blocked), 1);

  days.forEach(day => {
    const col = document.createElement('div');
    col.className = 'trend-col';

    const val = document.createElement('span');
    val.className = 'trend-bar-val';
    val.textContent = day.blocked > 0 ? day.blocked : '';

    const bar = document.createElement('div');
    bar.className = `trend-bar ${day.blocked === 0 ? 'empty' : ''}`;
    const pct = day.blocked === 0 ? 4 : Math.max(10, Math.round((day.blocked / maxBlocked) * 100));
    bar.style.height = `${pct}%`;
    bar.title = `${day.label}: ${day.blocked} blocked (~${day.savedMinutes}m reclaimed)`;

    const dateLabel = document.createElement('span');
    dateLabel.className = 'trend-date';
    dateLabel.textContent = day.label;

    col.appendChild(val);
    col.appendChild(bar);
    col.appendChild(dateLabel);
    container.appendChild(col);
  });

  const avgPill = document.getElementById('avgDailyInsight');
  if (avgPill) {
    avgPill.textContent = `14d Avg: ${(total14 / 14).toFixed(1)} / day`;
  }
}

function renderTopDomains(domainCounts) {
  const list = document.getElementById('topDomainsList');
  list.innerHTML = "";

  const sorted = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (sorted.length === 0) {
    list.innerHTML = `<li class="empty-state">No domain hits recorded yet. Top habit triggers will rank here automatically.</li>`;
    return;
  }

  sorted.forEach(([domain, hits], idx) => {
    const li = document.createElement('li');
    li.className = 'leader-item';
    li.innerHTML = `
      <div class="leader-left">
        <span class="leader-rank">${idx + 1}</span>
        <span class="leader-domain">${escapeHtml(domain)}</span>
      </div>
      <span class="leader-hits">${hits} hits</span>
    `;
    list.appendChild(li);
  });
}

function renderPsychologicalInsights(logs) {
  const grid = document.getElementById('psychInsightsGrid');
  const badge = document.getElementById('auditCountBadge');
  if (badge) badge.textContent = `${logs.length} Audits Logged`;

  grid.innerHTML = "";

  if (logs.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No 7-step reflection audits submitted yet. After a 3-day milestone expires, any reflection check-in data will automatically populate emotional & trigger analytics here.</div>`;
    return;
  }

  const emotions = {};
  const triggers = {};
  const outcomes = { "Re-armed 3 Days": 0, "1-Hour Grace Pass": 0, "Removed Rule": 0 };

  logs.forEach(l => {
    const ans = l.answers || {};
    if (ans.q3_emotional_state) {
      const k = ans.q3_emotional_state.replace(/_/g, ' ');
      emotions[k] = (emotions[k] || 0) + 1;
    }
    if (ans.q2_task_trigger) {
      const k = ans.q2_task_trigger.replace(/_/g, ' ');
      triggers[k] = (triggers[k] || 0) + 1;
    }
    if (l.finalAction === 'relock_3d') outcomes["Re-armed 3 Days"] += 1;
    else if (l.finalAction === 'grace_1h') outcomes["1-Hour Grace Pass"] += 1;
    else if (l.finalAction === 'remove') outcomes["Removed Rule"] += 1;
  });

  grid.appendChild(buildPsychCard("😔 Reported Emotional States", emotions));
  grid.appendChild(buildPsychCard("⚡ Root Triggers Identified", triggers));
  grid.appendChild(buildPsychCard("🛡️ Verified Decisions", outcomes));
}

function buildPsychCard(title, mapObj) {
  const card = document.createElement('div');
  card.className = 'psych-subcard';

  const h3 = document.createElement('h3');
  h3.textContent = title;
  card.appendChild(h3);

  const entries = Object.entries(mapObj).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    const p = document.createElement('p');
    p.style.fontSize = '12px';
    p.style.color = 'var(--text-muted)';
    p.textContent = 'No entries recorded yet.';
    card.appendChild(p);
    return card;
  }

  entries.forEach(([key, val]) => {
    const row = document.createElement('div');
    row.className = 'psych-row';
    row.innerHTML = `<span class="psych-key">${escapeHtml(key)}</span><span class="psych-val">${val}</span>`;
    card.appendChild(row);
  });

  return card;
}

function setupExportButton() {
  document.getElementById('exportReportBtn')?.addEventListener('click', () => {
    const payload = currentMode === "demo" ? buildDemoPayload() : (livePayload || { state: {} });
    const exportObj = {
      product: "ARE - Autonomous Restrictor Engine",
      version: "2.2.0",
      mode: currentMode,
      exportedAt: new Date().toISOString(),
      stats: payload.state.stats || {},
      reflectionAudits: payload.state.reflectionLogs || []
    };

    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `are-analytics-report-${getLocalDateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}
